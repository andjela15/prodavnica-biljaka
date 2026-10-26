<script setup lang="ts">
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { ReviewService } from '@/services/review.service'
import { formatPrice } from '@/utils'
import StarRating from './StarRating.vue'
import WishButton from './WishButton.vue'

const props = defineProps<{ plant: PlantModel }>()

const summary = ReviewService.getSummary(props.plant.id)
</script>

<template>
    <article class="zk-tag">
        <WishButton :plant-id="plant.id" :plant-name="plant.name" class="zk-heart-corner" />

        <img :src="PlantService.getImageUrl(plant)" class="zk-plant-img mb-3" :alt="plant.image_alt">

        <div class="mb-2">
            <span class="zk-stamp">{{ plant.category }}</span>
        </div>
        <h3 class="h5 mb-0">
            <RouterLink :to="`/biljka/${plant.id}`" class="stretched-link text-reset text-decoration-none">
                {{ plant.name }}
            </RouterLink>
        </h3>
        <div class="zk-latin mb-2">{{ plant.latin_name }}</div>

        <div class="mb-2">
            <StarRating :value="summary.average" :count="summary.count" />
        </div>

        <div class="small text-body-secondary mb-3">
            <i class="fa-solid fa-sun me-1"></i>{{ plant.light_requirement }}
            <span class="mx-1">·</span>
            <i class="fa-solid fa-droplet me-1"></i>{{ plant.watering }}
        </div>

        <div class="zk-dotted mt-auto pt-2 d-flex align-items-center justify-content-between gap-2">
            <span class="zk-price">{{ formatPrice(plant.price) }}</span>

            <RouterLink v-if="plant.is_available" :to="`/rezervacija/${plant.id}`"
                class="btn btn-primary btn-sm position-relative" style="z-index: 2;">
                <i class="fa-solid fa-basket-shopping"></i> Rezerviši
            </RouterLink>
            <span v-else class="badge text-bg-secondary">Nema na stanju</span>
        </div>
    </article>
</template>