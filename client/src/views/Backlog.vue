<template>
  <div class="backlog">
    <div class="page-header">
      <h2>{{ t('backlog.title') }}</h2>
      <p>{{ t('backlog.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card danger">
          <div class="stat-label">{{ t('backlog.highPriority') }}</div>
          <div class="stat-value">{{ getBacklogByPriority('high').length }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">{{ t('backlog.mediumPriority') }}</div>
          <div class="stat-value">{{ getBacklogByPriority('medium').length }}</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">{{ t('backlog.lowPriority') }}</div>
          <div class="stat-value">{{ getBacklogByPriority('low').length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('backlog.totalItems') }}</div>
          <div class="stat-value">{{ backlogItems.length }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('backlog.itemsTitle') }}</h3>
        </div>
        <div v-if="backlogItems.length === 0" class="empty-state">
          <p class="empty-state-text">{{ t('dashboard.inventoryShortages.noShortages') }}</p>
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <td class="col-head" style="font-weight: 600">{{ t('dashboard.inventoryShortages.orderId') }}</td>
                <td class="col-head" style="font-weight: 600">{{ t('dashboard.inventoryShortages.sku') }}</td>
                <td class="col-head" style="font-weight: 600">{{ t('dashboard.inventoryShortages.itemName') }}</td>
                <td class="col-head" style="font-weight: 600">{{ t('dashboard.inventoryShortages.quantityNeeded') }}</td>
                <td class="col-head" style="font-weight: 600">{{ t('dashboard.inventoryShortages.quantityAvailable') }}</td>
                <td class="col-head" style="font-weight: 600">{{ t('dashboard.inventoryShortages.shortage') }}</td>
                <td class="col-head" style="font-weight: 600">{{ t('dashboard.inventoryShortages.daysDelayed') }}</td>
                <td class="col-head" style="font-weight: 600">{{ t('dashboard.inventoryShortages.priority') }}</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in backlogItems" :key="item.id">
                <td><strong>{{ item.order_id }}</strong></td>
                <td><strong>{{ item.item_sku }}</strong></td>
                <td>{{ translateProductName(item.item_name) }}</td>
                <td>{{ item.quantity_needed }}</td>
                <td>{{ item.quantity_available }}</td>
                <td>
                  <span class="badge danger">
                    {{ Math.abs(item.quantity_needed - item.quantity_available) }} {{ t('dashboard.inventoryShortages.unitsShort') }}
                  </span>
                </td>
                <td>
                  <span :class="item.days_delayed > 7 ? 'delay-long' : 'delay-short'">
                    {{ item.days_delayed }} {{ t('dashboard.inventoryShortages.days') }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', item.priority]">
                    {{ translatePriority(item.priority) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'Backlog',
  setup() {
    const { t, translateProductName } = useI18n()
    const loading = ref(true)
    const error = ref(null)
    const allBacklogItems = ref([])
    const inventoryItems = ref([])

    // Use shared filters
    const { selectedLocation, selectedCategory, getCurrentFilters } = useFilters()

    // Filter backlog based on inventory filters
    const backlogItems = computed(() => {
      if (selectedLocation.value === 'all' && selectedCategory.value === 'all') {
        return allBacklogItems.value
      }

      // Get SKUs of items that match the filters
      const validSkus = new Set(inventoryItems.value.map(item => item.sku))
      return allBacklogItems.value.filter(b => validSkus.has(b.item_sku))
    })

    const loadBacklog = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()

        const [backlogData, inventoryData] = await Promise.all([
          api.getBacklog(),
          api.getInventory({
            warehouse: filters.warehouse,
            category: filters.category
          })
        ])

        allBacklogItems.value = backlogData
        inventoryItems.value = inventoryData
      } catch (err) {
        error.value = t('backlog.loadError') + ': ' + err.message
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const getBacklogByPriority = (priority) => {
      return backlogItems.value.filter(item => priority === 'high' ? item.priority !== 'low' : item.priority === priority)
    }

    const translatePriority = (priority) => {
      const key = String(priority).toLowerCase()
      if (['high', 'medium', 'low'].includes(key)) {
        return t(`priority.${key}`)
      }
      return priority
    }

    // Watch for filter changes and reload data
    watch([selectedLocation, selectedCategory], () => {
      loadBacklog()
    })

    onMounted(loadBacklog)

    return {
      t,
      loading,
      error,
      backlogItems,
      getBacklogByPriority,
      translatePriority,
      translateProductName
    }
  }
}
</script>

<style scoped>
.empty-state {
  padding: 3rem;
  text-align: center;
}

.empty-state-text {
  font-size: 1.125rem;
  color: #64748b;
  font-weight: 600;
}

.delay-long {
  color: #dc2626;
  font-weight: 600;
}

.delay-short {
  color: #b45309;
}
</style>
