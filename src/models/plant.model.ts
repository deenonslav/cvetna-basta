export interface ReviewModel {
    author: string
    rating: number
    text: string
}

export interface PlantModel {
    id: number
    name: string
    latin: string
    wikiTitle: string
    description: string
    planting: string
    care: string
    types: string[]
    targetGroups: string[]
    producedAt: string
    price: number
    reviews: ReviewModel[]
}
