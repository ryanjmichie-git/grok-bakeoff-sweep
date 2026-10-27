<template>
  <div class="orders">
    <div class="page-header">
      <h2>{{ t('orders.title') }}</h2>
      <p>{{ t('orders.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card success">
          <div class="stat-label">{{ t('status.delivered') }}</div>
          <div class="stat-value">{{ getOrdersByStatus('Delivered').length }}</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">{{ t('status.shipped') }}</div>
          <div class="stat-value">{{ getOrdersByStatus('Shipped').length }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">{{ t('status.processing') }}</div>
          <div class="stat-value">{{ getOrdersByStatus('Processing').length }}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-label">{{ t('status.backordered') }}</div>
          <div class="stat-value">{{ getOrdersByStatus('Backordered').length }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('orders.allOrders') }} ({{ orders.length }})</h3>
        </div>
        <div class="table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th class="col-order-number">{{ t('orders.table.orderNumber') }}</th>
                <th class="col-customer">{{ t('orders.table.customer') }}</th>
                <th class="col-items">{{ t('orders.table.items') }}</th>
                <th class="col-status">{{ t('orders.table.status') }}</th>
                <th class="col-date">{{ t('orders.table.orderDate') }}</th>
                <th class="col-date">{{ t('orders.table.expectedDelivery') }}</th>
                <th class="col-value">{{ t('orders.table.totalValue') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="col-order-number"><strong>{{ order.order_number }}</strong></td>
                <td class="col-customer">{{ translateCustomerName(order.customer) }}</td>
                <td class="col-items">
                  <div class="items-details">
                    <button
                      type="button"
                      class="items-summary"
                      :aria-expanded="!!openItems[order.id]"
                      @click="toggleItems(order.id)"
                    >
                      {{ t('orders.itemsCount', { count: order.items.length }) }}
                    </button>
                    <div v-if="openItems[order.id]" class="items-dropdown">
                      <div v-for="(item, idx) in order.items" :key="idx" class="item-entry">
                        <span class="item-name">{{ translateProductName(item.name) }}</span>
                        <span class="item-meta">{{ t('orders.quantity') }}: {{ item.quantity }} @ {{ currencySymbol }}{{ item.unit_price }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="col-status">
                  <span :class="['badge', getOrderStatusClass(order.status)]">
                    {{ t(`status.${order.status.toLowerCase()}`) }}
                  </span>
                </td>
                <td class="col-date">{{ formatDate(order.order_date) }}</td>
                <td class="col-date">{{ formatDate(order.expected_delivery) }}</td>
                <td class="col-value"><strong>{{ currencySymbol }}{{ order.total_value.toLocaleString() }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">{{ t('orders.submitted.title') }} ({{ submittedOrders.length }})</h3>
      </div>
      <div v-if="submittedLoading" class="loading">{{ t('common.loading') }}</div>
      <div v-else-if="submittedError" class="error" role="alert">{{ submittedError }}</div>
      <p v-else-if="submittedOrders.length === 0" class="submitted-empty">
        {{ t('orders.submitted.empty') }}
        <router-link to="/restocking">{{ t('orders.submitted.emptyLink') }}</router-link>
      </p>
      <div v-else class="table-container">
        <table class="submitted-table">
          <thead>
            <tr>
              <th>{{ t('orders.submitted.orderNumber') }}</th>
              <th>{{ t('orders.submitted.submittedDate') }}</th>
              <th>{{ t('orders.submitted.lines') }}</th>
              <th>{{ t('orders.submitted.total') }}</th>
              <th>{{ t('orders.submitted.leadTime') }}</th>
              <th>{{ t('orders.submitted.expectedDelivery') }}</th>
              <th>{{ t('orders.submitted.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="po in submittedOrders" :key="po.id">
              <td><strong>{{ po.id }}</strong></td>
              <td>{{ formatDate(po.created_date) }}</td>
              <td>{{ po.items.length }}</td>
              <td><strong>{{ formatCurrencyWithDecimals(po.total_cost, currentCurrency, 2) }}</strong></td>
              <td>{{ t('orders.submitted.leadTimeDays', { days: po.lead_time_days }) }}</td>
              <td>{{ formatDate(po.expected_delivery_date) }}</td>
              <td>
                <span class="badge info">{{ t('orders.submitted.statusSubmitted') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="submitted-caption">{{ t('orders.submitted.caption') }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { formatCurrencyWithDecimals } from '../utils/currency'

export default {
  name: 'Orders',
  setup() {
    const { t, currentCurrency, translateProductName, translateCustomerName } = useI18n()

    const currencySymbol = computed(() => {
      return currentCurrency.value === 'JPY' ? '¥' : '$'
    })
    const loading = ref(true)
    const error = ref(null)
    const orders = ref([])
    const openItems = ref({})
    const toggleItems = (id) => {
      openItems.value = { ...openItems.value, [id]: !openItems.value[id] }
    }

    // Use shared filters
    const {
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      getCurrentFilters
    } = useFilters()

    const loadOrders = async () => {
      try {
        loading.value = true
        const filters = getCurrentFilters()
        const fetchedOrders = await api.getOrders(filters)

        // Sort orders by order_date (earliest first)
        orders.value = fetchedOrders.slice().sort((a, b) => {
          if (a.order_date < b.order_date) return -1
          if (a.order_date > b.order_date) return 1
          return 0
        })
      } catch (err) {
        error.value = 'Failed to load orders: ' + err.message
      } finally {
        loading.value = false
      }
    }

    // Watch for filter changes and reload data
    watch([selectedPeriod, selectedLocation, selectedCategory, selectedStatus], () => {
      loadOrders()
    })

    const getOrdersByStatus = (status) => {
      return orders.value.filter(order => order.status === status)
    }

    const getOrderStatusClass = (status) => {
      const statusMap = {
        'Delivered': 'success',
        'Shipped': 'info',
        'Processing': 'warning',
        'Backordered': 'danger'
      }
      return statusMap[status] || 'info'
    }

    const formatDate = (dateString) => {
      const { currentLocale } = useI18n()
      const locale = currentLocale.value === 'ja' ? 'ja-JP' : 'en-US'
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Submitted restocking orders: independent of the order filters and of the main table
    const submittedOrders = ref([])
    const submittedLoading = ref(true)
    const submittedError = ref(null)

    const loadSubmittedOrders = async () => {
      submittedLoading.value = true
      submittedError.value = null
      try {
        submittedOrders.value = await api.getPurchaseOrders()
      } catch (err) {
        submittedError.value = t('orders.submitted.loadError') + ': ' + err.message
        console.error(err)
      } finally {
        submittedLoading.value = false
      }
    }

    onMounted(() => {
      loadOrders()
      loadSubmittedOrders()
    })

    return {
      openItems,
      toggleItems,
      t,
      currentCurrency,
      formatCurrencyWithDecimals,
      submittedOrders,
      submittedLoading,
      submittedError,
      loading,
      error,
      orders,
      getOrdersByStatus,
      getOrderStatusClass,
      formatDate,
      currencySymbol,
      translateProductName,
      translateCustomerName
    }
  }
}
</script>

<style scoped>
/* Fixed table layout to prevent column shifting */
.orders-table {
  table-layout: fixed;
  width: 100%;
}

/* Column widths */
.col-order-number {
  width: 130px;
}

.col-customer {
  width: 180px;
}

.col-items {
  width: 200px;
}

.col-status {
  width: 130px;
}

.col-date {
  width: 140px;
}

.col-value {
  width: 120px;
}

/* Items details styling */
.items-details {
  position: relative;
}

.items-summary {
  cursor: pointer;
  color: #1d4ed8;
  font-weight: 500;
  list-style: none;
  user-select: none;
  display: inline-block;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-weight: 500;
}

.items-summary::-webkit-details-marker {
  display: none;
}

.items-summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 0.375rem;
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.items-details[open] .items-summary::before {
  transform: rotate(90deg);
}

.items-summary:hover {
  color: #1e40af;
  text-decoration: underline;
}

.items-summary[aria-expanded="true"]::before {
  transform: rotate(90deg);
}

/* Dropdown container */
.items-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0.75rem;
  z-index: 10;
  min-width: 300px;
  max-width: 400px;
}

.item-entry {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.item-entry:last-child {
  border-bottom: none;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.item-meta {
  font-size: 0.813rem;
  color: #64748b;
}

/* Submitted orders */
.submitted-table {
  width: 100%;
}

.submitted-empty {
  color: #64748b;
  margin: 0;
}

.submitted-empty a {
  color: #0f172a;
  text-decoration: underline;
}

.submitted-empty a:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

.submitted-caption {
  color: #64748b;
  font-size: 0.8125rem;
  margin: 1rem 0 0;
}
</style>
