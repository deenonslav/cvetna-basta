<script setup lang="ts">
import InfoCard from '@/components/InfoCard.vue';
import PlantImage from '@/components/PlantImage.vue';
import StarRating from '@/components/StarRating.vue';
import { useReserve } from '@/hooks/reserve.hook';
import { PlantService } from '@/services/plant.service';
import { UserService } from '@/services/user.service';
import { formatPrice } from '@/utils';
import type { PlantModel } from '@/models/plant.model';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const reserve = useReserve()
const plants = PlantService.getAll()
const types = PlantService.getTypes()
const groups = PlantService.getTargetGroups()

const empty = () => ({
  name: '', description: '', type: '', group: '',
  producedFrom: '', priceMin: '', priceMax: '', minRating: '', reviewText: ''
})
// Biljke koje odgovaraju omiljenim vrstama prijavljenog korisnika dobijaju oznaku „Za vas“
const favorites = UserService.getActiveUser()?.favorites ?? []
const isForYou = (types: string[]) => types.some(t => favorites.includes(t))
const sortBy = ref('')

const search = ref({ ...empty(), type: (route.query.type as string) ?? '' })

const filtered = ref<PlantModel[]>([])

// Funkcija pretrage: svaki kriterijum se zadaje odvojeno, prazan se ne primenjuje
function searchPlants() {
  const s = search.value
  const has = (text: string, q: string) => text.toLowerCase().includes(q.trim().toLowerCase())

  const result = plants.filter(p =>
    (!s.name || has(p.name, s.name) || has(p.latin, s.name)) &&
    (!s.description || has(`${p.description} ${p.planting} ${p.care}`, s.description)) &&
    (!s.type || p.types.includes(s.type)) &&
    (!s.group || p.targetGroups.includes(s.group)) &&
    (!s.producedFrom || p.producedAt >= s.producedFrom) &&
    (!s.priceMin || p.price >= Number(s.priceMin)) &&
    (!s.priceMax || p.price <= Number(s.priceMax)) &&
    (!s.minRating || PlantService.getAverage(p) >= Number(s.minRating)) &&
    (!s.reviewText || PlantService.getReviews(p).some(r => has(r.text, s.reviewText)))
  )

  if (sortBy.value === 'price-asc') result.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-desc') result.sort((a, b) => b.price - a.price)
  if (sortBy.value === 'rating') result.sort((a, b) => PlantService.getAverage(b) - PlantService.getAverage(a))
  if (sortBy.value === 'newest') result.sort((a, b) => b.producedAt.localeCompare(a.producedAt))
  filtered.value = result
}

watch([search, sortBy], searchPlants, { deep: true, immediate: true })

function resetFilters() {
  search.value = empty()
  sortBy.value = ''
}
</script>

