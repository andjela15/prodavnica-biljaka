<script setup lang="ts">
import PlantCard from '@/components/PlantCard.vue'
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { ReviewService } from '@/services/review.service'
import { computed, ref } from 'vue'

const plants = ref<PlantModel[]>([]) 
const loading = ref(true)            
const error = ref(false)             
const showMore = ref(false)          
function emptySearch() {
    return {
        name: '',
        description: '',
        category: '',
        plantType: '',
        climate: '',
        season: '',
        audience: '',
        dateFrom: '',
        dateTo: '',
        priceFrom: null as number | null,
        priceTo: null as number | null,
        minRating: 0,
        sort: 'name'
    }
}
const search = ref(emptySearch())

function loadPlants() {
    loading.value = true
    error.value = false
    PlantService.getAll()
        .then(data => plants.value = data)
        .catch(() => error.value = true)
        .finally(() => loading.value = false)
}
loadPlants()
const options = computed(() => ({
    category: PlantService.getDistinct(plants.value, 'category'),
    plantType: PlantService.getDistinct(plants.value, 'plant_type'),
    climate: PlantService.getDistinct(plants.value, 'climate'),
    season: PlantService.getDistinct(plants.value, 'season'),
    audience: PlantService.getDistinct(plants.value, 'target_audience')
}))
const filtered = computed(() => {
    const s = search.value
    const result = plants.value.filter(p => {
        const rating = ReviewService.getSummary(p.id).average
        const opis = `${p.description} ${p.planting_instructions} ${p.care_instructions}`.toLowerCase()

        if (s.name && !`${p.name} ${p.latin_name}`.toLowerCase().includes(s.name.toLowerCase())) return false
        if (s.description && !opis.includes(s.description.toLowerCase())) return false
        if (s.category && p.category !== s.category) return false
        if (s.plantType && p.plant_type !== s.plantType) return false
        if (s.climate && p.climate !== s.climate) return false
        if (s.season && p.season !== s.season) return false
        if (s.audience && p.target_audience !== s.audience) return false
        if (s.dateFrom && p.production_date < s.dateFrom) return false
        if (s.dateTo && p.production_date > s.dateTo) return false
        if (typeof s.priceFrom === 'number' && p.price < s.priceFrom) return false
        if (typeof s.priceTo === 'number' && p.price > s.priceTo) return false
        if (s.minRating && rating < s.minRating) return false
        return true
    })
    return result.sort((a, b) => {
        switch (s.sort) {
            case 'priceAsc': return a.price - b.price
            case 'priceDesc': return b.price - a.price
            case 'rating': return ReviewService.getSummary(b.id).average - ReviewService.getSummary(a.id).average
            case 'newest': return b.production_date.localeCompare(a.production_date)
            default: return a.name.localeCompare(b.name, 'sr')
        }
    })
})

// Koliko je kriterijuma trenutno zadato
const activeCount = computed(() => {
    const s = search.value
    const values = [s.name, s.description, s.category, s.plantType, s.climate, s.season,
        s.audience, s.dateFrom, s.dateTo, s.priceFrom, s.priceTo, s.minRating]
    return values.filter(v => v !== '' && v !== null && v !== 0).length
})

function resetSearch() {
    search.value = emptySearch()
}
</script>

