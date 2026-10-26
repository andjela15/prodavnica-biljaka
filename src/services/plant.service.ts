import type { PlantModel } from '@/models/plant.model'
import axios from 'axios'

const client = axios.create({
    baseURL: 'https://plants.pequla.com/api',
    headers: { 'Accept': 'application/json' }
})

export class PlantService {
    // Sve biljke: GET /api/plants
    static async getAll(): Promise<PlantModel[]> {
        const rsp = await client.get<PlantModel[]>('/plants')
        return rsp.data
    }

    // Jedna biljka po ID-ju: GET /api/plants/1
    static async getById(id: number): Promise<PlantModel> {
        const rsp = await client.get<PlantModel>(`/plants/${id}`)
        return rsp.data
    }

    
    static getImageUrl(plant: PlantModel): string {
        return plant.image_url.replace('http://', 'https://')
    }
}