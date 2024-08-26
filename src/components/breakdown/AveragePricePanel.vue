<script setup>
    import { ref, inject, watch } from "vue";
    import { usePrimeVue } from "primevue/config";
    import LineChart from "@/components/charts/Line.vue";
    import LoadingOverlay from "../LoadingOverlay.vue";

    const primevue = usePrimeVue();
    const interval = inject("interval");
    const data = inject("overviewBreakdownData");
    const chartsData = ref({});
    const loading = inject("isOverviewBreakdownLoading");

    function updateData(newData) {
        const documentStyle = getComputedStyle(document.documentElement);
        newData.map(record => record.category).filter((record, index, records) => index === records.findIndex(category => category === record)).forEach(category => {
            chartsData.value[category] = {
                labels: interval.value === "Monthly" ? newData.filter(record => record.category === category).map(record => `${primevue.config.locale.monthNamesShort[record.month - 1]} ${record.year}`) : newData.filter(record => record.category === category).map(record => record.year),
                datasets: [
                    {
                        label: "Buy",
                        data: newData.filter(record => record.category === category).map(record => record.buy_average_price),
                        backgroundColor: documentStyle.getPropertyValue("--p-blue-500"),
                        borderColor: documentStyle.getPropertyValue("--p-blue-500")
                    },
                    {
                        label: "Sell",
                        data: newData.filter(record => record.category === category).map(record => record.sell_average_price),
                        backgroundColor: documentStyle.getPropertyValue("--p-red-500"),
                        borderColor: documentStyle.getPropertyValue("--p-red-500")
                    }
                ]
            };
        });
    }

    watch(data, updateData, {immediate: true});
</script>

<template>
    <LoadingOverlay :loading="loading">
        <section class="grid grid-cols-12 gap-8">
            <LineChart v-for="(data, category) in chartsData" class="col-span-12 lg:col-span-6" :title="category" :data :tooltipLabelFunction="context => context.raw.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})" xAxisTitle="Date" yAxisTitle="Average Price (per kg)" :yAxisTickFunction="value => value.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"</LineChart>
        </section>
    </LoadingOverlay>
</template>