<script lang="ts" setup>
import { PlantService } from '@/services/plant.service'
import { onMounted, ref } from 'vue'

const { title, alt } = defineProps<{ title: string, alt: string }>()
const urls = ref<string[]>([])
const index = ref(0)

onMounted(async () => {
    urls.value = await PlantService.getImageUrls(title)
})

// Ako veća slika ne postoji, probaj manju; ako ni ona ne radi, prikaži zamenu
function failed() {
    index.value++
}
</script>

<template>
    <img v-if="urls[index]" :src="urls[index]" :alt="alt" class="plant-img" @error="failed">
    <div v-else class="plant-img plant-img-empty" role="img" :aria-label="alt">
        <i class="fa-solid fa-spa fa-3x"></i>
    </div>
</template>

<style scoped>
.plant-img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
}

.plant-img-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fde4ee, #f6b8d0);
    color: #c9407a;
}
</style>
