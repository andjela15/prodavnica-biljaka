export interface ReviewModel {
    plantId: number
    author: string
    email: string | null 
    rating: number       
    comment: string
    date: string
}