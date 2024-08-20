<script setup>
    import Accordion from "primevue/accordion";
    import AccordionContent from "primevue/accordioncontent";
    import AccordionHeader from "primevue/accordionheader";
    import AccordionPanel from "primevue/accordionpanel";
    import WeightPanel from "./WeightPanel.vue";
    import PricePanel from "./PricePanel.vue";    
</script>

<template>
    <Accordion multiple lazy>
        <AccordionPanel value="weight">
            <AccordionHeader>Weight</AccordionHeader>
            <AccordionContent>
                <WeightPanel></WeightPanel>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="price">
            <AccordionHeader>Price</AccordionHeader>
            <AccordionContent>
                <PricePanel></PricePanel>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>