<script setup lang="ts">
import ProfileFields from '@/components/ProfileFields.vue'
import { PlantService } from '@/services/plant.service'
import { activeUser, UserService } from '@/services/user.service'
import { showConfirm, showToast } from '@/utils'
import { MIN_PASSWORD, validateProfile } from '@/validation'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const editing = ref(false)
const categories = ref<string[]>([])

PlantService.getAll()
    .then(plants => categories.value = PlantService.getDistinct(plants, 'category'))
    .catch(() => categories.value = activeUser.value?.favoriteTypes ?? [])

function copyProfile() {
    const u = activeUser.value!
    return {
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        address: u.address,
        favoriteTypes: [...u.favoriteTypes]
    }
}
const form = ref(copyProfile())
const errors = ref<Record<string, string>>({})

function startEdit() {
    form.value = copyProfile()
    errors.value = {}
    editing.value = true
}

function save() {
    errors.value = validateProfile(form.value)
    if (Object.keys(errors.value).length > 0) return

    UserService.updateProfile({
        ...form.value,
        firstName: form.value.firstName.trim(),
        lastName: form.value.lastName.trim(),
        phone: form.value.phone.trim(),
        address: form.value.address.trim()
    })
    editing.value = false
    showToast('Profil je sačuvan.')
}

const pass = ref({ old: '', new: '', repeat: '' })
const passError = ref('')

function changePassword() {
    passError.value = ''
    if (pass.value.new.length < MIN_PASSWORD) {
        passError.value = `Nova lozinka mora imati bar ${MIN_PASSWORD} znakova.`
        return
    }
    if (pass.value.new !== pass.value.repeat) {
        passError.value = 'Nove lozinke se ne poklapaju.'
        return
    }
    const error = UserService.changePassword(pass.value.old, pass.value.new)
    if (error) {
        passError.value = error
        return
    }
    pass.value = { old: '', new: '', repeat: '' }
    showToast('Lozinka je promenjena.')
}

async function logout() {
    if (await showConfirm('Odjava', 'Da li želite da se odjavite?', 'Odjavi me')) {
        UserService.logout()
        router.push('/')
    }
}

const reservedCount = computed(() => activeUser.value?.orders.filter(o => o.status === 'rezervisano').length ?? 0)
</script>

<template>
    <div v-if="activeUser" class="row g-4">
        <div class="col-12 col-lg-8">
            <div class="card">
                <div class="card-body p-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                        <div>
                            <h1 class="h3 mb-0">{{ activeUser.firstName }} {{ activeUser.lastName }}</h1>
                            <span class="text-body-secondary">{{ activeUser.email }}</span>
                        </div>
                        <button v-if="!editing" type="button" class="btn btn-outline-primary" @click="startEdit()">
                            <i class="fa-solid fa-pen"></i> Izmeni podatke
                        </button>
                    </div>

                    <dl v-if="!editing" class="row mb-0">
                        <dt class="col-sm-4 fw-normal text-body-secondary">Telefon</dt>
                        <dd class="col-sm-8">{{ activeUser.phone }}</dd>
                        <dt class="col-sm-4 fw-normal text-body-secondary">Adresa za dostavu</dt>
                        <dd class="col-sm-8">{{ activeUser.address }}</dd>
                        <dt class="col-sm-4 fw-normal text-body-secondary">Omiljene vrste</dt>
                        <dd class="col-sm-8 mb-0 d-flex flex-wrap gap-1">
                            <span v-for="t in activeUser.favoriteTypes" :key="t" class="zk-stamp">{{ t }}</span>
                        </dd>
                    </dl>

                    <form v-else @submit.prevent="save" novalidate>
                        <ProfileFields id-prefix="profile" :categories="categories" :errors="errors"
                            v-model:first-name="form.firstName" v-model:last-name="form.lastName"
                            v-model:phone="form.phone" v-model:address="form.address"
                            v-model:favorite-types="form.favoriteTypes" />
                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary">Sačuvaj promene</button>
                            <button type="button" class="btn btn-outline-secondary" @click="editing = false">Odustani</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-4 d-flex flex-column gap-4">
            <div class="card">
                <div class="card-body">
                    <h2 class="h5">Moja korpa</h2>
                    <p class="mb-2">
                        Rezervisano: <strong>{{ reservedCount }}</strong> ·
                        Ukupno stavki: <strong>{{ activeUser.orders.length }}</strong>
                    </p>
                    <RouterLink to="/korpa" class="btn btn-primary btn-sm">Otvori korpu</RouterLink>
                </div>
            </div>

            <form class="card" @submit.prevent="changePassword" novalidate>
                <div class="card-body">
                    <h2 class="h5">Promena lozinke</h2>
                    <div class="mb-2">
                        <label for="pass-old" class="form-label small">Trenutna lozinka</label>
                        <input id="pass-old" type="password" class="form-control form-control-sm"
                            autocomplete="current-password" v-model="pass.old">
                    </div>
                    <div class="mb-2">
                        <label for="pass-new" class="form-label small">Nova lozinka</label>
                        <input id="pass-new" type="password" class="form-control form-control-sm"
                            autocomplete="new-password" v-model="pass.new">
                    </div>
                    <div class="mb-2">
                        <label for="pass-repeat" class="form-label small">Ponovite novu lozinku</label>
                        <input id="pass-repeat" type="password" class="form-control form-control-sm"
                            autocomplete="new-password" v-model="pass.repeat">
                    </div>
                    <div v-if="passError" class="alert alert-danger py-1 px-2 small" role="alert">{{ passError }}</div>
                    <button type="submit" class="btn btn-outline-primary btn-sm"
                        :disabled="!pass.old || !pass.new || !pass.repeat">Promeni lozinku</button>
                </div>
            </form>

            <button type="button" class="btn btn-outline-danger" @click="logout()">
                <i class="fa-solid fa-right-from-bracket"></i> Odjavi se
            </button>
        </div>
    </div>
</template>