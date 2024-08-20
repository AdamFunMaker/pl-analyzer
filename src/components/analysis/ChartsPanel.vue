<script setup>
    import { ref, onMounted } from "vue";
    import { useToast } from "primevue/usetoast";
    import { AnalysisService } from "@/service/AnalysisService.js";
    import DatePicker from "primevue/datepicker";
    import Toolbar from "primevue/toolbar";
    import DoughnutChart from "@/components/charts/Doughnut.vue";
    import LoadingOverlay from "../LoadingOverlay.vue";

    const props = defineProps({
        transaction: {
            type: String,
            required: true
        }
    });

    const analysis = new AnalysisService();
    const toast = useToast();
    const period = ref([new Date(), new Date()]);
    const range = ref([null, null]);
    const data = ref([]);
    const weightChartData = ref({});
    const priceChartData = ref({});
    const loading = ref(true);    

    const loadData = () => {
        loading.value = true;
        analysis.getCategoriesByPeriod(props.transaction, range.value).then((res) => {
            if (res.success) {
                data.value = res.data;
                weightChartData.value = {
                    labels: data.value.map(record => record.category),
                    datasets: [
                        {
                            data: data.value.map(record => record.weight)
                        }
                    ]
                };
                priceChartData.value = {
                    labels: data.value.map(record => record.category),
                    datasets: [
                        {
                            data: data.value.map(record => record.price)
                        }
                    ]
                };
            } else {
                toast.add({severity:"error", summary: `Error Loading Categorical ${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Analysis Data`, detail: res.error, life: 3000});
            }

            loading.value = false;
        });
    }

    onMounted(() => {
        analysis.getComparisonRange(props.transaction).then((res) => {
            if (res.success) {
                period.value = [res.data.min_date, res.data.max_date];
                range.value = period.value;
                loadData();
            } else {
                toast.add({severity:"error", summary: `Error Loading ${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Analysis Range`, detail: res.error, life: 3000});
            }
        });
    });
</script>

<template>
    <LoadingOverlay :loading>
        <Toolbar class="my-3">
            <template #start>
                <article class="flex items-center gap-2">
                    Period:
                    <DatePicker v-model="range" dateFormat="M yy" view="month" :minDate="period[0]" :maxDate="period[1]" selectionMode="range" showIcon :manualInput="false" @update:modelValue="loadData"></DatePicker>
                </article>
            </template>
        </Toolbar>
        <section class="grid grid-cols-12 gap-8">
            <DoughnutChart class="col-span-12 lg:col-span-6" :title="`${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Weight by Category`" :data="weightChartData" :tooltipLabelFunction="(context) => `${context.raw.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`"></DoughnutChart>
            <DoughnutChart class="col-span-12 lg:col-span-6" :title="`${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Price by Category`" :data="priceChartData" :tooltipLabelFunction="(context) => context.raw.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></DoughnutChart>
        </section>
    </LoadingOverlay>
</template>