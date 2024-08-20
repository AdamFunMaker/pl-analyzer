<script setup>
    import { ref, onMounted, watch } from "vue";
    import { useLayout } from "@/layout/composables/layout.js";
    import Chart from "primevue/chart";

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
        }
    });

    const { isDarkTheme } = useLayout();
    const options = ref({});

    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Buy',
                data: [65, 59, 80, 81, 56, 55, 40],
                tension: 0.4
            },
            {
                label: 'Sell',
                data: [28, 48, 40, 19, 86, 27, 90],
                tension: 0.4
            }
        ]
    };

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
                //     callbacks: {
                //         label: props.tooltipLabelFunction
                //     }
                },
            },
            scales: {
                x: {
                    grid: {
                        color: surfaceBorder
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    grid: {
                        color: surfaceBorder
                    },
                    ticks: {
                        color: textColor
                    }
                }
            }
        };
    }

    onMounted(() => {
        watch(
            () => isDarkTheme.value,
            render,
            { immediate: true }
        );
    });
</script>

<template>
    <section :class="`flex flex-col items-center gap-4 ${props.class}`">
        <h5>{{ props.title }}</h5>
        <!-- <Chart type="line" :options :data="props.data" :pt="{
            root: {
                class: 'aspect-video'
            }
        }">
        </Chart> -->
        <Chart type="line" :options :data :pt="{
            root: {
                class: 'aspect-video'
            }
        }">
        </Chart>
    </section>
</template>