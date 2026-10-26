import type { OrderModel, OrderStatus } from '@/models/order.model'
import type { UserModel } from '@/models/user.model'
import { ref } from 'vue'
import { ReviewService } from './review.service'

const USERS_KEY = 'zk_users'
const ACTIVE_USER_KEY = 'zk_active'

export const activeUser = ref<UserModel | null>(null)

export type ProfileData = Omit<UserModel, 'orders'>

export class UserService {

    static getUsers(): UserModel[] {
        if (localStorage.getItem(USERS_KEY) == null) {
            const demo: UserModel = {
                firstName: 'Ana',
                lastName: 'Petrović',
                email: 'ana@primer.rs',
                phone: '0641234567',
                address: 'Bulevar oslobođenja 12, Novi Sad',
                favoriteTypes: ['Sobne biljke'],
                password: 'ana12345',
                orders: [{
                    id: 'demo-1',
                    plantId: 1,
                    plantName: 'Monstera deliciosa',
                    imageUrl: 'https://plants.pequla.com/images/biljka-001.svg',
                    category: 'Sobne biljke',
                    pricePerUnit: 330,
                    quantity: 1,
                    delivery: 'dostava',
                    note: '',
                    status: 'pristiglo',
                    rating: null,
                    createdAt: '2026-10-20T10:15:00.000Z'
                }]
            }
            localStorage.setItem(USERS_KEY, JSON.stringify([demo]))
        }
        return JSON.parse(localStorage.getItem(USERS_KEY)!)
    }

    static saveUsers(users: UserModel[]) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        this.refresh()
    }

    static refresh() {
        const email = localStorage.getItem(ACTIVE_USER_KEY)
        activeUser.value = this.getUsers().find(u => u.email === email) ?? null
    }

    static getActiveUser(): UserModel | null {
        return activeUser.value
    }

    static login(email: string, password: string): boolean {
        const user = this.getUsers().find(u => u.email === email.trim().toLowerCase() && u.password === password)
        if (!user) return false

        localStorage.setItem(ACTIVE_USER_KEY, user.email)
        this.refresh()
        return true
    }

    static logout() {
        localStorage.removeItem(ACTIVE_USER_KEY)
        this.refresh()
    }

    static register(data: ProfileData): string | null {
        const users = this.getUsers()
        const email = data.email.trim().toLowerCase()

        if (users.some(u => u.email === email)) {
            return 'Nalog sa ovom email adresom već postoji. Prijavite se ili koristite drugu adresu.'
        }

        users.push({ ...data, email, orders: [] })
        this.saveUsers(users)
        this.login(email, data.password)
        return null
    }

    static updateProfile(data: Omit<ProfileData, 'email' | 'password'>) {
        this.updateActive(user => Object.assign(user, data))
    }

    static changePassword(oldPassword: string, newPassword: string): string | null {
        if (activeUser.value?.password !== oldPassword) {
            return 'Trenutna lozinka nije tačna.'
        }
        this.updateActive(user => { user.password = newPassword })
        return null
    }

    static addOrder(order: OrderModel) {
        this.updateActive(user => { user.orders.push(order) })
    }

    static updateOrder(id: string, changes: Partial<Pick<OrderModel, 'quantity' | 'delivery' | 'note'>>) {
        this.updateActive(user => {
            const order = user.orders.find(o => o.id === id)
            if (order && order.status === 'rezervisano') Object.assign(order, changes)
        })
    }

    static setStatus(id: string, status: OrderStatus) {
        this.updateActive(user => {
            const order = user.orders.find(o => o.id === id)
            if (order) order.status = status
        })
    }

    static removeOrder(id: string): { order: OrderModel, index: number } | null {
        const users = this.getUsers()
        const user = users.find(u => u.email === activeUser.value?.email)
        if (!user) return null

        const index = user.orders.findIndex(o => o.id === id)
        if (index === -1) return null

        const order = user.orders[index]!
        user.orders.splice(index, 1)
        this.saveUsers(users)
        return { order, index }
    }

    static restoreOrder(order: OrderModel, index: number) {
        this.updateActive(user => { user.orders.splice(index, 0, order) })
    }

    static rateOrder(id: string, rating: number, comment: string) {
        const user = activeUser.value
        const order = user?.orders.find(o => o.id === id)
        if (!user || !order || order.status !== 'pristiglo') return

        this.updateActive(u => {
            const o = u.orders.find(x => x.id === id)
            if (o) o.rating = rating
        })

        ReviewService.save({
            plantId: order.plantId,
            author: `${user.firstName} ${user.lastName.charAt(0)}.`,
            email: user.email,
            rating,
            comment,
            date: new Date().toISOString().split('T')[0]!
        })
    }

    private static updateActive(change: (user: UserModel) => void) {
        const users = this.getUsers()
        const user = users.find(u => u.email === activeUser.value?.email)
        if (!user) return
        change(user)
        this.saveUsers(users)
    }
}

UserService.refresh()