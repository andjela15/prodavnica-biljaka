<script setup lang="ts">
import type { DeliveryType, OrderModel } from '@/models/order.model'
import { UserService } from '@/services/user.service'
import { formatDate, formatPrice, getOrderTotal, showConfirm, showToast, showUndo, STATUS_INFO } from '@/utils'
import { ref } from 'vue'
import StarInput from './StarInput.vue'

const props = defineProps<{ order: OrderModel }>()

const editing = ref(false)
const edit = ref({ quantity: 1, delivery: 'dostava' as DeliveryType, note: '' })

function startEdit() {
    edit.value = { quantity: props.order.quantity, delivery: props.order.delivery, note: props.order.note }
    editing.value = true
}

function saveEdit() {
    UserService.updateOrder(props.order.id, {
        quantity: Math.min(Math.max(1, edit.value.quantity || 1), 10),
        delivery: edit.value.delivery,
        note: edit.value.note.trim()
    })
    editing.value = false
    showToast('Rezervacija je izmenjena.')
}

async function cancelOrder() {
    const ok = await showConfirm('Otkazati rezervaciju?',
        `${props.order.plantName} više neće biti rezervisana. Možete je kasnije ponovo rezervisati.`,
        'Otkaži rezervaciju')
    if (ok) {
        UserService.setStatus(props.order.id, 'otkazano')
        showToast('Rezervacija je otkazana.', 'info')
    }
}

function simulateArrival() {
    UserService.setStatus(props.order.id, 'pristiglo')
    showToast(`${props.order.plantName} je stigla! Sada je možete oceniti.`)
}

async function remove() {
    const ok = await showConfirm('Ukloniti iz korpe?', `${props.order.plantName} će biti uklonjena iz korpe.`, 'Ukloni')
    if (!ok) return

    const removed = UserService.removeOrder(props.order.id)
    if (removed && await showUndo('Stavka je uklonjena iz korpe.')) {
        UserService.restoreOrder(removed.order, removed.index)
        showToast('Stavka je vraćena u korpu.', 'info')
    }
}

const rating = ref(props.order.rating ?? 0)
const comment = ref('')
const rateOpen = ref(false)

function saveRating() {
    if (rating.value === 0) return
    UserService.rateOrder(props.order.id, rating.value, comment.value.trim())
    rateOpen.value = false
    showToast('Hvala! Vaša ocena je objavljena na stranici biljke.')
}
</script>

