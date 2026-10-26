import type { PlantModel } from '@/models/plant.model'
import axios from 'axios'

const client = axios.create({
    baseURL: 'https://plants.pequla.com/api',
    headers: { 'Accept': 'application/json' }
})

export class PlantService {
    static async getAll(): Promise<PlantModel[]> {
        const rsp = await client.get<PlantModel[]>('/plants')
        return rsp.data
    }

    static async getById(id: number): Promise<PlantModel> {
        const rsp = await client.get<PlantModel>(`/plants/${id}`)
        return rsp.data
    }

    
    static getImageUrl(plant: PlantModel): string {
        return plant.image_url.replace('http://', 'https://')
    }
    static getDistinct(plants: PlantModel[], field: keyof PlantModel): string[] {
        const values = new Set<string>()
        for (const p of plants) {
            values.add(String(p[field]))
        }
        return Array.from(values).sort((a, b) => a.localeCompare(b, 'sr'))
    }
}