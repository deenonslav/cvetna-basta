<script lang="ts" setup>
import { useLogin } from '@/hooks/login.hook';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { showConfirm, showError, showSuccess } from '@/utils';
import { onMounted, ref } from 'vue';

const validateLogin = useLogin()
const user = UserService.getActiveUser()
const types = PlantService.getTypes()

const profile = ref({
  fullName: user?.fullName ?? '',
  phone: user?.phone ?? '',
  address: user?.address ?? '',
  favorites: [...(user?.favorites ?? [])]
})
const passReset = ref({ currentPass: '', newPass: '', repeatPass: '' })

function saveProfile() {
  const p = profile.value
  if (!p.fullName.trim().includes(' ')) return showError('Unesite ime i prezime.')
  if (!/^[+\d\s-]{6,}$/.test(p.phone)) return showError('Unesite ispravan broj telefona.')
  if (!p.address.trim()) return showError('Adresa je obavezna.')

  UserService.updateProfile(p.fullName.trim(), p.phone, p.address.trim(), p.favorites)
  showSuccess('Podaci profila su sačuvani')
}

function changePassword() {
  showConfirm('Da li ste sigurni da želite da promenite lozinku?', () => {
    const p = passReset.value
    if (p.currentPass !== user?.password) return showError('Trenutna lozinka nije tačna.')
    if (p.newPass.length < 8) return showError('Nova lozinka mora imati najmanje 8 znakova.')
    if (p.newPass === user?.password) return showError('Ne možete koristiti istu lozinku.')
    if (p.newPass !== p.repeatPass) return showError('Lozinke se ne poklapaju.')

    UserService.changePassword(p.newPass)
    passReset.value = { currentPass: '', newPass: '', repeatPass: '' }
    showSuccess('Lozinka je promenjena')
  })
}

onMounted(() => validateLogin())
</script>

<template>
  <div class="row" v-if="user">
    <div class="col-12 col-lg-7 mb-3">
      <div class="card">
        <div class="card-header fw-bold">Moj profil</div>
        <form class="card-body" @submit.prevent="saveProfile">
          <div class="mb-3">
            <label for="fullName" class="form-label">Ime i prezime:</label>
            <input id="fullName" class="form-control" v-model="profile.fullName">
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">E-pošta (korisničko ime):</label>
            <input id="email" class="form-control" :value="user.email" readonly>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="phone" class="form-label">Telefon:</label>
              <input id="phone" class="form-control" v-model="profile.phone">
            </div>
            <div class="col-md-6 mb-3">
              <label for="address" class="form-label">Adresa:</label>
              <input id="address" class="form-control" v-model="profile.address">
            </div>
          </div>
          <div class="mb-3">
            <div class="form-label">Omiljene vrste biljaka:</div>
            <div class="form-check form-check-inline" v-for="t in types">
              <input class="form-check-input" type="checkbox" :id="`fav-${t}`" :value="t" v-model="profile.favorites">
              <label class="form-check-label" :for="`fav-${t}`">{{ t }}</label>
            </div>
          </div>
          <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Sačuvaj promene</button>
        </form>
      </div>
    </div>

    <div class="col-12 col-lg-5 mb-3">
      <div class="card">
        <div class="card-header fw-bold">Promena lozinke</div>
        <form class="card-body" @submit.prevent="changePassword">
          <div class="mb-3">
            <label for="cur" class="form-label">Trenutna lozinka:</label>
            <input id="cur" type="password" class="form-control" v-model="passReset.currentPass">
          </div>
          <div class="mb-3">
            <label for="new" class="form-label">Nova lozinka:</label>
            <input id="new" type="password" class="form-control" v-model="passReset.newPass">
          </div>
          <div class="mb-3">
            <label for="rep" class="form-label">Ponovite novu lozinku:</label>
            <input id="rep" type="password" class="form-control" v-model="passReset.repeatPass">
          </div>
          <button type="submit" class="btn btn-outline-primary">Promeni lozinku</button>
        </form>
      </div>
    </div>
  </div>
</template>
