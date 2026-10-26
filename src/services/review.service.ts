import type { ReviewModel } from '@/models/review.model'

const REVIEWS_KEY = 'zk_reviews'

const AUTHORS = ['Milica J.', 'Stefan P.', 'Jelena M.', 'Nikola R.', 'Ivana K.', 'Marko D.', 'Tamara S.']
const COMMENTS: Record<number, string[]> = {
    5: ['Stigla je zdrava i lepo upakovana. Brzo je pustila nove listove.', 'Odlicna biljka, tacno kao u opisu.', 'Preporuka! Nega je bas jednostavna.'],
    4: ['Lepa biljka, malo manja nego na slici.', 'Sve je u redu, a uputstvo za negu je mnogo pomoglo.'],
    3: ['Solidno, ali jedan list je bio ostecen pri dostavi.', 'Dobra biljka, ali joj treba vremena da se prilagodi.'],
    2: ['Biljka je stigla povenula i polako se oporavlja.']
}

function sampleReviews(plantId: number): ReviewModel[] {
    const count = 1 + (plantId % 4) 
    const reviews: ReviewModel[] = []

    for (let i = 0; i < count; i++) {
        const rating = [5, 4, 5, 3, 4, 5, 2][(plantId * 3 + i * 5) % 7]!
        const options = COMMENTS[rating]!
        reviews.push({
            plantId,
            author: AUTHORS[(plantId + i * 2) % AUTHORS.length]!,
            email: null,
            rating,
            comment: options[(plantId + i) % options.length]!,
            date: `2026-0${1 + ((plantId + i) % 9)}-${10 + ((plantId * 7 + i) % 18)}`
        })
    }
    return reviews
}

export class ReviewService {

    static getStored(): ReviewModel[] {
        try {
            return JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? '[]')
        } catch {
            return []
        }
    }

    static getForPlant(plantId: number): ReviewModel[] {
        const stored = this.getStored().filter(r => r.plantId === plantId)
        return [...stored, ...sampleReviews(plantId)]
            .sort((a, b) => b.date.localeCompare(a.date))
    }

    static getSummary(plantId: number): { average: number, count: number } {
        const reviews = this.getForPlant(plantId)
        if (reviews.length === 0) return { average: 0, count: 0 }

        const sum = reviews.reduce((total, r) => total + r.rating, 0)
        return { average: sum / reviews.length, count: reviews.length }
    }

    static save(review: ReviewModel) {
        const all = this.getStored().filter(r => !(r.plantId === review.plantId && r.email === review.email))
        all.push(review)
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(all))
    }
}