<script setup lang="ts">
import { PlantService } from '@/services/plant.service'
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Option {
    label: string
    next?: string
    link?: string
}
interface DialogNode {
    text: string
    options: Option[]
    keywords?: string[]
}
interface Message {
    id: number
    from: 'bot' | 'user'
    text: string
    links?: { label: string, to: string }[]
}

const tree: Record<string, DialogNode> = {
    start: {
        text: 'Zdravo! Ja sam Lista, pomocnica Zelenog kutka. Izaberite temu ili napisite pitanje.',
        options: [
            { label: 'Kako da rezervisem biljku?', next: 'rezervacija' },
            { label: 'Sta znace statusi u korpi?', next: 'statusi' },
            { label: 'Saveti za negu', next: 'nega' },
            { label: 'Biljke za pocetnike', next: 'pocetnici' },
            { label: 'Nalog i profil', next: 'nalog' }
        ]
    },
    rezervacija: {
        keywords: ['rezerv', 'kupi', 'naruc', 'poruc'],
        text: 'Na etiketi ili stranici biljke kliknite "Rezervisi", izaberite kolicinu i nacin preuzimanja, pa potvrdite. Biljka se pojavljuje u korpi sa statusom "Rezervisano". Za rezervaciju morate biti prijavljeni.',
        options: [
            { label: 'Otvori katalog', link: '/' },
            { label: 'Mogu li da izmenim rezervaciju?', next: 'izmena' },
            { label: 'Kako se placa?', next: 'placanje' }
        ]
    },
    izmena: {
        keywords: ['izmen', 'promen', 'otkaz'],
        text: 'Dok je biljka u statusu "Rezervisano", u korpi mozete promeniti kolicinu, nacin preuzimanja i napomenu, ili otkazati rezervaciju. Kad biljka stigne, izmena vise nije moguca.',
        options: [{ label: 'Otvori korpu', link: '/korpa' }]
    },
    placanje: {
        keywords: ['plac', 'plat', 'cena', 'kosta'],
        text: 'Rezervacija se ne placa unapred. Placate pri preuzimanju u rasadniku ili kuriru pri dostavi. Ukupna cena svih rezervacija uvek pise na vrhu korpe.',
        options: [{ label: 'Otvori korpu', link: '/korpa' }]
    },
    statusi: {
        keywords: ['status', 'korp', 'stigl', 'pristig'],
        text: 'Rezervisano: biljka je sacuvana za vas i mozete je menjati ili otkazati.\nPristiglo: biljka je stigla, pa je mozete oceniti ili ukloniti iz korpe.\nOtkazano: rezervacija je otkazana i ne ulazi u ukupnu cenu.',
        options: [
            { label: 'Kako da ocenim biljku?', next: 'ocena' },
            { label: 'Otvori korpu', link: '/korpa' }
        ]
    },
    ocena: {
        keywords: ['ocen', 'recenz', 'zvezd'],
        text: 'Ocenu mozete dati samo biljci koju ste rezervisali i koja ima status "Pristiglo". U korpi kliknite "Oceni biljku", izaberite broj zvezdica i po zelji napisite komentar. Ocena se pojavljuje na stranici biljke.',
        options: [{ label: 'Otvori korpu', link: '/korpa' }]
    },
    nega: {
        keywords: ['neg', 'zaliv', 'svetl', 'sunc', 'presad'],
        text: 'O cemu zelite savet?',
        options: [
            { label: 'Zalivanje', next: 'zalivanje' },
            { label: 'Svetlo', next: 'svetlo' },
            { label: 'Presadjivanje', next: 'presadjivanje' }
        ]
    },
    zalivanje: {
        text: 'Vecinu sobnih biljaka zalivajte kad se gornji sloj zemlje prosusi. Gurnite prst 2 cm u zemlju, ako je suvo, vreme je. Vise biljaka propadne od previse nego od premalo vode. Tacan savet za svaku biljku pise na njenoj stranici pod "Nega".',
        options: [{ label: 'Svetlo', next: 'svetlo' }, { label: 'Presadjivanje', next: 'presadjivanje' }]
    },
    svetlo: {
        text: '"Puno sunca" znaci juzni prozor ili basta, "polusenka" svetla soba bez direktnog podnevnog sunca, a "senka" deo prostorije dalje od prozora. Na etiketi svake biljke pise koliko joj svetla treba.',
        options: [{ label: 'Zalivanje', next: 'zalivanje' }, { label: 'Presadjivanje', next: 'presadjivanje' }]
    },
    presadjivanje: {
        text: 'Presadjujte u prolece, u saksiju 2 do 4 cm siru od stare, sa otvorima za drenazu. Posle presadjivanja biljku zalijte i drzite je nedelju dana dalje od jakog sunca.',
        options: [{ label: 'Zalivanje', next: 'zalivanje' }, { label: 'Svetlo', next: 'svetlo' }]
    },
    pocetnici: {
        keywords: ['pocetn', 'lak', 'jednostav', 'preporu'],
        text: 'Evo biljaka koje su namenjene pocetnicima:',
        options: [{ label: 'Otvori katalog', link: '/' }]
    },
    nalog: {
        keywords: ['nalog', 'profil', 'prijav', 'registr', 'lozink'],
        text: 'Katalog i recenzije mozete gledati bez naloga. Za rezervaciju i korpu potrebna je prijava. Podatke i lozinku menjate na stranici Profil.',
        options: [
            { label: 'Prijava', link: '/prijava' },
            { label: 'Registracija', link: '/registracija' },
            { label: 'Profil', link: '/profil' }
        ]
    },
    nepoznato: {
        text: 'Nisam sigurna da sam razumela pitanje. Izaberite jednu od tema:',
        options: []
    }
}

