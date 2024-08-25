<script setup>
    import { ref, watch } from "vue";
    import { useLayout } from "@/layout/composables/layout.js";
    import Chart from "primevue/chart";
    import a11yLegend from "chartjs-plugin-a11y-legend";
    import ChartDataLabels from "chartjs-plugin-datalabels";

    const props = defineProps({
        class: {
            type: String            
        },
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
            default: context => context.raw
        }
    });

    const { isDarkTheme } = useLayout();
    const options = ref({});

    function render() {
        const documentStyle = getComputedStyle(document.documentElement);
        const fontFamily = documentStyle.fontFamily;
        const fontSize = Number(documentStyle.fontSize.replace(/[^0-9]/g, ""));
        const textColor = documentStyle.getPropertyValue("--text-color");
        options.value = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        font: {
                            family: fontFamily,
                            size: fontSize
                        },
                        color: textColor
                    }
                },
                tooltip: {
                    position: "nearest",
                    titleFont: {
                        family: fontFamily,
                        size: fontSize
                    },
                    bodyFont: {
                        family: fontFamily,
                        size: fontSize
                    },
                    callbacks: {
                        label: props.tooltipLabelFunction
                    }
                },
                datalabels: {
                    font: {
                        family: fontFamily,
                        size: fontSize
                    },
                    color: textColor,
                    formatter: (value, ctx) => {
                        return (value / ctx.dataset.data.reduce((sum, val) => sum + val)).toLocaleString("en-MY", { style: "percent", minimumFractionDigits: 2 });
                    }
                }
            }
        };
    }

    watch(isDarkTheme, render, { immediate: true });
</script>

<template>
    <section :class="`flex flex-col items-center gap-4 ${props.class}`">
        <h5>{{ props.title }}</h5>
        <Chart type="doughnut" :options :data="props.data" :plugins="[a11yLegend, ChartDataLabels]" :pt="{
            root: {
                class: 'aspect-square'
            }
        }">
        </Chart>
    </section>
</template>