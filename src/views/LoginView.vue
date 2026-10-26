<script setup lang="ts">
import { UserService } from '@/services/user.service'
import { showToast } from '@/utils'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')

const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'

function login() {
    error.value = ''
    if (!email.value || !password.value) {
        error.value = 'Unesite email adresu i lozinku.'
        return
    }

    if (UserService.login(email.value, password.value)) {
        showToast(`Dobro došli, ${UserService.getActiveUser()?.firstName}!`)
        router.push(redirect)
    } else {
        error.value = 'Email adresa ili lozinka nisu tačni. Proverite unos i pokušajte ponovo.'
    }
}
</script>

<template>
    <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-5">
            <div class="card">
                <div class="card-body p-4">
                    <h1 class="h3 mb-1">Prijava</h1>
                    <p class="text-body-secondary">Prijavite se da biste rezervisali biljke i videli svoju korpu.</p>

                    <div v-if="route.query.redirect" class="alert alert-info py-2 small" role="status">
                        <i class="fa-solid fa-circle-info"></i> Za ovu radnju potrebno je da budete prijavljeni.
                    </div>

                    <form @submit.prevent="login" novalidate>
                        <div class="mb-3">
                            <label for="login-email" class="form-label">Email adresa</label>
                            <input id="login-email" type="email" class="form-control" autocomplete="email"
                                placeholder="ime@primer.rs" v-model="email">
                        </div>
                        <div class="mb-3">
                            <label for="login-password" class="form-label">Lozinka</label>
                            <div class="input-group">
                                <input id="login-password" :type="showPassword ? 'text' : 'password'"
                                    class="form-control" autocomplete="current-password" v-model="password">
                                <button type="button" class="btn btn-outline-secondary"
                                    :aria-label="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
                                    @click="showPassword = !showPassword">
                                    <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                                </button>
                            </div>
                        </div>

                        <div v-if="error" class="alert alert-danger py-2 small" role="alert">{{ error }}</div>

                        <button type="submit" class="btn btn-primary w-100">Prijavi se</button>
                    </form>

                    <p class="text-center small mt-3 mb-0">
                        Nemate nalog?
                        <RouterLink :to="{ path: '/registracija', query: route.query }">Registrujte se</RouterLink>
                    </p>
                </div>
            </div>

            <p class="small text-body-secondary text-center mt-3">
                Probni nalog: <strong>ana@primer.rs</strong> / <strong>ana12345</strong>
            </p>
        </div>
    </div>
</template>