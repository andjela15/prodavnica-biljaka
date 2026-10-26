<script setup lang="ts">
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { formatPrice } from '@/utils'

// Etiketa jedne biljke. Biljku dobija od stranice (HomeView) preko "props".
defineProps<{ plant: PlantModel }>()
</script>

<template>
    <article class="zk-tag">
        <img :src="PlantService.getImageUrl(plant)" class="zk-plant-img mb-3" :alt="plant.image_alt">

        <div class="mb-2">
            <span class="zk-stamp">{{ plant.category }}</span>
        </div>
        <h3 class="h5 mb-0">
            <!-- stretched-link čini celu etiketu klikabilnom -->
            <RouterLink :to="`/biljka/${plant.id}`" class="stretched-link text-reset text-decoration-none">
                {{ plant.name }}
            </RouterLink>
        </h3>
        <div class="zk-latin mb-2">{{ plant.latin_name }}</div>

        <div class="small text-body-secondary mb-3">
            <i class="fa-solid fa-sun me-1"></i>{{ plant.light_requirement }}
            <span class="mx-1">·</span>
            <i class="fa-solid fa-droplet me-1"></i>{{ plant.watering }}
        </div>

        <div class="zk-dotted mt-auto pt-2 d-flex align-items-end justify-content-between gap-2">
            <span class="zk-price">{{ formatPrice(plant.price) }}</span>
            <span v-if="plant.is_available" class="small text-body-secondary">
                na stanju {{ plant.stock_quantity }}
            </span>
            <span v-else class="badge text-bg-secondary">Nema na stanju</span>
        </div>
    </article>
</template>