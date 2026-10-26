<script setup lang="ts">
import ProfileFields from '@/components/ProfileFields.vue'
import { PlantService } from '@/services/plant.service'
import { UserService } from '@/services/user.service'
import { showToast } from '@/utils'
import { MIN_PASSWORD, validateEmail, validateProfile } from '@/validation'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    favoriteTypes: [] as string[],
    password: '',
    repeatPassword: ''
})
const errors = ref<Record<string, string>>({})
const categories = ref<string[]>([])

PlantService.getAll()
    .then(plants => categories.value = PlantService.getDistinct(plants, 'category'))
    .catch(() => categories.value = ['Sobne biljke', 'Baštenske biljke', 'Rezano cveće', 'Sukulenti'])

function signup() {
    const f = form.value
    const e = validateProfile(f)

    if (!validateEmail(f.email)) e.email = 'Unesite ispravnu email adresu, npr. ime@primer.rs.'
    if (f.password.length < MIN_PASSWORD) e.password = `Lozinka mora imati bar ${MIN_PASSWORD} znakova.`
    if (f.repeatPassword !== f.password) e.repeatPassword = 'Lozinke se ne poklapaju.'

    errors.value = e
    if (Object.keys(e).length > 0) return

    const error = UserService.register({
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email,
        phone: f.phone.trim(),
        address: f.address.trim(),
        favoriteTypes: f.favoriteTypes,
        password: f.password
    })

    if (error) {
        errors.value = { email: error }
        return
    }

    showToast('Nalog je napravljen. Prijavljeni ste.')
    router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
}
</script>

<template>
    <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
            <div class="card">
                <div class="card-body p-4">
                    <h1 class="h3 mb-1">Registracija</h1>
                    <p class="text-body-secondary">Sva polja su obavezna. Podatke kasnije možete promeniti na profilu.</p>

                    <form @submit.prevent="signup" novalidate>
                        <h2 class="zk-stamp mt-3 mb-3">Lični podaci</h2>
                        <ProfileFields id-prefix="signup" :categories="categories" :errors="errors"
                            v-model:first-name="form.firstName" v-model:last-name="form.lastName"
                            v-model:phone="form.phone" v-model:address="form.address"
                            v-model:favorite-types="form.favoriteTypes" />

                        <h2 class="zk-stamp mt-4 mb-3">Podaci za prijavu</h2>
                        <div class="row g-3">
                            <div class="col-12">
                                <label for="signup-email" class="form-label">Email adresa</label>
                                <input id="signup-email" type="email" class="form-control" autocomplete="email"
                                    placeholder="ime@primer.rs" :class="{ 'is-invalid': errors.email }"
                                    v-model="form.email">
                                <div class="invalid-feedback">{{ errors.email }}</div>
                            </div>
                            <div class="col-12 col-sm-6">
                                <label for="signup-password" class="form-label">Lozinka</label>
                                <input id="signup-password" type="password" class="form-control"
                                    autocomplete="new-password" :class="{ 'is-invalid': errors.password }"
                                    v-model="form.password">
                                <div class="invalid-feedback">{{ errors.password }}</div>
                                <div v-if="!errors.password" class="form-text">Najmanje {{ MIN_PASSWORD }} znakova.</div>
                            </div>
                            <div class="col-12 col-sm-6">
                                <label for="signup-repeat" class="form-label">Ponovite lozinku</label>
                                <input id="signup-repeat" type="password" class="form-control"
                                    autocomplete="new-password" :class="{ 'is-invalid': errors.repeatPassword }"
                                    v-model="form.repeatPassword">
                                <div class="invalid-feedback">{{ errors.repeatPassword }}</div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 mt-4">Napravi nalog</button>
                    </form>

                    <p class="text-center small mt-3 mb-0">
                        Već imate nalog?
                        <RouterLink :to="{ path: '/prijava', query: route.query }">Prijavite se</RouterLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>