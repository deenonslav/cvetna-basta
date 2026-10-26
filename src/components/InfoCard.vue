<script lang="ts" setup>
export interface InfoCardProps {
    title?: string
}

const { title } = defineProps<InfoCardProps>()
</script>

<template>
    <div class="card info-card text-center mb-3">
        <div class="card-header">
            <strong>{{ title ?? 'Info' }}</strong>
        </div>
        <div class="card-body mx-auto">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.info-card {
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
}
</style>