<script setup>
    import { ref } from "vue";
    import Accordion from "primevue/accordion";
    import AccordionContent from "primevue/accordioncontent";
    import AccordionHeader from "primevue/accordionheader";
    import AccordionPanel from "primevue/accordionpanel";
    import ChartsPanel from "./ChartsPanel.vue";
    import ComparisonPanel from "./ComparisonPanel.vue";
    import DataPanel from "./DataPanel.vue";

    const props = defineProps({
        transaction: {
            type: String,
            required: true
        }
    });
    const isChartsLoading = ref(true);
</script>

<template>
    <Accordion :value="[]" multiple lazy>
        <AccordionPanel value="data">
            <AccordionHeader>Data</AccordionHeader>
            <AccordionContent>
                <DataPanel :transaction></DataPanel>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="comparison">
            <AccordionHeader>Comparison</AccordionHeader>
            <AccordionContent>
                <ComparisonPanel :transaction></ComparisonPanel>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="charts">
            <AccordionHeader>Charts</AccordionHeader>
            <AccordionContent>
                <BlockUI :blocked="isChartsLoading" :autoZIndex="false" :pt="{
                    mask: {
                        style: 'backdrop-filter: blur(2px)'
                    }
                }">
                    <ProgressSpinner v-if="isChartsLoading" :pt="{
                        root: {
                            style: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2'
                        }
                    }">
                    </ProgressSpinner>
                    <ChartsPanel v-model="isChartsLoading" :transaction></ChartsPanel>
                </BlockUI>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>