<template>
    <header class="mb-4">
        <h1 class="mb-1">Šta raste ove sezone</h1>
        <p class="text-body-secondary mb-0">
            Prosetajte kroz rasadnik, pogledajte detalje i rezervisite biljku.
        </p>
    </header>

    <!-- ===== Pretraga ===== -->
    <form class="card mb-4" role="search" @submit.prevent>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-12 col-md-6 col-lg-4">
                    <label for="s-name" class="form-label">Naziv</label>
                    <input id="s-name" type="search" class="form-control" placeholder="npr. Monstera"
                        v-model="search.name">
                </div>
                <div class="col-12 col-md-6 col-lg-4">
                    <label for="s-desc" class="form-label">Opis, sadnja i nega</label>
                    <input id="s-desc" type="search" class="form-control" placeholder="npr. drenaža, sunce"
                        v-model="search.description">
                </div>
                <div class="col-12 col-md-6 col-lg-4">
                    <label for="s-category" class="form-label">Kategorija</label>
                    <select id="s-category" class="form-select" v-model="search.category">
                        <option value="">Sve kategorije</option>
                        <option v-for="o in options.category" :key="o" :value="o">{{ o }}</option>
                    </select>
                </div>
            </div>
            <div v-show="showMore" class="row g-3 mt-0">
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="s-type" class="form-label">Tip biljke</label>
                    <select id="s-type" class="form-select" v-model="search.plantType">
                        <option value="">Svi tipovi</option>
                        <option v-for="o in options.plantType" :key="o" :value="o">{{ o }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="s-climate" class="form-label">Podneblje</label>
                    <select id="s-climate" class="form-select" v-model="search.climate">
                        <option value="">Sva podneblja</option>
                        <option v-for="o in options.climate" :key="o" :value="o">{{ o }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="s-season" class="form-label">Sezona</label>
                    <select id="s-season" class="form-select" v-model="search.season">
                        <option value="">Sve sezone</option>
                        <option v-for="o in options.season" :key="o" :value="o">{{ o }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="s-audience" class="form-label">Namenjeno za</label>
                    <select id="s-audience" class="form-select" v-model="search.audience">
                        <option value="">Sve kupce</option>
                        <option v-for="o in options.audience" :key="o" :value="o">{{ o }}</option>
                    </select>
                </div>

                <div class="col-12 col-md-6 col-lg-3">
                    <span class="form-label d-block">Datum proizvodnje (od – do)</span>
                    <div class="input-group">
                        <input id="s-date-from" type="date" class="form-control" aria-label="Datum od"
                            v-model="search.dateFrom">
                        <input id="s-date-to" type="date" class="form-control" aria-label="Datum do"
                            v-model="search.dateTo">
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <span class="form-label d-block">Cena u RSD (od – do)</span>
                    <div class="input-group">
                        <input id="s-price-from" type="number" min="0" class="form-control" placeholder="od"
                            aria-label="Cena od" v-model.number="search.priceFrom">
                        <input id="s-price-to" type="number" min="0" class="form-control" placeholder="do"
                            aria-label="Cena do" v-model.number="search.priceTo">
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="s-rating" class="form-label">Recenzije kupaca</label>
                    <select id="s-rating" class="form-select" v-model.number="search.minRating">
                        <option :value="0">Bilo koja ocena</option>
                        <option :value="4.5">4,5 zvezdice i više</option>
                        <option :value="4">4 zvezdice i vise</option>
                        <option :value="3">3 zvezdice i vise</option>
                    </select>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="s-sort" class="form-label">Poredjaj po</label>
                    <select id="s-sort" class="form-select" v-model="search.sort">
                        <option value="name">Nazivu (A–Š)</option>
                        <option value="priceAsc">Ceni, od najnize</option>
                        <option value="priceDesc">Ceni, od najvise</option>
                        <option value="rating">Najbolje ocenjene</option>
                        <option value="newest">Najnovije sadnice</option>
                    </select>
                </div>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2 mt-3">
                <button type="button" class="btn btn-link px-0 me-auto" :aria-expanded="showMore"
                    @click="showMore = !showMore">
                    <i :class="showMore ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
                    {{ showMore ? 'Manje kriterijuma' : 'Više kriterijuma (tip, podneblje, datum, cena, ocena…)' }}
                </button>
                <span class="small text-body-secondary" aria-live="polite">
                    Prikazano {{ filtered.length }} od {{ plants.length }} biljaka
                </span>
                <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="activeCount === 0"
                    @click="resetSearch()">
                    <i class="fa-solid fa-rotate-left"></i> Ponisti pretragu
                    <span v-if="activeCount" class="badge text-bg-secondary ms-1">{{ activeCount }}</span>
                </button>
            </div>
        </div>
    </form>
    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" role="status" style="color: var(--zk-green);"></div>
        <p class="mt-2">Ucitavanje biljaka…</p>
    </div>

    <div v-else-if="error" class="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2">
        Biljke trenutno ne mogu da se ucitaju. Proverite internet vezu.
        <button type="button" class="btn btn-sm btn-outline-primary" @click="loadPlants()">Pokusaj ponovo</button>
    </div>

    <div v-else-if="filtered.length === 0" class="card text-center p-5">
        <i class="fa-solid fa-magnifying-glass fa-2x mb-3" style="color: var(--zk-green);"></i>
        <h2 class="h5">Nema biljaka za zadate kriterijume</h2>
        <p>Probajte da uklonite neki kriterijum ili prosirite raspon cene i datuma.</p>
        <div><button type="button" class="btn btn-primary" @click="resetSearch()">Poništi pretragu</button></div>
    </div>

    <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
        <div v-for="p in filtered" :key="p.id" class="col">
            <PlantCard :plant="p" />
        </div>
    </div>
</template>