<template>
  <div class="hero rounded-4 p-4 p-md-5 mb-4 text-white">
    <span class="badge rounded-pill text-bg-warning mb-3"><i class="fa-solid fa-spa"></i> Nova sezona</span>
    <h1 class="mb-2">Cveće i lišće koje sami birate</h1>
    <p class="mb-0 col-md-7">Pretražite ponudu po nazivu, nezi, tipu, ceni i ocenama kupaca, pa rezervišite biljku koja vam odgovara.</p>
  </div>

  <form class="card mb-4" @submit.prevent aria-label="Pretraga biljaka">
    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-4 mb-3">
          <label for="name" class="form-label">Naziv:</label>
          <input type="text" class="form-control" id="name" placeholder="npr. lavanda" v-model="search.name">
        </div>
        <div class="col-12 col-md-4 mb-3">
          <label for="desc" class="form-label">Opis (sadnja i nega):</label>
          <input type="text" class="form-control" id="desc" placeholder="npr. zalivanje" v-model="search.description">
        </div>
        <div class="col-6 col-md-2 mb-3">
          <label for="type" class="form-label">Tip:</label>
          <select class="form-select" id="type" v-model="search.type">
            <option value="">Svi tipovi</option>
            <option v-for="t in types" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="col-6 col-md-2 mb-3">
          <label for="group" class="form-label">Ciljna grupa:</label>
          <select class="form-select" id="group" v-model="search.group">
            <option value="">Sve grupe</option>
            <option v-for="g in groups" :value="g">{{ g }}</option>
          </select>
        </div>
        <div class="col-12 col-md-3 mb-3">
          <label for="from" class="form-label">Proizvedeno od datuma:</label>
          <input type="date" class="form-control" id="from" v-model="search.producedFrom">
        </div>
        <div class="col-6 col-md-2 mb-3">
          <label for="pmin" class="form-label">Cena od:</label>
          <input type="number" min="0" class="form-control" id="pmin" placeholder="RSD" v-model="search.priceMin">
        </div>
        <div class="col-6 col-md-2 mb-3">
          <label for="pmax" class="form-label">Cena do:</label>
          <input type="number" min="0" class="form-control" id="pmax" placeholder="RSD" v-model="search.priceMax">
        </div>
        <div class="col-6 col-md-2 mb-3">
          <label for="rating" class="form-label">Ocena:</label>
          <select class="form-select" id="rating" v-model="search.minRating">
            <option value="">Bilo koja</option>
            <option value="4">4 i više</option>
            <option value="3">3 i više</option>
          </select>
        </div>
        <div class="col-12 col-md-3 mb-3">
          <label for="review" class="form-label">Tekst recenzije:</label>
          <input type="text" class="form-control" id="review" placeholder="npr. poklon" v-model="search.reviewText">
        </div>
        <div class="col-12 col-md-3 mb-3">
          <label for="sort" class="form-label">Redosled:</label>
          <select class="form-select" id="sort" v-model="sortBy">
            <option value="">Podrazumevani</option>
            <option value="price-asc">Cena: od najniže</option>
            <option value="price-desc">Cena: od najviše</option>
            <option value="rating">Najbolje ocenjene</option>
            <option value="newest">Najnovije sadnice</option>
          </select>
        </div>
      </div>
      <button type="button" class="btn btn-outline-primary" @click="resetFilters()">
        <i class="fa-solid fa-rotate-left"></i> Poništi pretragu
      </button>
      <span class="ms-3 text-body-secondary" aria-live="polite">
        Prikazano {{ filtered.length }} od {{ plants.length }} biljaka
      </span>
    </div>
  </form>

  <div class="row">
    <div class="col-12 col-sm-6 col-lg-4 mb-4" v-for="p in filtered" :key="p.id">
      <div class="card h-100 plant-card overflow-hidden">
        <PlantImage :title="p.wikiTitle" :alt="p.name" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-0">{{ p.name }}</h5>
          <small class="fst-italic text-body-secondary mb-2">{{ p.latin }}</small>
          <div class="mb-2">
            <StarRating :rating="PlantService.getAverage(p)" />
            <small class="ms-1 text-body-secondary">({{ PlantService.getReviews(p).length }})</small>
          </div>
          <div class="mb-2">
            <span class="badge text-bg-warning me-1" v-if="isForYou(p.types)"><i class="fa-solid fa-heart"></i> Za vas</span>
            <span class="badge text-bg-light border me-1" v-for="t in p.types">{{ t }}</span>
          </div>
          <div class="fw-bold fs-5 mt-auto mb-2">{{ formatPrice(p.price) }}</div>
          <div>
            <RouterLink :to="`/details/${p.id}`" class="btn btn-outline-primary btn-sm m-1">
              <i class="fa-solid fa-circle-info"></i> Detalji
            </RouterLink>
            <button type="button" class="btn btn-primary btn-sm m-1" @click="reserve(p.id)">
              <i class="fa-solid fa-basket-shopping"></i> Rezerviši
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <InfoCard title="Nema rezultata" v-if="filtered.length == 0">
    <p>Nijedna biljka ne odgovara zadatim kriterijumima. Proširite raspon cene ili uklonite neki kriterijum.</p>
    <button type="button" class="btn btn-primary" @click="resetFilters()">Poništi pretragu</button>
  </InfoCard>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(120deg, #4a1233, #d6457f);
}

/* Dekorativne latice */
.hero::before,
.hero::after {
  content: '';
  position: absolute;
  border-radius: 50% 0 50% 0;
  background: rgba(255, 255, 255, 0.12);
}

.hero::before {
  width: 280px;
  height: 280px;
  right: -70px;
  top: -80px;
  transform: rotate(25deg);
}

.hero::after {
  width: 170px;
  height: 170px;
  right: 150px;
  bottom: -70px;
  transform: rotate(-20deg);
}

.plant-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.plant-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(122, 29, 68, 0.18);
}

@media (prefers-reduced-motion: reduce) {
  .plant-card {
    transition: none;
  }
}
</style>
