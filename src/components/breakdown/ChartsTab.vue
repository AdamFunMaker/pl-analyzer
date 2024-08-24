<script setup>
    import { inject } from "vue";
    import Accordion from "primevue/accordion";
    import AccordionContent from "primevue/accordioncontent";
    import AccordionHeader from "primevue/accordionheader";
    import AccordionPanel from "primevue/accordionpanel";
    import WeightPanel from "./WeightPanel.vue";
    import PricePanel from "./PricePanel.vue";

    const data = inject("overviewBreakdownData");
</script>

<template>
    <Accordion multiple lazy>
        <AccordionPanel value="weight">
            <AccordionHeader>Weight</AccordionHeader>
            <AccordionContent>
                <WeightPanel v-if="data.length"></WeightPanel>
                <span v-else class="block w-full text-center">No data</span>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="price">
            <AccordionHeader>Price</AccordionHeader>
            <AccordionContent>
                <PricePanel v-if="data.length"></PricePanel>
                <span v-else class="block w-full text-center">No data</span>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>