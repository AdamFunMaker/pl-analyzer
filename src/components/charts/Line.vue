<script setup>
    import { ref, watch } from "vue";
    import { useAppStateStore } from "@/stores/appstate";
    import Chart from "primevue/chart";
    import a11yLegend from "chartjs-plugin-a11y-legend";

    const props = defineProps({
        class: {
            type: String            
        },
        title: {
            type: String,
            default: "Line Chart"
        },
        data: {
            type: Object,
            default: () => {}
        },
        tooltipLabelFunction: {
            type: Function,
            default: context => context.raw
        },
        xAxisTitle: {
            type: String
        },
        yAxisTitle: {
            type: String
        },
        xAxisTickFunction: {
            type: Function,
            default: function(value) {
                return this.getLabelForValue(value)
            }
        },
        yAxisTickFunction: {
            type: Function,
            default: value => value
        }
    });

    const appstate = useAppStateStore();
    const options = ref({});

    function render() {
        const documentStyle = getComputedStyle(document.documentElement);
        let fontFamily = documentStyle.fontFamily;
        let fontSize = Number(documentStyle.fontSize.replace(/[^0-9]/g, ""));
        let textColor = documentStyle.getPropertyValue("--text-color");
        let surfaceBorder = documentStyle.getPropertyValue("--surface-border");

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
                }
            },
            scales: {
                x: {
                    title: {
                        display: !!props.xAxisTitle,
                        text: props.xAxisTitle,
                        font: {
                            family: fontFamily,
                            size: fontSize,
                            weight: "bold"
                        },
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    },
                    ticks: {
                        color: textColor,
                        callback: props.xAxisTickFunction
                    }
                },
                y: {
                    title: {
                        display: !!props.yAxisTitle,
                        text: props.yAxisTitle,
                        font: {
                            family: fontFamily,
                            size: fontSize,
                            weight: "bold"
                        },
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    },
                    ticks: {
                        color: textColor,
                        callback: props.yAxisTickFunction
                    }
                }
            }
        };
    }

    watch(() => appstate.dark, render, {immediate: true});
</script>

<template>
    <section :class="`flex flex-col items-center gap-4 ${props.class}`">
        <h5>{{ props.title }}</h5>
        <Chart type="line" :options :data="props.data" :plugins="[a11yLegend]" :pt="{
            root: {
                class: 'aspect-video'
            }
        }">
        </Chart>
    </section>
</template>