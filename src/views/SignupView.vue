<script lang="ts" setup>
import { completeReservation } from '@/hooks/reserve.hook';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { showError } from '@/utils';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const types = PlantService.getTypes()
const submitted = ref(false)
const form = ref({
    fullName: '', email: '', phone: '', address: '',
    favorites: [] as string[], password: '', confirm: ''
})

// Greške se prikazuju pored polja, uz objašnjenje kako da se isprave
const errors = computed(() => {
    const f = form.value
    const e: Record<string, string> = {}
    if (!f.fullName.trim().includes(' ')) e.fullName = 'Unesite ime i prezime.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Unesite ispravnu e-poštu, npr. ime@primer.rs.'
    if (!/^[+\d\s-]{6,}$/.test(f.phone)) e.phone = 'Unesite broj telefona (cifre, razmaci i +).'
    if (!f.address.trim()) e.address = 'Adresa je obavezna.'
    if (f.favorites.length === 0) e.favorites = 'Izaberite bar jednu omiljenu vrstu biljaka.'
    if (f.password.length < 8) e.password = 'Lozinka mora imati najmanje 8 znakova.'
    else if (f.password !== f.confirm) e.confirm = 'Lozinke se ne poklapaju.'
    return e
})

function signup() {
    submitted.value = true
    if (Object.keys(errors.value).length > 0) return

    const f = form.value
    const err = UserService.createUser({
        email: f.email, password: f.password, fullName: f.fullName.trim(),
        phone: f.phone, address: f.address.trim(), favorites: f.favorites
    })

    if (err) return showError(err)

    // Posle registracije korisnik je odmah prijavljen
    UserService.login(f.email, f.password)
    const to = sessionStorage.getItem('to')
    const pending = sessionStorage.getItem('pending')
    sessionStorage.removeItem('to')
    sessionStorage.removeItem('pending')
    router.push(to ?? '/')
    if (pending) completeReservation(Number(pending), router)
}
</script>

<template>
    <div class="container py-4">
        <div class="row justify-content-center">
            <div class="col-xl-8">
                <div class="card shadow-lg">
                    <div class="card-body p-4 p-sm-5">
                        <h2 class="fw-bold mb-1">Registracija</h2>
                        <p class="text-body-secondary small">Sva polja su obavezna.</p>

                        <form @submit.prevent="signup" novalidate>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="fullName" class="form-label">Ime i prezime</label>
                                    <input id="fullName" class="form-control" v-model="form.fullName"
                                        :class="{ 'is-invalid': submitted && errors.fullName }">
                                    <div class="invalid-feedback">{{ errors.fullName }}</div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="email" class="form-label">E-pošta</label>
                                    <input id="email" type="email" class="form-control" v-model="form.email"
                                        :class="{ 'is-invalid': submitted && errors.email }">
                                    <div class="invalid-feedback">{{ errors.email }}</div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="phone" class="form-label">Telefon</label>
                                    <input id="phone" type="tel" class="form-control" v-model="form.phone"
                                        :class="{ 'is-invalid': submitted && errors.phone }">
                                    <div class="invalid-feedback">{{ errors.phone }}</div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="address" class="form-label">Adresa</label>
                                    <input id="address" class="form-control" v-model="form.address"
                                        :class="{ 'is-invalid': submitted && errors.address }">
                                    <div class="invalid-feedback">{{ errors.address }}</div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="form-label">Omiljene vrste biljaka</div>
                                <div class="form-check form-check-inline" v-for="t in types">
                                    <input class="form-check-input" type="checkbox" :id="`s-${t}`" :value="t"
                                        v-model="form.favorites">
                                    <label class="form-check-label" :for="`s-${t}`">{{ t }}</label>
                                </div>
                                <div class="text-danger small" v-if="submitted && errors.favorites">{{ errors.favorites }}</div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="password" class="form-label">Lozinka</label>
                                    <input id="password" type="password" class="form-control" v-model="form.password"
                                        :class="{ 'is-invalid': submitted && errors.password }">
                                    <div class="invalid-feedback">{{ errors.password }}</div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="confirm" class="form-label">Ponovite lozinku</label>
                                    <input id="confirm" type="password" class="form-control" v-model="form.confirm"
                                        :class="{ 'is-invalid': submitted && errors.confirm }">
                                    <div class="invalid-feedback">{{ errors.confirm }}</div>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary btn-lg w-100 fs-6 py-2">Napravi nalog</button>
                        </form>

                        <p class="small mt-3 mb-0">Već imate nalog? <RouterLink to="/login" class="fw-semibold">Prijavite se</RouterLink></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
