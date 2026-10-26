import type { UserModel } from "@/models/user.model"
import type { ReservationModel } from "@/models/reservation.model"
import { ref } from "vue"

const USERS_KEY = 'zb_2026_users'
const ACTIVE_USER_KEY = 'zb_2026_active'

// Reaktivni brojač: menja se pri svakoj izmeni podataka, pa se meni (broj u korpi) osvežava
export const userVersion = ref(0)

export class UserService {

    static getUsers(): UserModel[] {
        if (localStorage.getItem(USERS_KEY) == null) {
            const now = new Date().toISOString()
            localStorage.setItem(USERS_KEY, JSON.stringify([
                {
                    email: 'demo@cvetnabasta.rs',
                    password: 'demo12345',
                    fullName: 'Demo Kupac',
                    phone: '+381 60 123 4567',
                    address: 'Borča, Beograd',
                    favorites: ['sobna', 'sukulent'],
                    reservations: [
                        { id: 1, plantId: 2, quantity: 2, note: '', status: 'rezervisano', rating: null, createdAt: now },
                        { id: 2, plantId: 1, quantity: 1, note: '', status: 'pristiglo', rating: null, createdAt: now },
                        { id: 3, plantId: 4, quantity: 1, note: '', status: 'pristiglo', rating: 4, createdAt: now },
                        { id: 4, plantId: 6, quantity: 1, note: '', status: 'otkazano', rating: null, createdAt: now }
                    ]
                }
            ]))
        }

        return JSON.parse(localStorage.getItem(USERS_KEY)!)
    }

    private static save(users: UserModel[]) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        userVersion.value++
    }

    static login(email: string, password: string): boolean {
        for (let user of this.getUsers()) {
            if (user.email == email && user.password == password) {
                localStorage.setItem(ACTIVE_USER_KEY, email)
                userVersion.value++
                return true
            }
        }
        return false
    }

    static getActiveUser(): UserModel | null {
        for (let user of this.getUsers()) {
            if (user.email == localStorage.getItem(ACTIVE_USER_KEY)) {
                return user
            }
        }
        return null
    }

    static logout() {
        localStorage.removeItem(ACTIVE_USER_KEY)
        userVersion.value++
    }

    // Pomoćna funkcija: izmena podataka aktivnog korisnika
    private static update(change: (user: UserModel) => void) {
        const active = this.getActiveUser()
        const users = this.getUsers()

        if (active) {
            for (let user of users) {
                if (user.email === active.email) {
                    change(user)
                }
            }
            this.save(users)
        }
    }

    static createUser(user: Omit<UserModel, 'reservations'>): string | null {
        const users = this.getUsers()

        if (users.some(u => u.email === user.email)) {
            return 'Nalog sa ovom e-poštom već postoji!'
        }

        users.push({ ...user, reservations: [] })
        this.save(users)
        return null
    }

    static updateProfile(fullName: string, phone: string, address: string, favorites: string[]) {
        this.update(u => {
            u.fullName = fullName
            u.phone = phone
            u.address = address
            u.favorites = favorites
        })
    }

    static changePassword(newPassword: string) {
        this.update(u => u.password = newPassword)
    }

    // Rezervacija: ako biljka već ima status 'rezervisano', povećava se količina
    static addReservation(plantId: number) {
        this.update(u => {
            const existing = u.reservations.find(r => r.plantId === plantId && r.status === 'rezervisano')
            if (existing) {
                existing.quantity++
                return
            }

            const reservation: ReservationModel = {
                id: Date.now(), plantId, quantity: 1, note: '',
                status: 'rezervisano', rating: null, createdAt: new Date().toISOString()
            }
            u.reservations.push(reservation)
        })
    }

    // Izmena je dozvoljena samo za status 'rezervisano'
    static updateReservation(id: number, quantity: number, note: string) {
        this.update(u => {
            const r = u.reservations.find(x => x.id === id && x.status === 'rezervisano')
            if (r) {
                r.quantity = quantity
                r.note = note
            }
        })
    }

    static cancelReservation(id: number) {
        this.update(u => {
            const r = u.reservations.find(x => x.id === id && x.status === 'rezervisano')
            if (r) r.status = 'otkazano'
        })
    }

    // Samo za demonstraciju: simulira da je biljka stigla
    static markArrived(id: number) {
        this.update(u => {
            const r = u.reservations.find(x => x.id === id && x.status === 'rezervisano')
            if (r) r.status = 'pristiglo'
        })
    }

    // Ocenjivanje je dozvoljeno samo za status 'pristiglo'
    static rateReservation(id: number, rating: number) {
        this.update(u => {
            const r = u.reservations.find(x => x.id === id && x.status === 'pristiglo')
            if (r) r.rating = rating
        })
    }

    // Brisanje je dozvoljeno samo za status 'pristiglo'
    static removeReservation(id: number) {
        this.update(u => {
            u.reservations = u.reservations.filter(x => !(x.id === id && x.status === 'pristiglo'))
        })
    }
}
