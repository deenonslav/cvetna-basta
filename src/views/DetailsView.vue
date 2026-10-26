<script lang="ts" setup>
import InfoCard from '@/components/InfoCard.vue';
import PlantImage from '@/components/PlantImage.vue';
import StarRating from '@/components/StarRating.vue';
import { useReserve } from '@/hooks/reserve.hook';
import { PlantService } from '@/services/plant.service';
import { formatDate, formatPrice } from '@/utils';
import { useRoute } from 'vue-router';

const route = useRoute()
const plant = PlantService.getById(Number(route.params.id))
const reserve = useReserve()
</script>

<template>
  <div v-if="plant">
    <RouterLink to="/" class="btn btn-link ps-0"><i class="fa-solid fa-arrow-left"></i> Nazad na biljke</RouterLink>

    <div class="row">
      <div class="col-12 col-md-5 mb-3">
        <div class="card overflow-hidden"><PlantImage :title="plant.wikiTitle" :alt="plant.name" /></div>
      </div>
      <div class="col-12 col-md-7 mb-3">
        <h1 class="mb-0">{{ plant.name }}</h1>
        <p class="fst-italic text-body-secondary">{{ plant.latin }}</p>

        <div class="mb-3">
          <StarRating :rating="PlantService.getAverage(plant)" size="1.5rem" />
          <strong class="ms-2">{{ PlantService.getAverage(plant).toFixed(1) }} / 5</strong>
          <span class="text-body-secondary"> ({{ PlantService.getReviews(plant).length }} recenzija)</span>
        </div>

        <p>{{ plant.description }}</p>
        <dl>
          <dt><i class="fa-solid fa-hand-holding-seedling"></i> Sadnja</dt>
          <dd>{{ plant.planting }}</dd>
          <dt><i class="fa-solid fa-droplet"></i> Nega</dt>
          <dd>{{ plant.care }}</dd>
          <dt>Tip</dt>
          <dd><span class="badge text-bg-light border me-1" v-for="t in plant.types">{{ t }}</span></dd>
          <dt>Ciljna grupa</dt>
          <dd>{{ plant.targetGroups.join(', ') }}</dd>
          <dt>Datum proizvodnje sadnica/semena</dt>
          <dd>{{ formatDate(plant.producedAt) }}</dd>
        </dl>

        <div class="fs-3 fw-bold mb-3">{{ formatPrice(plant.price) }}</div>
        <button type="button" class="btn btn-primary btn-lg" @click="reserve(plant.id)">
          <i class="fa-solid fa-basket-shopping"></i> Rezerviši biljku
        </button>
      </div>
    </div>

    <h3 class="mt-4">Recenzije kupaca</h3>
    <div class="card mb-3" v-for="r in PlantService.getReviews(plant)">
      <div class="card-body py-2">
        <StarRating :rating="r.rating" /> <strong class="ms-2">{{ r.author }}</strong>
        <div>{{ r.text }}</div>
      </div>
    </div>
  </div>

  <InfoCard title="Nije pronađeno" v-else>
    <p>Tražena biljka ne postoji.</p>
    <RouterLink to="/" class="btn btn-primary">Nazad na biljke</RouterLink>
  </InfoCard>
</template>
