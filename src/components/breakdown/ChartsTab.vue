<script setup>
    import { inject } from "vue";
    import Accordion from "primevue/accordion";
    import AccordionContent from "primevue/accordioncontent";
    import AccordionHeader from "primevue/accordionheader";
    import AccordionPanel from "primevue/accordionpanel";
    import AveragePricePanel from "./AveragePricePanel.vue";
    import LoadingOverlay from "../LoadingOverlay.vue";
    import PricePanel from "./PricePanel.vue";
    import WeightPanel from "./WeightPanel.vue";

    const props = defineProps({
        loading: {
            type: Boolean,
            default: true
        }
    });
    const data = inject("overviewBreakdownData");    
</script>

<template>
    <Accordion multiple lazy>
        <AccordionPanel value="weight">
            <AccordionHeader>Weight</AccordionHeader>
            <AccordionContent>
                <LoadingOverlay :loading="props.loading">
                    <WeightPanel v-if="data.length"></WeightPanel>
                    <span v-else class="block w-full text-center">No data</span>
                </LoadingOverlay>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="price">
            <AccordionHeader>Price</AccordionHeader>
            <AccordionContent>
                <LoadingOverlay :loading="props.loading">
                    <PricePanel v-if="data.length"></PricePanel>
                    <span v-else class="block w-full text-center">No data</span>
                </LoadingOverlay>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="average_price">
            <AccordionHeader>Average Price</AccordionHeader>
            <AccordionContent>
                <LoadingOverlay :loading="props.loading">
                    <AveragePricePanel v-if="data.length"></AveragePricePanel>
                    <span v-else class="block w-full text-center">No data</span>
                </LoadingOverlay>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>