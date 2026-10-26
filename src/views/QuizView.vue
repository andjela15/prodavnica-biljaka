<script setup lang="ts">
import PlantCard from '@/components/PlantCard.vue'
import type { PlantModel } from '@/models/plant.model'
import { PlantService } from '@/services/plant.service'
import { computed, ref } from 'vue'

type Field = 'light_requirement' | 'watering' | 'target_audience' | 'intended_use'

const questions: { field: Field, title: string, icon: string }[] = [
    { field: 'light_requirement', title: 'Koliko svetla ima mesto gde ce biljka stajati?', icon: 'fa-sun' },
    { field: 'watering', title: 'Koliko cesto stizete da zalivate?', icon: 'fa-droplet' },
    { field: 'target_audience', title: 'Koliko iskustva imate sa biljkama?', icon: 'fa-user' },
    { field: 'intended_use', title: 'Gde vam treba biljka?', icon: 'fa-house' }
]

const plants = ref<PlantModel[]>([])
const loading = ref(true)
const error = ref(false)
const step = ref(0)
const answers = ref<Partial<Record<Field, string>>>({})

PlantService.getAll()
    .then(data => plants.value = data)
    .catch(() => error.value = true)
    .finally(() => loading.value = false)

const question = computed(() => questions[step.value])
const finished = computed(() => step.value >= questions.length)

const options = computed(() =>
    question.value ? PlantService.getDistinct(plants.value, question.value.field) : []
)

function answer(value: string) {
    if (!question.value) return
    answers.value[question.value.field] = value
    step.value++
}

function back() {
    if (step.value > 0) step.value--
}

function restart() {
    answers.value = {}
    step.value = 0
}

const results = computed(() =>
    plants.value
        .filter(p => p.is_available)
        .map(p => ({
            plant: p,
            score: questions.filter(q => answers.value[q.field] === p[q.field]).length
        }))
        .sort((a, b) => b.score - a.score || a.plant.price - b.plant.price)
        .slice(0, 3)
)
</script>

<template>
    <header class="mb-4">
        <h1 class="mb-1">Pronadji svoju biljku</h1>
        <p class="text-body-secondary mb-0">
            Odgovorite na cetiri kratka pitanja i predlozicemo biljke koje odgovaraju vasem prostoru i navikama.
        </p>
    </header>

    <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" role="status" style="color: var(--zk-green);"></div>
    </div>

    <div v-else-if="error" class="alert alert-warning">
        Biljke trenutno ne mogu da se ucitaju. Pokusajte kasnije.
    </div>

    <div v-else-if="!finished && question" class="row justify-content-center">
        <div class="col-12 col-md-9 col-lg-7">
            <div class="zk-tag" style="height: auto;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="zk-stamp">Pitanje {{ step + 1 }} od {{ questions.length }}</span>
                    <button v-if="step > 0" type="button" class="btn btn-link btn-sm p-0" @click="back()">
                        <i class="fa-solid fa-arrow-left"></i> Nazad
                    </button>
                </div>

                <div class="progress mb-4" style="height: 6px;" role="progressbar"
                    :aria-valuenow="step" aria-valuemin="0" :aria-valuemax="questions.length">
                    <div class="progress-bar" :style="`width: ${step / questions.length * 100}%; background: var(--zk-green);`"></div>
                </div>

                <h2 class="h4 mb-4">
                    <i :class="`fa-solid ${question.icon} me-2`" style="color: var(--zk-green);"></i>{{ question.title }}
                </h2>

                <div class="d-grid gap-2">
                    <button v-for="o in options" :key="o" type="button"
                        class="btn btn-lg text-start"
                        :class="answers[question.field] === o ? 'btn-primary' : 'btn-outline-primary'"
                        @click="answer(o)">
                        {{ o }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 class="h4 mb-0">Ove biljke vam najvise odgovaraju</h2>
            <button type="button" class="btn btn-outline-primary btn-sm" @click="restart()">
                <i class="fa-solid fa-rotate-left"></i> Ponovi kviz
            </button>
        </div>

        <p class="small text-body-secondary">
            Vasi odgovori:
            <span v-for="q in questions" :key="q.field" class="zk-stamp me-1">{{ answers[q.field] }}</span>
        </p>

        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            <div v-for="r in results" :key="r.plant.id" class="col">
                <div class="small fw-bold mb-2" style="color: var(--zk-green);">
                    Poklapa se {{ r.score }} od {{ questions.length }}
                </div>
                <PlantCard :plant="r.plant" />
            </div>
        </div>
    </template>
</template>