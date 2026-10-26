<script setup lang="ts">
import PlantCard from '@/components/PlantCard.vue'
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { wishlist } from '@/services/wishlist.service'
import { computed, ref } from 'vue'

const plants = ref<PlantModel[]>([])
const loading = ref(true)
const error = ref(false)

PlantService.getAll()
    .then(data => plants.value = data)
    .catch(() => error.value = true)
    .finally(() => loading.value = false)

const saved = computed(() =>
    wishlist.value
        .map(id => plants.value.find(p => p.id === id))
        .filter((p): p is PlantModel => p !== undefined)
)
</script>

<template>
    <header class="mb-4">
        <h1 class="mb-1">Lista želja</h1>
        <p class="text-body-secondary mb-0">Biljke koje ste sačuvali za kasnije. Srcem ih dodajete ili uklanjate.</p>
    </header>

    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" role="status" style="color: var(--zk-green);"></div>
    </div>

    <div v-else-if="error" class="alert alert-warning">
        Biljke trenutno ne mogu da se učitaju. Pokušajte kasnije.
    </div>

    <div v-else-if="saved.length === 0" class="card text-center p-5">
        <i class="fa-regular fa-heart fa-2x mb-3" style="color: var(--zk-green);"></i>
        <h2 class="h5">Lista želja je prazna</h2>
        <p>Kliknite na srce na etiketi biljke da je sačuvate ovde.</p>
        <div><RouterLink to="/" class="btn btn-primary">Pogledaj katalog</RouterLink></div>
    </div>

    <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
        <div v-for="p in saved" :key="p.id" class="col">
            <PlantCard :plant="p" />
        </div>
    </div>
</template>