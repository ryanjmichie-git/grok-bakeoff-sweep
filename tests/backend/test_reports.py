"""
Tests for reports API endpoints.
"""
import pytest


FILTER_CASES = [
    "",
    "warehouse=Tokyo",
    "category=sensors",
    "status=delivered",
    "month=2025-11",
    "month=Q4-2025",
    "warehouse=London&category=circuit boards&status=shipped",
]


class TestReportsEndpoints:
    """Test suite for reports-related endpoints."""

    def test_get_quarterly_reports(self, client):
        """Test getting quarterly reports."""
        response = client.get("/api/reports/quarterly")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        first = data[0]
        for field in ["quarter", "total_orders", "total_revenue", "avg_order_value", "fulfillment_rate"]:
            assert field in first

    def test_get_monthly_trends(self, client):
        """Test getting monthly trends."""
        response = client.get("/api/reports/monthly-trends")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        first = data[0]
        for field in ["month", "order_count", "revenue", "delivered_count"]:
            assert field in first

    @pytest.mark.parametrize("params", FILTER_CASES)
    def test_quarterly_reports_match_filtered_orders(self, client, params):
        """Test that quarterly totals equal the matching orders for each filter."""
        orders = client.get(f"/api/orders?{params}").json()
        orders_2025 = [o for o in orders if o["order_date"].startswith("2025-")]

        data = client.get(f"/api/reports/quarterly?{params}").json()

        assert sum(q["total_orders"] for q in data) == len(orders_2025)
        expected_revenue = sum(o["total_value"] for o in orders_2025)
        assert abs(sum(q["total_revenue"] for q in data) - expected_revenue) < 0.05

    @pytest.mark.parametrize("params", FILTER_CASES)
    def test_monthly_trends_match_filtered_orders(self, client, params):
        """Test that monthly totals equal the matching orders for each filter."""
        orders = client.get(f"/api/orders?{params}").json()

        data = client.get(f"/api/reports/monthly-trends?{params}").json()

        assert sum(m["order_count"] for m in data) == len(orders)
        expected_revenue = sum(o["total_value"] for o in orders)
        assert abs(sum(m["revenue"] for m in data) - expected_revenue) < 0.05

    def test_reports_respond_to_warehouse_filter(self, client):
        """Test that a warehouse filter reduces the report totals."""
        all_data = client.get("/api/reports/monthly-trends").json()
        tokyo_data = client.get("/api/reports/monthly-trends?warehouse=Tokyo").json()

        all_count = sum(m["order_count"] for m in all_data)
        tokyo_count = sum(m["order_count"] for m in tokyo_data)
        assert 0 < tokyo_count < all_count

    def test_report_revenue_is_rounded(self, client):
        """Test that revenue sums are rounded to cents."""
        quarterly = client.get("/api/reports/quarterly").json()
        monthly = client.get("/api/reports/monthly-trends").json()

        for q in quarterly:
            assert round(q["total_revenue"], 2) == q["total_revenue"]
        for m in monthly:
            assert round(m["revenue"], 2) == m["revenue"]