<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex gap-3">
                <RouterLink :to="`/biljka/${order.plantId}`" class="flex-shrink-0">
                    <img :src="order.imageUrl" :alt="order.plantName" class="zk-plant-img" style="width: 96px;">
                </RouterLink>

                <div class="flex-grow-1" style="min-width: 0;">
                    <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
                        <div>
                            <span class="zk-stamp">{{ order.category }}</span>
                            <h3 class="h5 mt-1 mb-1">
                                <RouterLink :to="`/biljka/${order.plantId}`" class="text-reset text-decoration-none">
                                    {{ order.plantName }}
                                </RouterLink>
                            </h3>
                        </div>
                        <span :class="`badge ${STATUS_INFO[order.status].css} fs-6`">
                            <i :class="`fa-solid ${STATUS_INFO[order.status].icon}`"></i>
                            {{ STATUS_INFO[order.status].label }}
                        </span>
                    </div>

                    <div class="small text-body-secondary mb-2">
                        Rezervisano {{ formatDate(order.createdAt) }} ·
                        {{ order.delivery === 'dostava' ? 'Dostava na adresu' : 'Lično preuzimanje' }}
                        <span v-if="order.note"> · „{{ order.note }}"</span>
                    </div>

                    <div class="d-flex flex-wrap align-items-baseline gap-2"
                        :class="{ 'text-decoration-line-through text-body-secondary': order.status === 'otkazano' }">
                        <span>{{ order.quantity }} × {{ formatPrice(order.pricePerUnit) }}</span>
                        <span class="zk-price ms-auto">{{ formatPrice(getOrderTotal(order)) }}</span>
                    </div>
                </div>
            </div>

            <form v-if="editing" class="zk-dotted mt-3 pt-3" @submit.prevent="saveEdit">
                <div class="row g-3 align-items-end">
                    <div class="col-12 col-sm-3">
                        <label :for="`e-qty-${order.id}`" class="form-label small">Količina</label>
                        <input :id="`e-qty-${order.id}`" type="number" min="1" max="10" class="form-control"
                            v-model.number="edit.quantity">
                    </div>
                    <div class="col-12 col-sm-4">
                        <label :for="`e-del-${order.id}`" class="form-label small">Način preuzimanja</label>
                        <select :id="`e-del-${order.id}`" class="form-select" v-model="edit.delivery">
                            <option value="dostava">Dostava na adresu</option>
                            <option value="preuzimanje">Lično preuzimanje</option>
                        </select>
                    </div>
                    <div class="col-12 col-sm-5">
                        <label :for="`e-note-${order.id}`" class="form-label small">Napomena</label>
                        <input :id="`e-note-${order.id}`" type="text" maxlength="200" class="form-control"
                            v-model="edit.note">
                    </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                    <button type="submit" class="btn btn-primary btn-sm">Sačuvaj izmene</button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" @click="editing = false">Odustani</button>
                </div>
            </form>

            <div v-else-if="rateOpen" class="zk-dotted mt-3 pt-3">
                <p class="mb-1 fw-semibold">Kako ste zadovoljni biljkom?</p>
                <StarInput v-model="rating" />
                <label :for="`rate-c-${order.id}`" class="form-label small mt-2">Komentar (nije obavezno)</label>
                <textarea :id="`rate-c-${order.id}`" class="form-control" rows="2" maxlength="300"
                    v-model="comment"></textarea>
                <div class="d-flex gap-2 mt-2">
                    <button type="button" class="btn btn-primary btn-sm" :disabled="rating === 0" @click="saveRating()">
                        Objavi ocenu
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" @click="rateOpen = false">Odustani</button>
                </div>
            </div>

            <div v-else class="zk-dotted d-flex flex-wrap align-items-center gap-2 mt-3 pt-3">
                <template v-if="order.status === 'rezervisano'">
                    <button type="button" class="btn btn-outline-primary btn-sm" @click="startEdit()">
                        <i class="fa-solid fa-pen"></i> Izmeni
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" @click="cancelOrder()">
                        <i class="fa-solid fa-ban"></i> Otkaži rezervaciju
                    </button>
                    <button type="button" class="btn btn-link btn-sm ms-auto text-body-secondary" @click="simulateArrival()"
                        title="Prototip nema pravu dostavu; ovim se simulira da je biljka stigla">
                        <i class="fa-solid fa-truck"></i> Simuliraj dolazak
                    </button>
                </template>

                <template v-else-if="order.status === 'pristiglo'">
                    <span v-if="order.rating" class="small me-2">
                        Vaša ocena:
                        <span class="zk-stars"><i v-for="n in order.rating" :key="n" class="fa-solid fa-star"></i></span>
                    </span>
                    <button type="button" class="btn btn-primary btn-sm" @click="rateOpen = true">
                        <i class="fa-solid fa-star"></i> {{ order.rating ? 'Promeni ocenu' : 'Oceni biljku' }}
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm ms-auto" @click="remove()">
                        <i class="fa-solid fa-trash"></i> Ukloni iz korpe
                    </button>
                </template>

                <template v-else>
                    <RouterLink :to="`/rezervacija/${order.plantId}`" class="btn btn-outline-primary btn-sm">
                        <i class="fa-solid fa-rotate-right"></i> Rezerviši ponovo
                    </RouterLink>
                    <button type="button" class="btn btn-outline-danger btn-sm ms-auto" @click="remove()">
                        <i class="fa-solid fa-trash"></i> Ukloni iz korpe
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>