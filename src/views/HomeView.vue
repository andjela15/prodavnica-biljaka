<script setup lang="ts">
import PlantCard from '@/components/PlantCard.vue'
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { ref } from 'vue'

const plants = ref<PlantModel[]>([]) 
const loading = ref(true)            
const error = ref(false)            
function loadPlants() {
    loading.value = true
    error.value = false
    PlantService.getAll()
        .then(data => plants.value = data)
        .catch(() => error.value = true)
        .finally(() => loading.value = false)
}

loadPlants()
</script>

<template>
    <header class="mb-4">
        <h1 class="mb-1">Šta raste ove sezone</h1>
        <p class="text-body-secondary mb-0">
            Prosetajte kroz rasadnik, pogledajte detalje i rezervisite biljku.
        </p>
    </header>

  
    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" role="status" style="color: var(--zk-green);"></div>
        <p class="mt-2">Učitavanje biljaka…</p>
    </div>

    <div v-else-if="error" class="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2">
        Biljke trenutno ne mogu da se učitaju. Proverite internet vezu.
        <button type="button" class="btn btn-sm btn-outline-primary" @click="loadPlants()">Pokušaj ponovo</button>
    </div>

    
    <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
        <div v-for="p in plants" :key="p.id" class="col">
            <PlantCard :plant="p" />
        </div>
    </div>
</template>