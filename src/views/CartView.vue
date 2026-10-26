<script lang="ts" setup>
import InfoCard from '@/components/InfoCard.vue';
import PlantImage from '@/components/PlantImage.vue';
import StarRating from '@/components/StarRating.vue';
import { useLogin } from '@/hooks/login.hook';
import type { ReservationModel } from '@/models/reservation.model';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { bootstrapClasses, formatDate, formatPrice, showConfirm, showSuccess } from '@/utils';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';

const validateLogin = useLogin()
const user = ref(UserService.getActiveUser())

// Svaka rezervacija se spaja sa podacima o biljci
const items = computed(() => (user.value?.reservations ?? []).map(r => ({ r, plant: PlantService.getById(r.plantId)! })))

// Ukupna cena se računa automatski; otkazane rezervacije se ne računaju
const total = computed(() => items.value
  .filter(i => i.r.status !== 'otkazano')
  .reduce((sum, i) => sum + i.plant.price * i.r.quantity, 0))

function refresh() {
  user.value = UserService.getActiveUser()
}

function edit(r: ReservationModel, name: string) {
  Swal.fire({
    title: `Izmena rezervacije: ${name}`,
    html: `<div class="text-start">
      <label class="form-label" for="swal-q">Količina (1–20):</label>
      <input id="swal-q" type="number" min="1" max="20" class="form-control mb-3" value="${r.quantity}">
      <label class="form-label" for="swal-n">Napomena za isporuku:</label>
      <textarea id="swal-n" rows="2" class="form-control">${r.note}</textarea></div>`,
    showCancelButton: true,
    confirmButtonText: 'Sačuvaj izmene',
    cancelButtonText: 'Odustani',
    buttonsStyling: false,
    customClass: bootstrapClasses,
    preConfirm: () => {
      const q = Number((document.getElementById('swal-q') as HTMLInputElement).value)
      const n = (document.getElementById('swal-n') as HTMLTextAreaElement).value
      if (!Number.isInteger(q) || q < 1 || q > 20) {
        Swal.showValidationMessage('Količina mora biti ceo broj od 1 do 20.')
        return false
      }
      return { q, n }
    }
  }).then(result => {
    if (result.isConfirmed) {
      UserService.updateReservation(r.id, result.value.q, result.value.n)
      refresh()
      showSuccess('Rezervacija je izmenjena')
    }
  })
}

function cancel(r: ReservationModel, name: string) {
  showConfirm(`Otkazati rezervaciju: ${name}?`, () => {
    UserService.cancelReservation(r.id)
    refresh()
  }, 'Biljka dobija status „otkazano“ i ne ulazi u ukupnu cenu.')
}

// Ocenjivanje je dozvoljeno samo za biljke sa statusom 'pristiglo'
function rate(r: ReservationModel, name: string) {
  Swal.fire({
    title: `Ocenite biljku: ${name}`,
    input: 'radio',
    inputOptions: { 5: '★★★★★  Odlično', 4: '★★★★☆  Vrlo dobro', 3: '★★★☆☆  Dobro', 2: '★★☆☆☆  Loše', 1: '★☆☆☆☆  Veoma loše' },
    inputValue: r.rating ?? undefined,
    inputValidator: v => v ? null : 'Izaberite ocenu.',
    showCancelButton: true,
    confirmButtonText: 'Sačuvaj ocenu',
    cancelButtonText: 'Odustani',
    buttonsStyling: false,
    customClass: bootstrapClasses
  }).then(result => {
    if (result.isConfirmed) {
      UserService.rateReservation(r.id, Number(result.value))
      refresh()
      showSuccess('Hvala! Vaša ocena je sačuvana')
    }
  })
}

// Brisanje je dozvoljeno samo za biljke sa statusom 'pristiglo'
function remove(r: ReservationModel, name: string) {
  showConfirm(`Obrisati iz korpe: ${name}?`, () => {
    UserService.removeReservation(r.id)
    refresh()
  }, 'Biljka će biti uklonjena iz korpe, zajedno sa vašom ocenom.')
}

