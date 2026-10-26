export type OrderStatus = 'rezervisano' | 'pristiglo' | 'otkazano'
export type DeliveryType = 'dostava' | 'preuzimanje'

export interface OrderModel {
    id: string
    plantId: number
    plantName: string
    imageUrl: string
    category: string
    pricePerUnit: number
    quantity: number
    delivery: DeliveryType
    note: string
    status: OrderStatus
    rating: number | null
    createdAt: string
}