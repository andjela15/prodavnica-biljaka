<script setup lang="ts">
import OrderCard from '@/components/OrderCard.vue'
import type { OrderStatus } from '@/models/order.model'
import { activeUser } from '@/services/user.service'
import { formatPrice, getOrderTotal, STATUS_INFO } from '@/utils'
import { computed, ref } from 'vue'

const filter = ref<OrderStatus | 'sve'>('sve')
const statuses: OrderStatus[] = ['rezervisano', 'pristiglo', 'otkazano']

const orders = computed(() =>
    [...(activeUser.value?.orders ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
)

const shown = computed(() =>
    filter.value === 'sve' ? orders.value : orders.value.filter(o => o.status === filter.value)
)

function countOf(status: OrderStatus) {
    return orders.value.filter(o => o.status === status).length
}

const total = computed(() =>
    orders.value.filter(o => o.status !== 'otkazano').reduce((sum, o) => sum + getOrderTotal(o), 0)
)
</script>

<template>
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
            <h1 class="mb-1">Korpa rezervacija</h1>
            <p class="text-body-secondary mb-0">Ovde pratite status svojih rezervacija.</p>
        </div>
        <div class="zk-tag text-end" style="height: auto; padding: 1.4rem 1.2rem .8rem;">
            <span class="small text-body-secondary">Ukupno, bez otkazanih</span>
            <span class="zk-price fs-1">{{ formatPrice(total) }}</span>
        </div>
    </div>

    <div v-if="orders.length === 0" class="card text-center p-5">
        <i class="fa-solid fa-basket-shopping fa-2x mb-3" style="color: var(--zk-green);"></i>
        <h2 class="h5">Korpa je prazna</h2>
        <p>Rezervišite biljku iz kataloga i pojaviće se ovde.</p>
        <div><RouterLink to="/" class="btn btn-primary">Pogledaj katalog</RouterLink></div>
    </div>

    <div v-else class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Prikaz po statusu">
                <button type="button" class="btn btn-sm rounded-pill"
                    :class="filter === 'sve' ? 'btn-primary' : 'btn-outline-primary'" @click="filter = 'sve'">
                    Sve ({{ orders.length }})
                </button>
                <button v-for="s in statuses" :key="s" type="button" class="btn btn-sm rounded-pill"
                    :class="filter === s ? 'btn-primary' : 'btn-outline-primary'" @click="filter = s">
                    {{ STATUS_INFO[s].label }} ({{ countOf(s) }})
                </button>
            </div>

            <div class="d-flex flex-column gap-3">
                <OrderCard v-for="o in shown" :key="o.id" :order="o" />
                <p v-if="shown.length === 0" class="text-body-secondary">Nema stavki sa ovim statusom.</p>
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card">
                <div class="card-body">
                    <h2 class="h6">Šta znače statusi?</h2>
                    <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
                        <li>
                            <span :class="`badge ${STATUS_INFO.rezervisano.css}`">Rezervisano</span>
                            Biljka je sačuvana za vas. Možete menjati količinu i način preuzimanja ili otkazati.
                        </li>
                        <li>
                            <span :class="`badge ${STATUS_INFO.pristiglo.css}`">Pristiglo</span>
                            Biljka je stigla. Možete je oceniti ili ukloniti iz korpe.
                        </li>
                        <li>
                            <span :class="`badge ${STATUS_INFO.otkazano.css}`">Otkazano</span>
                            Rezervacija je otkazana i ne ulazi u ukupnu cenu.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>