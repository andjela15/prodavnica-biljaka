<script setup lang="ts">
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { ref } from 'vue'

// Lista biljaka. "ref" znači da Vue prati promenljivu
// i sam osveži stranicu kad se ona promeni.
const plants = ref<PlantModel[]>([])

// Čim se stranica otvori, pitaj API za biljke
PlantService.getAll().then(data => plants.value = data)
</script>

<template>
    <h1>Katalog biljaka</h1>
    <p v-if="plants.length == 0">Učitavanje...</p>

    <!-- v-for ponavlja ovaj blok za svaku biljku -->
    <div v-for="p in plants" :key="p.id">
        <img :src="PlantService.getImageUrl(p)" :alt="p.image_alt" width="120">
        <h3>{{ p.name }}</h3>
        <p>{{ p.category }} · {{ p.price }} RSD</p>
    </div>
</template>