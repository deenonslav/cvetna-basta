import { UserService } from "@/services/user.service"
import { PlantService } from "@/services/plant.service"
import { bootstrapClasses } from "@/utils"
import Swal from "sweetalert2"
import { useRoute, useRouter, type Router } from "vue-router"

// Dodavanje u korpu rezervacija + obaveštenje korisniku
export function completeReservation(plantId: number, router: Router) {
    UserService.addReservation(plantId)
    const plant = PlantService.getById(plantId)

    Swal.fire({
        icon: 'success',
        title: 'Biljka je rezervisana',
        text: `${plant?.name} je dodata u vašu korpu rezervacija.`,
        showCancelButton: true,
        confirmButtonText: 'Otvori korpu',
        cancelButtonText: 'Nastavi pregled',
        buttonsStyling: false,
        customClass: bootstrapClasses
    }).then(result => {
        if (result.isConfirmed) router.push('/cart')
    })
}

// Ako korisnik nije prijavljen, traži se prijava ili registracija, a rezervacija se pamti
export function useReserve() {
    const router = useRouter()
    const route = useRoute()

    return (plantId: number) => {
        if (UserService.getActiveUser()) {
            completeReservation(plantId, router)
            return
        }

        Swal.fire({
            icon: 'info',
            title: 'Potrebna je prijava',
            text: 'Da biste rezervisali biljku, prijavite se ili napravite nalog. Rezervacija će biti dodata čim završite.',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'Prijava',
            denyButtonText: 'Registracija',
            cancelButtonText: 'Odustani',
            buttonsStyling: false,
            customClass: bootstrapClasses
        }).then(result => {
            if (result.isDismissed) return
            sessionStorage.setItem('to', route.fullPath)
            sessionStorage.setItem('pending', String(plantId))
            router.push(result.isConfirmed ? '/login' : '/signup')
        })
    }
}
