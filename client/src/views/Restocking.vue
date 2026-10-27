<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <div v-if="loading" class="loading" role="status">{{ t('restocking.loading') }}</div>
    <div v-else-if="error" class="error" role="alert">
      <p class="error-text">{{ error }}</p>
      <button type="button" class="secondary-button" @click="loadInitial">{{ t('restocking.retry') }}</button>
    </div>
    <div v-else>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.budgetTitle') }}</h3>
        </div>
        <div class="budget-control">
          <label class="budget-label" for="restock-budget">{{ t('restocking.budgetLabel') }}</label>
          <input
            id="restock-budget"
            class="budget-slider"
            type="range"
            min="0"
            :max="sliderMax"
            step="500"
            v-model.number="budget"
            :aria-valuetext="formatMoney(budget)"
          />
          <output for="restock-budget" class="budget-value">{{ formatMoney(budget) }}</output>
        </div>
        <div v-if="refreshError" class="error" role="alert">{{ refreshError }}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card info">
          <div class="stat-label">{{ t('restocking.stats.budget') }}</div>
          <div class="stat-value">{{ formatMoney(result.budget) }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">{{ t('restocking.stats.orderTotal') }}</div>
          <div class="stat-value">{{ formatPrecise(result.total_cost) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.stats.remaining') }}</div>
          <div class="stat-value">{{ formatPrecise(result.remaining) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.stats.lines') }}</div>
          <div class="stat-value">{{ result.items.length }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header header-row">
          <h3 id="restock-recommendations-title" class="card-title">{{ t('restocking.recommendations') }}</h3>
          <button
            type="button"
            class="primary-button"
            :disabled="!canPlaceOrder"
            @click="placeOrder"
          >
            {{ submitting ? t('restocking.placing') : t('restocking.placeOrder') }}
          </button>
        </div>

        <div v-if="submitError" class="error" role="alert">{{ submitError }}</div>
        <p v-if="submittedOrder" class="muted-note" role="status">
          {{ t('restocking.orderSubmitted', { id: submittedOrder.id }) }}
          <router-link to="/orders">{{ t('restocking.viewOrders') }}</router-link>
        </p>

        <p v-if="result.items.length === 0" class="empty-state">{{ t('restocking.empty') }}</p>
        <div v-else class="table-container">
          <table class="restocking-table" aria-labelledby="restock-recommendations-title">
            <thead>
              <tr>
                <th scope="col">{{ t('restocking.table.sku') }}</th>
                <th scope="col">{{ t('restocking.table.item') }}</th>
                <th scope="col">{{ t('restocking.table.trend') }}</th>
                <th scope="col" class="num">{{ t('restocking.table.forecast') }}</th>
                <th scope="col" class="num">{{ t('restocking.table.onHand') }}</th>
                <th scope="col">{{ t('restocking.table.quantity') }}</th>
                <th scope="col" class="num">{{ t('restocking.table.unitCost') }}</th>
                <th scope="col" class="num">{{ t('restocking.table.lineTotal') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in result.items" :key="item.sku">
                <td><strong>{{ item.sku }}</strong></td>
                <td>{{ translateProductName(item.name) }}</td>
                <td>
                  <span :class="['badge', item.trend]">{{ trendLabel(item.trend) }}</span>
                </td>
                <td class="num">{{ item.forecasted_demand }}</td>
                <td class="num">{{ item.on_hand === null || item.on_hand === undefined ? t('restocking.unknown') : item.on_hand }}</td>
                <td>
                  <template v-if="item.quantity < item.need">
                    {{ t('restocking.quantityOf', { quantity: item.quantity, need: item.need }) }}
                    <span class="badge warning">{{ t('restocking.partial') }}</span>
                  </template>
                  <template v-else>{{ item.quantity }}</template>
                </td>
                <td class="num">
                  {{ formatPrecise(item.unit_cost) }}
                  <div class="price-source">{{ t('restocking.priceSource.' + item.price_source) }}</div>
                </td>
                <td class="num"><strong>{{ formatPrecise(item.line_total) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 id="restock-not-recommended-title" class="card-title">{{ t('restocking.notRecommended') }} ({{ result.not_recommended.length }})</h3>
        </div>
        <p v-if="result.not_recommended.length === 0" class="empty-state">{{ t('restocking.notRecommendedEmpty') }}</p>
        <div v-else class="table-container">
          <table class="restocking-table" aria-labelledby="restock-not-recommended-title">
            <thead>
              <tr>
                <th scope="col">{{ t('restocking.table.sku') }}</th>
                <th scope="col">{{ t('restocking.notRecommendedTable.item') }}</th>
                <th scope="col">{{ t('restocking.notRecommendedTable.reason') }}</th>
                <th scope="col" class="num">{{ t('restocking.notRecommendedTable.need') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in result.not_recommended" :key="item.sku">
                <td><strong>{{ item.sku }}</strong></td>
                <td>{{ translateProductName(item.name) }}</td>
                <td>{{ t('restocking.reasons.' + item.reason) }}</td>
                <td class="num">{{ item.need }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="footnotes">
        <h4 class="footnotes-title">{{ t('restocking.footnotesTitle') }}</h4>
        <ul>
          <li>{{ t('restocking.footnotes.prices') }}</li>
          <li>{{ t('restocking.footnotes.noPrice') }}</li>
          <li>{{ t('restocking.footnotes.quantity') }}</li>
          <li>{{ t('restocking.footnotes.leadTime', { days: result.lead_time_days }) }}</li>
          <li>{{ t('restocking.footnotes.memory') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'
import { formatCurrency, formatCurrencyWithDecimals } from '../utils/currency'

const DEFAULT_BUDGET = 25000
const DEBOUNCE_MS = 250

export default {
  name: 'Restocking',
  setup() {
    const { t, currentCurrency, translateProductName } = useI18n()
    const loading = ref(true)
    const error = ref(null)
    const refreshError = ref(null)
    const submitting = ref(false)
    const submitError = ref(null)
    const submittedOrder = ref(null)

    const budget = ref(DEFAULT_BUDGET)
    const maxBudget = ref(DEFAULT_BUDGET)
    const result = ref({
      budget: DEFAULT_BUDGET,
      total_cost: 0,
      remaining: DEFAULT_BUDGET,
      max_budget: 0,
      lead_time_days: 10,
      items: [],
      not_recommended: []
    })

    const refreshing = ref(false)

    const toCents = (amount) => Math.round((Number(amount) || 0) * 100)
    const inSync = computed(() =>
      !refreshing.value && !refreshError.value && toCents(budget.value) === toCents(result.value.budget)
    )
    const canPlaceOrder = computed(() =>
      inSync.value && result.value.items.length > 0 && !submitting.value && !submittedOrder.value
    )

    const sliderMax = computed(() => Math.max(1000, Math.ceil(maxBudget.value / 1000) * 1000))

    const formatMoney = (amount) => formatCurrency(Number(amount) || 0, currentCurrency.value)
    // Whole-dollar rounding hides cents on unit costs and order totals, so show 2 decimals in USD.
    const formatPrecise = (amount) =>
      formatCurrencyWithDecimals(Number(amount) || 0, currentCurrency.value, 2)

    const trendLabel = (trend) => {
      const key = `trends.${trend}`
      const label = t(key)
      return label === key ? trend : label
    }

    // Guards against an older, slower response overwriting a newer one
    let requestId = 0
    let debounceTimer = null
    let initialized = false

    const fetchRecommendations = async (amount) => {
      const myId = ++requestId
      const data = await api.getRestockRecommendations(amount)
      if (myId !== requestId) return null
      return data
    }

    const loadInitial = async () => {
      loading.value = true
      error.value = null
      try {
        const data = await fetchRecommendations(DEFAULT_BUDGET)
        if (!data) return
        result.value = data
        maxBudget.value = data.max_budget
        budget.value = Math.min(DEFAULT_BUDGET, sliderMax.value)
        if (budget.value !== DEFAULT_BUDGET) {
          const clamped = await fetchRecommendations(budget.value)
          if (clamped) result.value = clamped
        }
      } catch (err) {
        error.value = t('restocking.loadError') + ': ' + err.message
        console.error(err)
      } finally {
        loading.value = false
        initialized = true
      }
    }

    const refresh = async () => {
      refreshError.value = null
      refreshing.value = true
      const myId = requestId + 1
      try {
        const data = await fetchRecommendations(budget.value)
        if (data) result.value = data
      } catch (err) {
        if (myId === requestId) {
          refreshError.value = t('restocking.loadError') + ': ' + err.message
          console.error(err)
        }
      } finally {
        // A newer request or pending timer keeps the page marked as out of date
        if (myId === requestId && debounceTimer === null) refreshing.value = false
      }
    }

    watch(budget, () => {
      if (!initialized) return
      submittedOrder.value = null
      submitError.value = null
      clearTimeout(debounceTimer)
      refreshing.value = true
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        refresh()
      }, DEBOUNCE_MS)
    })

    // A retry/refresh that replaces the recommendation allows a new order
    watch(result, () => {
      submittedOrder.value = null
    })

    const describeError =(err) => {
      const detail = err && err.response && err.response.data && err.response.data.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) {
        return detail.map(d => (d && d.msg) ? d.msg : '').filter(Boolean).join('; ')
      }
      return ''
    }

    const placeOrder = async () => {
      if (submitting.value || result.value.items.length === 0) return
      if (!canPlaceOrder.value) return
      submitting.value = true
      submitError.value = null
      submittedOrder.value = null
      try {
        const order = await api.createPurchaseOrder({
          budget: result.value.budget,
          items: result.value.items.map(i => ({ sku: i.sku, quantity: i.quantity }))
        })
        submittedOrder.value = order
      } catch (err) {
        const detail = describeError(err)
        submitError.value = t('restocking.orderError') + (detail ? ': ' + detail : '')
        console.error(err)
      } finally {
        submitting.value = false
        // Slider moved while sending: make sure the table catches up
        if (debounceTimer === null && !refreshing.value && toCents(budget.value) !== toCents(result.value.budget)) {
          refresh()
        }
      }
    }

    onMounted(loadInitial)

    onBeforeUnmount(() => {
      clearTimeout(debounceTimer)
    })

    return {
      t,
      currentCurrency,
      translateProductName,
      loading,
      error,
      refreshError,
      submitting,
      submitError,
      canPlaceOrder,
      loadInitial,
      submittedOrder,
      budget,
      sliderMax,
      result,
      formatMoney,
      formatPrecise,
      trendLabel,
      placeOrder
    }
  }
}
</script>

<style scoped>
/* Shared styles use #64748b here (about 4.5:1). #334155 clears 4.5:1. */
.page-header p,
.loading,
.stat-label {
  color: #334155;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.budget-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.budget-label {
  font-weight: 600;
  color: #0f172a;
}

.budget-slider {
  flex: 1 1 240px;
  min-width: 200px;
  accent-color: #0f172a;
}

.budget-slider:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 3px;
}

.budget-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  min-width: 6rem;
  text-align: right;
}

.primary-button {
  background: #0f172a;
  color: white;
  border: 1px solid #0f172a;
  border-radius: 8px;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.primary-button:hover:not(:disabled) {
  background: #1e293b;
}

.primary-button:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

.primary-button:disabled {
  background: #e2e8f0;
  border-color: #e2e8f0;
  color: #334155;
  cursor: not-allowed;
}

.price-source {
  color: #334155;
  font-size: 0.75rem;
  font-weight: 400;
}

.error-text {
  margin: 0 0 0.75rem;
}

.secondary-button {
  background: white;
  color: #0f172a;
  border: 1px solid #0f172a;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.secondary-button:hover {
  background: #f8fafc;
}

.secondary-button:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

.muted-note {
  color: #334155;
  font-size: 0.875rem;
  margin: 0 0 1rem;
}

.muted-note a {
  color: #0f172a;
  text-decoration: underline;
  margin-left: 0.5rem;
}

.muted-note a:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

.empty-state {
  color: #334155;
  padding: 1rem 0;
  margin: 0;
}

.restocking-table {
  width: 100%;
  border-collapse: collapse;
}

.restocking-table th,
.restocking-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.restocking-table th {
  background: #f8fafc;
  color: #334155;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.restocking-table .num {
  text-align: right;
}

.footnotes {
  color: #334155;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

.footnotes-title {
  font-size: 0.8125rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.footnotes ul {
  margin: 0;
  padding-left: 1.25rem;
}

.footnotes li {
  margin-bottom: 0.25rem;
}
</style>
