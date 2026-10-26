import type { ReservationModel } from "./reservation.model"

export interface UserModel {
    email: string
    password: string
    fullName: string
    phone: string
    address: string
    favorites: string[]
    reservations: ReservationModel[]
}
