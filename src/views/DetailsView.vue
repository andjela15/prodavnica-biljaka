<script setup lang="ts">
import StarRating from '@/components/StarRating.vue'
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { ReviewService } from '@/services/review.service'
import { formatDate, formatPrice } from '@/utils'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = Number(route.params.id)

const plant = ref<PlantModel | null>(null)
const notFound = ref(false)

PlantService.getById(id)
    .then(data => plant.value = data)
    .catch(() => notFound.value = true)

// Recenzije i prosečna ocena
const reviews = ReviewService.getForPlant(id)
const summary = ReviewService.getSummary(id)
const features = computed(() => {
    const p = plant.value
    if (!p) return []
    return [
        { label: 'Kategorija', value: p.category, icon: 'fa-tag' },
        { label: 'Tip biljke', value: p.plant_type, icon: 'fa-seedling' },
        { label: 'Podneblje', value: p.climate, icon: 'fa-earth-europe' },
        { label: 'Sezona', value: p.season, icon: 'fa-calendar' },
        { label: 'Svetlo', value: p.light_requirement, icon: 'fa-sun' },
        { label: 'Zalivanje', value: p.watering, icon: 'fa-droplet' },
        { label: 'Namena', value: p.intended_use, icon: 'fa-house' },
        { label: 'Namenjeno za', value: p.target_audience, icon: 'fa-user' },
        { label: 'Datum proizvodnje', value: formatDate(p.production_date), icon: 'fa-calendar-check' }
    ]
})
</script>

<template>
    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><RouterLink to="/">Katalog</RouterLink></li>
            <li class="breadcrumb-item active" aria-current="page">{{ plant?.name ?? 'Biljka' }}</li>
        </ol>
    </nav>

    <div v-if="notFound" class="card text-center p-5">
        <h2 class="h4">Biljka nije pronadjena</h2>
        <p>Mozda je uklonjena iz ponude.</p>
        <div><RouterLink to="/" class="btn btn-primary">Nazad na katalog</RouterLink></div>
    </div>

    <div v-else-if="!plant" class="text-center py-5">
        <div class="spinner-border" role="status" style="color: var(--zk-green);"></div>
    </div>

    <template v-else>
        <div class="row g-4 mb-4">
            <div class="col-12 col-md-5">
                <div class="zk-tag">
                    <img :src="PlantService.getImageUrl(plant)" :alt="plant.image_alt" class="zk-plant-img">
                </div>
            </div>

            <div class="col-12 col-md-7">
                <span class="zk-stamp mb-2">{{ plant.category }}</span>
                <h1 class="mb-0">{{ plant.name }}</h1>
                <p class="zk-latin fs-5 mb-2">{{ plant.latin_name }}</p>

                <a href="#recenzije" class="d-inline-block mb-3 text-reset text-decoration-none">
                    <StarRating :value="summary.average" :count="summary.count" />
                    <span class="small ms-1 text-decoration-underline">procitaj recenzije</span>
                </a>

                <p class="lead">{{ plant.description }}</p>

                <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
                    <span class="zk-price fs-1">{{ formatPrice(plant.price) }}</span>
                    <span v-if="plant.is_available" class="badge text-bg-success">
                        <i class="fa-solid fa-check"></i> Na stanju: {{ plant.stock_quantity }} kom.
                    </span>
                    <span v-else class="badge text-bg-secondary">Trenutno nije dostupna</span>
                </div>

                                <RouterLink v-if="plant.is_available" :to="`/rezervacija/${plant.id}`" class="btn btn-primary btn-lg">
                    <i class="fa-solid fa-basket-shopping"></i> Rezervisi biljku
                </RouterLink>
                <button v-else type="button" class="btn btn-primary btn-lg" disabled>
                    <i class="fa-solid fa-basket-shopping"></i> Rezervisi biljku
                </button>
                <p v-if="!plant.is_available" class="small text-body-secondary mt-2">
                    Biljka nije na stanju, pa rezervacija trenutno nije moguca.
                </p>
            </div>
        </div>
        <div class="row g-4 mb-4">
            <div class="col-12 col-lg-7">
                <div class="card h-100">
                    <div class="card-body">
                        <h2 class="h5"><i class="fa-solid fa-trowel me-2"></i>Sadnja</h2>
                        <p>{{ plant.planting_instructions }}</p>
                        <h2 class="h5"><i class="fa-solid fa-hand-holding-droplet me-2"></i>Nega</h2>
                        <p class="mb-0">{{ plant.care_instructions }}</p>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-5">
                <div class="card h-100">
                    <div class="card-body">
                        <h2 class="h5">Karakteristike</h2>
                        <table class="table table-sm mb-0" style="--bs-table-bg: transparent;">
                            <tbody>
                                <tr v-for="f in features" :key="f.label">
                                    <th scope="row" class="fw-normal text-body-secondary">
                                        <i :class="`fa-solid ${f.icon} me-2`"></i>{{ f.label }}
                                    </th>
                                    <td class="fw-semibold">{{ f.value }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <section id="recenzije" class="card">
            <div class="card-body">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <h2 class="h5 mb-0">Recenzije kupaca</h2>
                    <StarRating :value="summary.average" :count="summary.count" />
                </div>
                <p class="small text-body-secondary">
                    Recenzije ostavljaju samo kupci kojima je biljka stigla. Svoju ocenu možete dati
                    u korpi, kad rezervisana biljka dobije status "Pristiglo".
                </p>

                <div v-for="(r, i) in reviews" :key="i" class="zk-dotted py-3">
                    <div class="d-flex flex-wrap justify-content-between gap-2">
                        <strong>{{ r.author }}</strong>
                        <span class="small text-body-secondary">{{ formatDate(r.date) }}</span>
                    </div>
                    <StarRating :value="r.rating" />
                    <p v-if="r.comment" class="mb-0 mt-1">{{ r.comment }}</p>
                </div>
            </div>
        </section>
    </template>
</template>