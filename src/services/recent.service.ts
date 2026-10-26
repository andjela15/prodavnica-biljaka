const RECENT_KEY = 'zk_recent'
const MAX_RECENT = 4

export class RecentService {
    static getIds(): number[] {
        try {
            return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
        } catch {
            return []
        }
    }

    static add(id: number) {
        const ids = this.getIds().filter(x => x !== id)
        ids.unshift(id)
        localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)))
    }

    static clear() {
        localStorage.removeItem(RECENT_KEY)
    }
}