const router = useRouter()
const isOpen = ref(false)
const input = ref('')
const messages = ref<Message[]>([])
const current = ref('start')
const messagesBox = ref<HTMLElement | null>(null)
let nextId = 1

function normalize(text: string) {
    return text.toLowerCase()
        .replace(/[čć]/g, 'c')
        .replace(/š/g, 's')
        .replace(/ž/g, 'z')
        .replace(/đ/g, 'dj')
}

async function scrollDown() {
    await nextTick()
    if (messagesBox.value) messagesBox.value.scrollTop = messagesBox.value.scrollHeight
}

async function goTo(nodeId: string) {
    const node = tree[nodeId] ?? tree.nepoznato!
    current.value = nodeId
    const message: Message = { id: nextId++, from: 'bot', text: node.text }

    if (nodeId === 'pocetnici') {
        try {
            const plants = await PlantService.getAll()
            message.links = plants
                .filter(p => normalize(p.target_audience).includes('pocetn'))
                .slice(0, 5)
                .map(p => ({ label: p.name, to: `/biljka/${p.id}` }))
            if (message.links.length === 0) message.text = 'Trenutno nema biljaka oznacenih za pocetnike.'
        } catch {
            message.text = 'Trenutno ne mogu da ucitam katalog. Pokusajte kasnije.'
        }
    }

    messages.value.push(message)
    scrollDown()
}

function choose(option: Option) {
    messages.value.push({ id: nextId++, from: 'user', text: option.label })
    if (option.link) {
        router.push(option.link)
        messages.value.push({ id: nextId++, from: 'bot', text: 'Otvorila sam stranicu. Tu sam ako vam zatreba jos nesto.' })
        current.value = 'start'
        scrollDown()
    } else if (option.next) {
        goTo(option.next)
    }
}

function send() {
    const text = input.value.trim()
    if (!text) return
    messages.value.push({ id: nextId++, from: 'user', text })
    input.value = ''

    const lower = normalize(text)
    const found = Object.keys(tree).find(id => tree[id]!.keywords?.some(k => lower.includes(k)))
    goTo(found ?? 'nepoznato')
}

