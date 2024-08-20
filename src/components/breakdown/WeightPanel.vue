<script setup>
    import { AnalysisService } from "@/service/AnalysisService.js";
    import LineChart from "@/components/charts/Line.vue";
    import LoadingOverlay from "../LoadingOverlay.vue";
</script>

<template>
    <LoadingOverlay>
        <section class="grid grid-cols-12 gap-4">
            <LineChart class="col-span-12 md:col-span-6 lg:col-span-4" title="test"></LineChart>
            <LineChart class="col-span-12 md:col-span-6 lg:col-span-4" title="test"></LineChart>
            <LineChart class="col-span-12 md:col-span-6 lg:col-span-4" title="test"></LineChart>
        </section>
    </LoadingOverlay>
</template>