function arrive(r: ReservationModel) {
  UserService.markArrived(r.id)
  refresh()
}

onMounted(() => validateLogin())
</script>

<template>
  <div v-if="user">
    <h1>Korpa rezervacija</h1>

    <div class="card mb-3" v-if="items.length">
      <div class="card-body table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th scope="col">Biljka</th>
              <th scope="col">Tip i ciljna grupa</th>
              <th scope="col">Proizvedeno</th>
              <th scope="col">Količina</th>
              <th scope="col">Cena</th>
              <th scope="col">Status</th>
              <th scope="col">Ocena</th>
              <th scope="col">Opcije</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="{ r, plant } in items" :key="r.id">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="thumb rounded overflow-hidden"><PlantImage :title="plant.wikiTitle" :alt="plant.name" /></div>
                  <div>
                    <RouterLink :to="`/details/${plant.id}`" class="fw-bold">{{ plant.name }}</RouterLink>
                    <div class="small text-body-secondary" v-if="r.note">Napomena: {{ r.note }}</div>
                  </div>
                </div>
              </td>
              <td class="small">{{ plant.types.join(', ') }}<br>{{ plant.targetGroups.join(', ') }}</td>
              <td>{{ formatDate(plant.producedAt) }}</td>
              <td>{{ r.quantity }}</td>
              <td class="text-nowrap">{{ formatPrice(plant.price * r.quantity) }}</td>
              <td>
                <span class="badge" :class="{
                  'text-bg-warning': r.status == 'rezervisano',
                  'text-bg-success': r.status == 'pristiglo',
                  'text-bg-danger': r.status == 'otkazano'
                }">{{ r.status }}</span>
              </td>
              <td>
                <template v-if="r.status == 'pristiglo'">
                  <StarRating :rating="r.rating ?? 0" v-if="r.rating" />
                  <span class="small text-body-secondary" v-else>Još niste ocenili</span>
                </template>
                <span v-else>—</span>
              </td>
              <td class="text-nowrap">
                <template v-if="r.status == 'rezervisano'">
                  <button type="button" class="btn btn-sm btn-primary m-1" @click="edit(r, plant.name)">
                    <i class="fa-solid fa-pen"></i> Izmeni</button>
                  <button type="button" class="btn btn-sm btn-outline-danger m-1" @click="cancel(r, plant.name)">
                    <i class="fa-solid fa-ban"></i> Otkaži</button>
                  <button type="button" class="btn btn-sm btn-link text-body-secondary p-0 small" @click="arrive(r)"
                    title="Samo za demonstraciju: simulira da je biljka stigla">Simuliraj dolazak</button>
                </template>
                <template v-else-if="r.status == 'pristiglo'">
                  <button type="button" class="btn btn-sm btn-primary m-1" @click="rate(r, plant.name)">
                    <i class="fa-solid fa-star"></i> {{ r.rating ? 'Promeni ocenu' : 'Oceni' }}</button>
                  <button type="button" class="btn btn-sm btn-danger m-1" @click="remove(r, plant.name)">
                    <i class="fa-solid fa-trash"></i> Obriši</button>
                </template>
                <button v-else type="button" class="btn btn-sm btn-danger m-1" disabled
                  title="Brisanje je moguće samo za biljke sa statusom „pristiglo“">
                  <i class="fa-solid fa-trash"></i> Obriši</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer text-end">
        <div class="fs-4 fw-bold">Ukupno: {{ formatPrice(total) }}</div>
        <small class="text-body-secondary">U ukupnu cenu nisu uračunate otkazane rezervacije.</small>
      </div>
    </div>

    <InfoCard title="Korpa je prazna" v-else>
      <p>Još nemate rezervacija.</p>
      <RouterLink to="/" class="btn btn-primary">Pronađi biljku</RouterLink>
    </InfoCard>
  </div>
</template>

<style scoped>
.thumb {
  width: 64px;
  flex-shrink: 0;
}
</style>
