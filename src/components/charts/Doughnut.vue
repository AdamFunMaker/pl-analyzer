<script setup>
    import { ref, onMounted, watch } from "vue";
    import { useLayout } from "@/layout/composables/layout.js";
    import Chart from "primevue/chart";
    import ChartDataLabels from 'chartjs-plugin-datalabels';

    const { isDarkMode } = useLayout();
    const options = ref({});

    const props = defineProps({
        title: {
            type: String,
            default: "Pie Chart"
        },
        data: {
            type: Object,
            default: () => {}
        },
        tooltipLabelFunction: {
            type: Function,
            default: (context) => {
                return context.raw
            }
        },
        pt: {
            type: Object
        }
    });

    const render = () => {
        const documentStyle = getComputedStyle(document.documentElement);
        options.value = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        font: {
                            family: documentStyle.fontFamily,
                            size: documentStyle.fontSize
                        },
                        color: documentStyle.getPropertyValue("--text-color")
                    }
                },
                tooltip: {
                    titleFont: {
                        family: documentStyle.fontFamily,
                        size: documentStyle.fontSize
                    },
                    bodyFont: {
                        family: documentStyle.fontFamily,
                        size: documentStyle.fontSize
                    },
                    callbacks: {
                        label: props.tooltipLabelFunction
                    }
                },
                datalabels: {
                    font: {
                        family: documentStyle.fontFamily,
                        size: documentStyle.fontSize
                    },
                    color: documentStyle.getPropertyValue("--text-color"),
                    formatter: (value, ctx) => {
                        return (value / ctx.dataset.data.reduce((sum, val) => sum + val)).toLocaleString("en-MY", {style: "percent", minimumFractionDigits: 2})
                    }
                }
            }
        };
    }

    onMounted(() => {
        watch(
            () => isDarkMode,
            render,
            { immediate: true }
        );
    });
</script>

<template>
    <section class="flex flex-col grow basis-0 gap-2">
        <h5 class="m-0 self-center">{{ props.title }}</h5>
        <Chart type="doughnut" :options :data="props.data" :plugins="[ChartDataLabels]" :pt></Chart>
    </section>
</template>