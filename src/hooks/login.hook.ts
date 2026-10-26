import { UserService } from "@/services/user.service"
import { useRoute, useRouter } from "vue-router"

// Ako korisnik nije prijavljen, pamti se stranica na koju treba da se vrati posle prijave
export function useLogin() {
    const router = useRouter()
    const route = useRoute()

    return () => {
        if (!UserService.getActiveUser()) {
            sessionStorage.setItem('to', route.fullPath)
            router.push('/login')
            return false
        }
        return true
    }
}
