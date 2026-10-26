export type ReservationStatus = 'rezervisano' | 'pristiglo' | 'otkazano'

export interface ReservationModel {
    id: number
    plantId: number
    quantity: number
    note: string
    status: ReservationStatus
    rating: number | null
    createdAt: string
}
