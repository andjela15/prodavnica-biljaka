<script setup lang="ts">
defineProps<{
    categories: string[]
    errors: Record<string, string>
    idPrefix: string
}>()

const firstName = defineModel<string>('firstName', { required: true })
const lastName = defineModel<string>('lastName', { required: true })
const phone = defineModel<string>('phone', { required: true })
const address = defineModel<string>('address', { required: true })
const favoriteTypes = defineModel<string[]>('favoriteTypes', { required: true })
</script>

<template>
    <div class="row g-3">
        <div class="col-12 col-sm-6">
            <label :for="`${idPrefix}-first`" class="form-label">Ime</label>
            <input :id="`${idPrefix}-first`" type="text" class="form-control" autocomplete="given-name"
                :class="{ 'is-invalid': errors.firstName }" v-model="firstName">
            <div class="invalid-feedback">{{ errors.firstName }}</div>
        </div>
        <div class="col-12 col-sm-6">
            <label :for="`${idPrefix}-last`" class="form-label">Prezime</label>
            <input :id="`${idPrefix}-last`" type="text" class="form-control" autocomplete="family-name"
                :class="{ 'is-invalid': errors.lastName }" v-model="lastName">
            <div class="invalid-feedback">{{ errors.lastName }}</div>
        </div>
        <div class="col-12 col-sm-6">
            <label :for="`${idPrefix}-phone`" class="form-label">Telefon</label>
            <input :id="`${idPrefix}-phone`" type="tel" class="form-control" autocomplete="tel"
                placeholder="06x xxx xxxx" :class="{ 'is-invalid': errors.phone }" v-model="phone">
            <div class="invalid-feedback">{{ errors.phone }}</div>
        </div>
        <div class="col-12 col-sm-6">
            <label :for="`${idPrefix}-address`" class="form-label">Adresa za dostavu</label>
            <input :id="`${idPrefix}-address`" type="text" class="form-control" autocomplete="street-address"
                placeholder="Ulica i broj, grad" :class="{ 'is-invalid': errors.address }" v-model="address">
            <div class="invalid-feedback">{{ errors.address }}</div>
        </div>
        <div class="col-12">
            <span class="form-label d-block">Omiljene vrste biljaka</span>
            <div class="d-flex flex-wrap gap-2">
                <template v-for="c in categories" :key="c">
                    <input type="checkbox" class="btn-check" :id="`${idPrefix}-fav-${c}`" :value="c"
                        v-model="favoriteTypes">
                    <label class="btn btn-outline-primary btn-sm rounded-pill" :for="`${idPrefix}-fav-${c}`">
                        {{ c }}
                    </label>
                </template>
            </div>
            <div v-if="errors.favoriteTypes" class="text-danger small mt-1">{{ errors.favoriteTypes }}</div>
        </div>
    </div>
</template>