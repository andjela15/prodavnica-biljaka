<script setup lang="ts">
const props = defineProps<{
    value: number
    count?: number 
}>()

function starClass(position: number) {
    if (props.value >= position) return 'fa-solid fa-star'
    if (props.value >= position - 0.5) return 'fa-solid fa-star-half-stroke'
    return 'fa-regular fa-star'
}
</script>

<template>
    <span class="d-inline-flex align-items-center gap-1" :title="`Prosečna ocena ${value.toFixed(1)} od 5`">
        <span class="zk-stars" aria-hidden="true">
            <i v-for="n in 5" :key="n" :class="starClass(n)"></i>
        </span>
        <span class="fw-bold">{{ value.toFixed(1).replace('.', ',') }}</span>
        <span v-if="count !== undefined" class="text-body-secondary small">({{ count }})</span>
    </span>
</template>