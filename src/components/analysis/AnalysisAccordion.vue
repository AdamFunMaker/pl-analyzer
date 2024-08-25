<script setup>
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
</script>

<template>
    <Accordion multiple lazy>
        <AccordionPanel value="data">
            <AccordionHeader>Data</AccordionHeader>
            <AccordionContent>
                <DataPanel :transaction></DataPanel>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="charts">
            <AccordionHeader>Charts</AccordionHeader>
            <AccordionContent>
                <ChartsPanel :transaction></ChartsPanel>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="comparison">
            <AccordionHeader>Periods Comparison</AccordionHeader>
            <AccordionContent>
                <ComparisonPanel :transaction></ComparisonPanel>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>