<script setup>
    import { ref, onMounted } from "vue";
    import { usePrimeVue } from "primevue/config";
    import { useToast } from "primevue/usetoast";
    import { AnalysisService } from "@/service/AnalysisService.js";
    import Column from "primevue/column";
    import TreeTable from "primevue/treetable";

    const props = defineProps({
        transaction: {
            type: String,
            required: true
        }
    });

    const primevue = usePrimeVue();
    const analysis = new AnalysisService();
    const toast = useToast();
    const value = ref([]);
    const expandedKeys = ref([]);
    const loading = ref(true);

    function loadData() {
        loading.value = true;
        analysis.getYears(props.transaction).then((res) => {
            if (res.success) {
                value.value = res.data;
            } else {
                toast.add({ severity: "error", summary: `Error Loading Yearly ${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Analysis Data`, detail: res.error, life: 3000 });
            }

            loading.value = false;
        });
    }

    onMounted(() => {
        loadData();
    });

    function loadChildrenData(node) {
        if (!node.children.length) {
            loading.value = true;
            let currentNode = { ...node };

            if (String(node.key).split("-").length === 1) {
                analysis.getMonths(props.transaction, node.data.year).then((res) => {
                    if (res.success) {
                        currentNode.children = res.data;
                        value.value = value.value.map((n) => {
                            if (n.key === node.key) {
                                n = currentNode;
                            }

                            return n;
                        });
                    } else {
                        toast.add({ severity: "error", summary: `Error Loading Monthly ${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Analysis Data`, detail: res.error, life: 3000 });
                    }

                    loading.value = false;
                });
            } else if (node.key.split("-").length === 2) {
                analysis.getCategories(props.transaction, node.key.split("-")[0], node.data.month).then((res) => {
                    if (res.success) {
                        currentNode.children = res.data;
                        value.value = value.value.map((n) => {
                            if (n.key == node.key.split("-")[0]) {
                                n.children = n.children.map((nc) => {
                                    if (nc.key === node.key) {
                                        nc = currentNode;
                                    }

                                    return nc;
                                });
                            }

                            return n;
                        });
                    } else {
                        toast.add({ severity: "error", summary: `Error Loading Categorical ${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Analysis Data`, detail: res.error, life: 3000 });
                    }

                    loading.value = false;
                });
            } else {
                analysis.getItems(props.transaction, Number(node.key.split("-")[0]), node.key.split("-")[1], node.data.category).then((res) => {
                    if (res.success) {
                        currentNode.children = res.data;
                        value.value = value.value.map((n) => {
                            if (n.key == node.key.split("-")[0]) {
                                n.children = n.children.map((nc) => {
                                    if (nc.key == [0, 1].map(x => node.key.split("-")[x]).join("-")) {
                                        nc.children = nc.children.map((ncc) => {
                                            if (ncc.key === node.key) {
                                                ncc = currentNode;
                                            }

                                            return ncc;
                                        });
                                    }

                                    return nc;
                                });
                            }

                            return n;
                        });
                    } else {
                        toast.add({ severity: "error", summary: `Error Loading ${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Analysis Data Items`, detail: res.error, life: 3000 });
                    }

                    loading.value = false;
                });
            }
        }
    }
</script>

<template>    
    <TreeTable v-model:expandedKeys="expandedKeys" :loading :value lazy rowHover scrollable scrollHeight="flex" autoLayout :indentation="0" @nodeExpand="loadChildrenData">
        <template #empty><span class="block w-full text-center">No record(s) found</span></template>
        <Column field="year" header="Year" expander></Column>
        <Column field="month" header="Month">
            <template #body="{ node, column }">
                {{ primevue.config.locale.monthNamesShort[node.data[column.props.field] - 1] }}
            </template>
        </Column>
        <Column field="category" header="Category"></Column>
        <Column field="item" header="Description"></Column>
        <Column field="weight" header="Weight">
            <template #body="{ node, column }">
                {{ `${node.data[column.props.field].toLocaleString("en-MY", {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg` }}
            </template>
        </Column>
        <template v-if="transaction === 'purchases'">
            <Column field="price" header="Buying Price">
                <template #body="{ node, column }">
                    {{ node.data[column.props.field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
                </template>
            </Column>
            
        </template>
        <template v-else>
            <Column field="selling_price" header="Selling Price">
                <template #body="{ node, column }">
                    {{ node.data[column.props.field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
                </template>
            </Column>
        </template>
        <Column field="average_price" header="Average Price">
            <template #body="{ node, column }">
                {{ node.data[column.props.field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
        </Column>
    </TreeTable>
</template>