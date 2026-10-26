<script setup lang="ts">
import type { DeliveryType } from '@/models/order.model'
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { activeUser, UserService } from '@/services/user.service'
import { formatPrice, showReserved } from '@/utils'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const plant = ref<PlantModel | null>(null)
const notFound = ref(false)

const quantity = ref(1)
const delivery = ref<DeliveryType>('dostava')
const note = ref('')

PlantService.getById(Number(route.params.id))
    .then(data => plant.value = data)
    .catch(() => notFound.value = true)

const maxQuantity = computed(() => Math.min(plant.value?.stock_quantity ?? 1, 10))
const total = computed(() => (plant.value?.price ?? 0) * quantity.value)

function fixQuantity() {
    quantity.value = Math.min(Math.max(1, quantity.value || 1), maxQuantity.value)
}

async function reserve() {
    const p = plant.value
    if (!p || !p.is_available) return
    fixQuantity()

    UserService.addOrder({
        id: Date.now().toString(),
        plantId: p.id,
        plantName: p.name,
        imageUrl: PlantService.getImageUrl(p),
        category: p.category,
        pricePerUnit: p.price,
        quantity: quantity.value,
        delivery: delivery.value,
        note: note.value.trim(),
        status: 'rezervisano',
        rating: null,
        createdAt: new Date().toISOString()
    })

    const next = await showReserved(p.name)
    router.push(next === 'korpa' ? '/korpa' : '/')
}
</script>

<template>
    <div v-if="notFound" class="card text-center p-5">
        <h2 class="h4">Biljka nije pronađena</h2>
        <div><RouterLink to="/" class="btn btn-primary">Nazad na katalog</RouterLink></div>
    </div>

    <div v-else-if="!plant" class="text-center py-5">
        <div class="spinner-border" role="status" style="color: var(--zk-green);"></div>
    </div>

    <div v-else-if="!plant.is_available" class="card text-center p-5">
        <h2 class="h4">Biljka trenutno nije dostupna</h2>
        <p>Rezervacija nije moguća dok biljka ne bude ponovo na stanju.</p>
        <div><RouterLink to="/" class="btn btn-primary">Pogledaj druge biljke</RouterLink></div>
    </div>

    <div v-else class="row justify-content-center">
        <div class="col-12 col-lg-9">
            <RouterLink :to="`/biljka/${plant.id}`" class="d-inline-block mb-3">
                <i class="fa-solid fa-arrow-left"></i> Nazad na biljku
            </RouterLink>

            <form class="card" @submit.prevent="reserve">
                <div class="card-body p-4">
                    <h1 class="h3 mb-4">Rezervacija</h1>

                    <div class="d-flex gap-3 align-items-center mb-4">
                        <img :src="PlantService.getImageUrl(plant)" :alt="plant.image_alt"
                            class="zk-plant-img" style="width: 110px;">
                        <div>
                            <span class="zk-stamp">{{ plant.category }}</span>
                            <h2 class="h5 mt-1 mb-1">{{ plant.name }}</h2>
                            <span class="zk-price">{{ formatPrice(plant.price) }}</span>
                            <span class="text-body-secondary small"> / kom · na stanju {{ plant.stock_quantity }}</span>
                        </div>
                    </div>

                    <div class="row g-4">
                        <div class="col-12 col-sm-5">
                            <label for="r-qty" class="form-label">Količina</label>
                            <div class="input-group">
                                <button type="button" class="btn btn-outline-secondary" aria-label="Smanji količinu"
                                    :disabled="quantity <= 1" @click="quantity--">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <input id="r-qty" type="number" class="form-control text-center" min="1"
                                    :max="maxQuantity" v-model.number="quantity" @change="fixQuantity()">
                                <button type="button" class="btn btn-outline-secondary" aria-label="Povećaj količinu"
                                    :disabled="quantity >= maxQuantity" @click="quantity++">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <div class="form-text">Najviše {{ maxQuantity }} kom.</div>
                        </div>

                        <div class="col-12 col-sm-7">
                            <span class="form-label d-block">Način preuzimanja</span>
                            <div class="form-check">
                                <input id="r-del-1" class="form-check-input" type="radio" value="dostava" v-model="delivery">
                                <label class="form-check-label" for="r-del-1">
                                    Dostava na adresu
                                    <span class="d-block small text-body-secondary">{{ activeUser?.address }}</span>
                                </label>
                            </div>
                            <div class="form-check mt-1">
                                <input id="r-del-2" class="form-check-input" type="radio" value="preuzimanje" v-model="delivery">
                                <label class="form-check-label" for="r-del-2">Lično preuzimanje u rasadniku</label>
                            </div>
                        </div>

                        <div class="col-12">
                            <label for="r-note" class="form-label">
                                Napomena <span class="text-body-secondary">(nije obavezno)</span>
                            </label>
                            <textarea id="r-note" class="form-control" rows="2" maxlength="200"
                                placeholder="npr. pozovite pre dostave" v-model="note"></textarea>
                        </div>
                    </div>

                    <div class="zk-dotted mt-4 pt-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <span class="text-body-secondary">Ukupno:</span>
                            <span class="zk-price fs-1 ms-2">{{ formatPrice(total) }}</span>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fa-solid fa-basket-shopping"></i> Potvrdi rezervaciju
                        </button>
                    </div>
                    <p class="small text-body-secondary mt-3 mb-0">
                        Rezervaciju možete menjati ili otkazati u korpi dok biljka ne stigne.
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>