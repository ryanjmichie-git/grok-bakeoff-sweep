"""
Tests for restocking API endpoints: budget-based recommendations from the
demand forecast, and the orders submitted from them (in memory).
"""
from datetime import datetime, timedelta

import pytest

BUDGETS = [0, 1, 5000, 12345.67, 25000, 74788, 1000000]
TREND_RANK = {"increasing": 0, "stable": 1, "decreasing": 2}


def get_recommendations(client, budget):
    response = client.get("/api/restocking/recommendations", params={"budget": budget})
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def recommendation(client):
    """Recommendations for a $25,000 budget."""
    return get_recommendations(client, 25000)


class TestRestockingEndpoints:
    """Test suite for restocking recommendations and submitted orders."""

    @pytest.mark.parametrize("budget", BUDGETS)
    def test_recommendations_stay_within_budget(self, client, budget):
        """Test that the recommended total never goes over the budget."""
        data = get_recommendations(client, budget)
        assert data["total_cost"] <= budget
        assert abs(sum(i["line_total"] for i in data["items"]) - data["total_cost"]) < 0.01
        assert abs(data["budget"] - data["total_cost"] - data["remaining"]) < 0.01

    def test_recommendation_structure(self, recommendation):
        """Test the recommendation response structure and types."""
        for key in ["budget", "total_cost", "remaining", "max_budget", "lead_time_days", "items", "not_recommended"]:
            assert key in recommendation
        assert recommendation["lead_time_days"] == 10
        assert len(recommendation["items"]) > 0
        for item in recommendation["items"]:
            assert isinstance(item["sku"], str)
            assert isinstance(item["quantity"], int)
            assert isinstance(item["unit_cost"], (int, float))
            assert item["price_source"] in ("inventory", "catalog")
            assert item["on_hand"] is None or isinstance(item["on_hand"], int)

    def test_line_totals_match_quantity_and_unit_cost(self, recommendation):
        """Test that each line total equals quantity x unit cost."""
        for item in recommendation["items"]:
            assert 0 < item["quantity"] <= item["need"]
            assert abs(item["line_total"] - item["quantity"] * item["unit_cost"]) < 0.01

    def test_rising_demand_ranks_first(self, client):
        """Test that rising-demand items come before stable and falling ones."""
        items = get_recommendations(client, 1000000)["items"]
        ranks = [TREND_RANK[i["trend"]] for i in items]
        assert ranks == sorted(ranks)
        assert items[0]["trend"] == "increasing"

    def test_large_budget_fills_every_priced_need(self, client):
        """Test that a budget above max_budget fills all six priced needs in full."""
        data = get_recommendations(client, 1000000)
        assert len(data["items"]) == 6
        assert all(i["quantity"] == i["need"] for i in data["items"])
        assert abs(data["total_cost"] - data["max_budget"]) < 0.01

    def test_zero_budget_recommends_nothing(self, client):
        """Test that a zero budget recommends nothing and lists items as over budget."""
        data = get_recommendations(client, 0)
        assert data["items"] == []
        assert data["total_cost"] == 0
        reasons = [r["reason"] for r in data["not_recommended"]]
        assert reasons.count("over_budget") == 6

    def test_not_recommended_reasons(self, client):
        """Test that unpriced items and items covered by stock are listed with a reason."""
        data = get_recommendations(client, 1000000)
        reasons = {r["sku"]: r["reason"] for r in data["not_recommended"]}
        assert reasons == {
            "PSU-501": "stock_covers_forecast",
            "SNR-420": "no_price",
            "CTL-330": "no_price",
        }

    @pytest.mark.parametrize("budget", ["-1", "inf", "nan", "2000000000"])
    def test_invalid_budget_rejected(self, client, budget):
        """Test that a negative, infinite, NaN or over-cap budget is rejected."""
        response = client.get("/api/restocking/recommendations", params={"budget": budget})
        assert response.status_code == 422

    def test_place_order(self, client, recommendation):
        """Test placing the recommended order."""
        items = [{"sku": i["sku"], "quantity": i["quantity"]} for i in recommendation["items"]]
        response = client.post("/api/purchase-orders", json={"budget": 25000, "items": items})
        assert response.status_code == 201
        order = response.json()
        assert order["id"].startswith("PO-RS-")
        assert order["status"] == "Submitted"
        assert len(order["items"]) == len(items)
        assert abs(order["total_cost"] - recommendation["total_cost"]) < 0.01
        assert order["lead_time_days"] == 10
        created = datetime.fromisoformat(order["created_date"])
        assert datetime.fromisoformat(order["expected_delivery_date"]) - created == timedelta(days=10)

    def test_new_order_listed_first(self, client):
        """Test that a new order is listed first."""
        response = client.post("/api/purchase-orders", json={"budget": 100, "items": [{"sku": "GSK-203", "quantity": 2}]})
        assert response.status_code == 201
        listed = client.get("/api/purchase-orders").json()
        assert listed[0]["id"] == response.json()["id"]

    def test_server_sets_prices(self, client):
        """Test that a unit cost sent by the client is ignored."""
        response = client.post(
            "/api/purchase-orders",
            json={"budget": 100, "items": [{"sku": "WDG-001", "quantity": 1, "unit_cost": 0.01}]},
        )
        assert response.status_code == 201
        assert response.json()["items"][0]["unit_cost"] == 24.99

    def test_place_order_leaves_other_data_unchanged(self, client):
        """Test that an order changes no backlog flags, order counts or dashboard totals."""
        backlog_before = [(b["id"], b["has_purchase_order"]) for b in client.get("/api/backlog").json()]
        orders_before = len(client.get("/api/orders").json())
        summary_before = client.get("/api/dashboard/summary").json()

        response = client.post("/api/purchase-orders", json={"budget": 100, "items": [{"sku": "FLT-405", "quantity": 1}]})
        assert response.status_code == 201

        assert [(b["id"], b["has_purchase_order"]) for b in client.get("/api/backlog").json()] == backlog_before
        assert len(client.get("/api/orders").json()) == orders_before
        assert client.get("/api/dashboard/summary").json() == summary_before

    @pytest.mark.parametrize("payload", [
        {"budget": 1000, "items": [{"sku": "NOPE-000", "quantity": 1}]},
        {"budget": 1000, "items": [{"sku": "SNR-420", "quantity": 1}]},
        {"budget": 1000, "items": [{"sku": "WDG-001", "quantity": 0}]},
        {"budget": 1000, "items": []},
        {"budget": 1000},
        {"budget": 10, "items": [{"sku": "MTR-304", "quantity": 1}]},
        {"budget": 1000, "items": [{"sku": "WDG-001", "quantity": 1}, {"sku": "WDG-001", "quantity": 1}]},
        {"budget": -1, "items": [{"sku": "WDG-001", "quantity": 1}]},
        {"budget": 2000000000, "items": [{"sku": "WDG-001", "quantity": 1}]},
        {"budget": 1000000, "items": [{"sku": "FLT-405", "quantity": 951}]},
        {"budget": 1000, "items": [{"sku": "PSU-501", "quantity": 1}]},
    ], ids=["unknown-sku", "unpriced-sku", "zero-quantity", "no-items", "missing-items",
            "over-budget", "duplicate-sku", "negative-budget", "budget-over-cap",
            "over-forecast-need", "stock-covers-forecast"])
    def test_invalid_order_rejected(self, client, payload):
        """Test that bad input gets a 422 and stores nothing."""
        count_before = len(client.get("/api/purchase-orders").json())
        response = client.post("/api/purchase-orders", json=payload)
        assert response.status_code == 422
        assert len(client.get("/api/purchase-orders").json()) == count_before
