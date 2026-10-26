import { ref } from 'vue'

const WISHLIST_KEY = 'zk_wishlist'

function load(): number[] {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]')
    } catch {
        return []
    }
}

export const wishlist = ref<number[]>(load())

export class WishlistService {
    static has(id: number): boolean {
        return wishlist.value.includes(id)
    }

    static toggle(id: number): boolean {
        if (this.has(id)) {
            wishlist.value = wishlist.value.filter(x => x !== id)
        } else {
            wishlist.value = [id, ...wishlist.value]
        }
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist.value))
        return this.has(id)
    }
}