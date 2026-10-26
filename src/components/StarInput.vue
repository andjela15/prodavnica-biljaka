<script setup lang="ts">
import { ref } from 'vue'

const rating = defineModel<number>({ required: true })
const hover = ref(0)

const labels = ['', 'Loše', 'Slabo', 'Dobro', 'Vrlo dobro', 'Odlično']
</script>

<template>
    <div class="d-flex align-items-center gap-2">
        <div role="radiogroup" aria-label="Ocena" @mouseleave="hover = 0">
            <button v-for="n in 5" :key="n" type="button" class="btn btn-link p-0 me-1 zk-stars fs-4" role="radio"
                :aria-checked="rating === n" :aria-label="`${n} od 5`" @mouseenter="hover = n" @click="rating = n">
                <i :class="(hover || rating) >= n ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
            </button>
        </div>
        <span class="small text-body-secondary">{{ labels[hover || rating] }}</span>
    </div>
</template>