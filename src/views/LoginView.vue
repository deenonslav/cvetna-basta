<script lang="ts" setup>
import { completeReservation } from '@/hooks/reserve.hook';
import { UserService } from '@/services/user.service';
import { showError } from '@/utils';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref<string>('')
const password = ref<string>('')
const router = useRouter()
const hasPending = sessionStorage.getItem('pending') != null

function login() {
    if (UserService.login(email.value, password.value)) {
        const to = sessionStorage.getItem('to')
        const pending = sessionStorage.getItem('pending')
        sessionStorage.removeItem('to')
        sessionStorage.removeItem('pending')

        router.push(to ?? '/')
        // Prekinuta rezervacija se nastavlja odmah posle prijave
        if (pending) completeReservation(Number(pending), router)
        return
    }

    showError('E-pošta ili lozinka nisu tačne. Proverite unos i pokušajte ponovo.')
}
</script>

<template>
    <div class="container py-4">
        <div class="row justify-content-center">
            <div class="col-xl-10">
                <div class="card auth-card shadow-lg overflow-hidden">
                    <div class="row g-0">
                        <div class="col-md-5 d-none d-md-flex auth-side text-white align-items-center justify-content-center">
                            <div class="text-center p-4">
                                <i class="fa-solid fa-spa fa-4x mb-3"></i>
                                <h3>Dobrodošli nazad</h3>
                                <p class="mb-0">Vaša korpa rezervacija čeka.</p>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <div class="card-body p-4 p-sm-5">
                                <h2 class="fw-bold mb-1">Prijava</h2>
                                <p class="text-body-secondary small">Prijavite se na svoj nalog</p>
                                <div class="alert alert-info small" v-if="hasPending">
                                    Posle prijave biće dodata biljka koju ste hteli da rezervišete.
                                </div>

                                <form @submit.prevent="login">
                                    <div class="mb-3">
                                        <label for="email" class="form-label small fw-semibold">E-pošta</label>
                                        <input type="email" class="form-control form-control-lg fs-6" id="email"
                                            v-model="email" placeholder="ime@primer.rs">
                                    </div>
                                    <div class="mb-4">
                                        <label for="password" class="form-label small fw-semibold">Lozinka</label>
                                        <input type="password" class="form-control form-control-lg fs-6" id="password"
                                            v-model="password" placeholder="••••••••">
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-lg w-100 fs-6 py-2">Prijavi me</button>
                                </form>

                                <p class="small text-body-secondary mt-3 mb-1">Demo nalog: demo@cvetnabasta.rs / demo12345</p>
                                <p class="small mb-0">Nemate nalog? <RouterLink to="/signup" class="fw-semibold">Registrujte se</RouterLink></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-card {
    border-radius: 1rem;
}

.auth-side {
    background: linear-gradient(160deg, #4a1233, #e0679a);
}
</style>