function open() {
    isOpen.value = true
    if (messages.value.length === 0) goTo('start')
    scrollDown()
}

function restart() {
    messages.value = []
    goTo('start')
}

function currentOptions(): Option[] {
    if (current.value === 'nepoznato') return tree.start!.options
    return tree[current.value]?.options ?? []
}
</script>

<template>
    <div class="zk-chat">
        <button v-if="!isOpen" type="button" class="btn btn-primary zk-chat-toggle shadow"
            aria-label="Otvori pomocnicu Listu" @click="open()">
            <i class="fa-solid fa-leaf"></i>
            <span class="d-none d-sm-inline ms-2">Pitaj Listu</span>
        </button>

        <section v-else class="card zk-chat-window shadow-lg" role="dialog" aria-label="Pomocnica Lista">
            <header class="card-header d-flex align-items-center gap-2 py-2">
                <span class="zk-chat-avatar"><i class="fa-solid fa-leaf"></i></span>
                <div class="me-auto">
                    <div class="fw-bold">Lista</div>
                    <small class="text-body-secondary">Pomocnica za biljke i rezervacije</small>
                </div>
                <button type="button" class="btn btn-sm btn-link text-body-secondary" title="Pocni ispocetka"
                    aria-label="Pocni razgovor ispocetka" @click="restart()">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
                <button type="button" class="btn btn-sm btn-link text-body-secondary" aria-label="Zatvori"
                    @click="isOpen = false">
                    <i class="fa-solid fa-xmark fa-lg"></i>
                </button>
            </header>

            <div ref="messagesBox" class="card-body zk-chat-messages" aria-live="polite">
                <div v-for="m in messages" :key="m.id" class="d-flex mb-2"
                    :class="m.from === 'user' ? 'justify-content-end' : 'justify-content-start'">
                    <div class="zk-bubble" :class="m.from === 'user' ? 'zk-bubble-user' : 'zk-bubble-bot'">
                        <div style="white-space: pre-line;">{{ m.text }}</div>
                        <ul v-if="m.links?.length" class="mb-0 mt-1 ps-3">
                            <li v-for="l in m.links" :key="l.to">
                                <RouterLink :to="l.to">{{ l.label }}</RouterLink>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="d-flex flex-wrap gap-2 mt-2">
                    <button v-for="o in currentOptions()" :key="o.label" type="button"
                        class="btn btn-sm btn-outline-primary rounded-pill text-start" @click="choose(o)">
                        <i v-if="o.link" class="fa-solid fa-arrow-up-right-from-square me-1"></i>{{ o.label }}
                    </button>
                    <button v-if="current !== 'start'" type="button"
                        class="btn btn-sm btn-outline-secondary rounded-pill" @click="goTo('start')">
                        Glavni meni
                    </button>
                </div>
            </div>

            <form class="card-footer d-flex gap-2" @submit.prevent="send()">
                <input id="chat-input" v-model="input" type="text" class="form-control form-control-sm"
                    placeholder="Napisite pitanje..." aria-label="Pitanje za Listu" autocomplete="off">
                <button type="submit" class="btn btn-primary btn-sm" aria-label="Posalji" :disabled="!input.trim()">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </section>
    </div>
</template>

<style scoped>
.zk-chat {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 1050;
}

.zk-chat-toggle {
    border-radius: 999px;
    padding: .7rem 1.1rem;
}

.zk-chat-window {
    width: min(360px, calc(100vw - 32px));
    height: min(520px, calc(100dvh - 100px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 14px;
}

.zk-chat-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--zk-leaf);
    color: var(--zk-green);
}

.zk-chat-messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

.zk-bubble {
    max-width: 85%;
    padding: .55rem .8rem;
    border-radius: 12px;
    font-size: .925rem;
}

.zk-bubble-bot {
    background: var(--zk-leaf);
    border-bottom-left-radius: 4px;
}

.zk-bubble-user {
    background: var(--zk-green);
    color: #fff;
    border-bottom-right-radius: 4px;
}
</style>