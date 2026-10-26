<script setup lang="ts">
import { WishlistService, wishlist } from '@/services/wishlist.service'
import { showToast } from '@/utils'
import { computed } from 'vue'

const props = defineProps<{ plantId: number, plantName: string }>()

const saved = computed(() => wishlist.value.includes(props.plantId))

function toggle() {
    const added = WishlistService.toggle(props.plantId)
    showToast(added ? `${props.plantName} je dodata u listu želja.` : `${props.plantName} je uklonjena iz liste želja.`, 'info')
}
</script>

<template>
    <button type="button" class="zk-heart" :class="{ 'is-saved': saved }" :aria-pressed="saved"
        :aria-label="saved ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'"
        :title="saved ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'" @click="toggle()">
        <i :class="saved ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
    </button>
</template>