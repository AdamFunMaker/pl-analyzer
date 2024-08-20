<script setup>
    import { onMounted } from "vue";
    import Tab from "primevue/tab";
    import Tabs from "primevue/tabs";
    import TabList from "primevue/tablist";
    import TabPanel from "primevue/tabpanel";
    import TabPanels from "primevue/tabpanels";
    import Accordion from "@/components/analysis/AnalysisAccordion.vue";

    const emit = defineEmits(["update-breadcrumbs"]);

    onMounted(() => {
        emit("update-breadcrumbs", [{label: "Analysis"}]);
    });    
</script>

<template>
    <Tabs value="purchases" lazy>
        <TabList>
            <Tab value="purchases">Purchases</Tab>
            <Tab value="sales">Sales</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="purchases">
                <Accordion transaction="purchases"></Accordion>
            </TabPanel>
            <TabPanel value="sales">
                <Accordion transaction="sales"></Accordion>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>