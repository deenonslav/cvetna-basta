<script lang="ts" setup>
// Ocena se prikazuje zvezdicama i brojem, da bude uočljiva i laka za razumevanje
const { rating, size } = defineProps<{ rating: number, size?: string }>()
</script>

<template>
    <span class="star" :style="{ fontSize: size ?? '1rem' }" :aria-label="`Ocena ${rating.toFixed(1)} od 5`"
        :title="`${rating.toFixed(1)} / 5`">
        <i v-for="i in 5" :key="i" :class="i <= Math.round(rating) ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
    </span>
</template>
