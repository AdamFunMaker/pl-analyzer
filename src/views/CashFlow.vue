<script setup>
    import { ref, onMounted, markRaw } from "vue";
    import { usePrimeVue } from "primevue/config";
    import { useDialog } from "primevue/usedialog";
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    import { CashFlowService } from "@/service/CashFlowService.js";
    import Button from "primevue/button";
    import Column from "primevue/column";
    import InputNumber from "primevue/inputnumber";
    import Select from "primevue/select";
    import Toolbar from "primevue/toolbar";
    import AddDialog from "@/components/dialogs/add/AddDialog.vue";
    import AddDialogFooter from "@/components/dialogs/add/AddDialogFooter.vue";
    import ImportDialog from "@/components/dialogs/import/ImportDialog.vue";
    import ImportDialogFooter from "@/components/dialogs/import/ImportDialogFooter.vue";
    import Table from "@/components/Table.vue";

    const cashFlowService = new CashFlowService();
    const emit = defineEmits(['update-breadcrumbs']);
    const primevue = usePrimeVue();
    const dialog = useDialog();
    const confirm = useConfirm();
    const toast = useToast();
    const cash_flow_table = ref();
    const data = ref([]);
    const selection = ref([]);
    const editingRows = ref([]);
    const isLoading = ref(true);

    function loadCashFlow() {
        cashFlowService.getCashFlow().then((res) => {
            if (res.success) {
                data.value = res.data;
            } else {
                toast.add({ severity: "error", summary: "Error Loading Cash Flow", detail: res.error, life: 3000 });
            }

            isLoading.value = false;
        });
    }

    onMounted(() => {
        emit('update-breadcrumbs', [{label: "Cash Flow", to: "/cash-flow"}]);
        loadCashFlow();
    });

    function openAddDialog() {
        dialog.open(AddDialog, {
            props: {
                header: "Add New Cash Flow",
                modal: true
            },
            templates: {
                footer: markRaw(AddDialogFooter)
            },
            data: {
                addFunction: cashFlowService.addCashFlow,
                fields: [
                    { id: "date", label: "Date", type: "month", minimum: null, maximum: null, required: true },
                    { id: "salary", label: "Salary", type: "currency", minimum: 0, maximum: null, required: true },
                    { id: "expenses", label: "Expenses", type: "currency", minimum: 0, maximum: null, required: true },
                    { id: "petty_cash", label: "Petty Cash", type: "currency", minimum: 0, maximum: null, required: true },
                ],
                newRecord: {},
                hasSubmitted: false
            },
            emits: {
                onError: (error) => {
                    toast.add({ severity: "error", summary: "Add Cash Flow Failed", detail: error, life: 3000 });
                }
            },
            onClose: (options) => {
                if (options.data && options.data.success) {
                    toast.add({ severity: "success", summary: "Add Cash Flow Successful", detail: `The cash flow for ${options.data.record.date.toLocaleString("en-MY", { month: "short", year: "numeric" })} has been added successfully.`, life: 3000 });
                    loadCashFlow();
                }
            }
        });
    }

    function openImportDialog() {
        dialog.open(ImportDialog, {
            props: {
                header: "Import Cash Flow",
                modal: true
            },
            templates: {
                footer: markRaw(ImportDialogFooter)
            },
            data: {
                importFunction: cashFlowService.importCashFlow,
                file: {
                    path: null,
                    name: null,
                    data: null
                },
                fields: [
                    { name: "year", label: "Year", type: "year", mapping: null },
                    { name: "month", label: "Month", type: "month", mapping: null },
                    { name: "salary", label: "Salary", type: "numeric", mapping: null },
                    { name: "expenses", label: "Expenses", type: "numeric", mapping: null },
                    { name: "petty_cash", label: "Petty Cash", type: "numeric", mapping: null }
                ],
                options: {
                    overwrite: false,
                    worksheet: null,
                    header_row: 1
                },
                isLoading: false,
                hasSubmitted: false
            },
            emits: {
                onError: (error) => {
                    toast.add({ severity: "error", summary: "Import Cash Flow Failed", detail: error, life: 3000 });
                }
            },
            onClose: (options) => {
                if (options.data && options.data.success) {
                    toast.add({ severity: "success", summary: "Import Cash Flow Successful", detail: `Successfully imported ${options.data.result.rowsAffected} ${options.data.result.rowsAffected > 1 ? "records" : "record"} from ${options.data.file.name}`, life: 3000 });
                    loadCashFlow();
                }
            }
        });
    }

    function editCashFlow(event) {
        const { data, newData } = event;

        if (newData.year && typeof (newData.month) === "number" && newData.salary && newData.expenses && newData.petty_cash) {
            newData.date = new Date(newData.year, newData.month - 1);
            cashFlowService.editCashFlow(data.date, newData).then((editRes) => {
                if (editRes.success) {
                    loadCashFlow();
                    toast.add({ severity: "success", summary: "Edit Cash Flow Successful", detail: `Cash flow for ${newData.date.toLocaleString("en-MY", { month: "short", year: "numeric" })} has been edited successfully.`, life: 3000 });
                } else {
                    toast.add({ severity: "error", summary: "Edit Cash Flow Failed", detail: editRes.error, life: 3000 });
                }
            });
        } else {
            toast.add({ severity: "error", summary: "Edit Cash Flow Failed", detail: "Year, Month, Salary, Expenses, and Petty Cash are required.", life: 3000 });
        }
    }

    function deleteCashFlow() {
        cashFlowService.deleteCashFlow(selection.value.map(cashFlow => cashFlow.date)).then((delRes) => {
            if (delRes.success) {
                loadCashFlow();
                toast.add({ severity: "success", summary: `Delete Cash ${selection.value.length > 1 ? "Flows" : "Flow"} Successful`, detail: `Cash ${selection.value.length > 1 ? "flows" : "flow"} for ${selection.value.map(cashFlow => cashFlow.date.toLocaleString("en-MY", { month: "short", year: "numeric" })).join(", ")} ${selection.value.length > 1 ? "have" : "has"} been deleted successfully.`, life: 3000 });
                selection.value = null;
            } else {
                toast.add({ severity: "error", summary: `Delete Cash ${selection.value.length > 1 ? "Flows" : "Flow"} Failed`, detail: delRes.error, life: 3000 });
            }
        });
    }

    function confirmDelete() {
        confirm.require({
            message: "Are you sure you want to delete the selected cash flow?",
            header: `Delete Cash Flow`,
            icon: "pi pi-trash",
            rejectLabel: "No",
            acceptLabel: "Yes",
            accept: deleteCashFlow,
            severity: "danger",
            defaultFocus: "accept"
        });
    }

    function formatExport(record) {
        switch (record.field) {
            case "salary":
            case "expenses":
            case "petty_cash":
                return record.data.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            default:
                return record.data;
        }
    }

    function exportTable() {
        cash_flow_table.value.exportXLSX();
    }
</script>

<template>
    <Toolbar>
        <template #start>
            <Button label="Add" icon="pi pi-plus" severity="success" class="mr-2" @click="openAddDialog"></Button>
            <Button label="Delete" icon="pi pi-trash" severity="danger" :disabled="!selection || !selection.length" @click="confirmDelete"></Button>
        </template>
        <template #end>
            <Button label="Import" icon="pi pi-file-import" iconPos="right" class="mr-2" @click="openImportDialog"></Button>
            <Button label="Export" icon="pi pi-file-export" iconPos="right" severity="info" :disabled="!data.length" @click="exportTable($event)"></Button>
        </template>
    </Toolbar>
    <Table ref="cash_flow_table" v-model:selection="selection" v-model:editingRows="editingRows" :loading="isLoading" title="Cash Flow" :value="data" dataKey="date" :globalFilterFields="['year', (data) => primevue.config.locale.monthNamesShort[data.month - 1], 'salary', 'expenses', 'petty_cash']" :saveEdit="editCashFlow" exportFilename="Cash Flow" :exportFunction="formatExport">
        <Column field="year" header="Year" style="width: 6ch" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>            
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" :min="0" :max="9999" :step="1" :useGrouping="false" showButtons :allowEmpty="false" :invalid="!data[field]" autofocus highlightOnFocus :inputStyle="{width: 'calc(6ch + var(--p-inputnumber-button-width))'}"></InputNumber>
            </template>
        </Column>
        <Column field="month" header="Month" style="width: 7ch" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{ data, field }">
                {{ primevue.config.locale.monthNamesShort[data[field] - 1] }}
            </template>
            <template #editor="{ data, field}">
                <Select v-model="data[field]" :options="primevue.config.locale.monthNamesShort.map((value, index) => {return {label: value, value: index + 1}})" optionLabel="label" optionValue="value" autofocus></Select>
            </template>
        </Column>
        <Column field="salary" header="Salary" style="width: calc((100% - 13ch - var(--p-checkbox-width)) / 3)" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>            
            <template #body="{ data, field }">
                {{ data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
            <template #editor="{ data, field }">
                <InputNumber mode="currency" currency="MYR" v-model="data[field]" :min="0" :step="0.01" :minFractionDigits="2" :maxFractionDigits="2" showButtons :allowEmpty="false" :invalid="!data[field]" autofocus :highlightOnFocus="true"></InputNumber>
            </template>
        </Column>
        <Column field="expenses" header="Expenses" style="width: calc((100% - 13ch - var(--p-checkbox-width)) / 3)" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>            
            <template #body="{ data, field }">
                {{ data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
            <template #editor="{ data, field }">
                <InputNumber mode="currency" currency="MYR" v-model="data[field]" :min="0" :step="0.01" :minFractionDigits="2" :maxFractionDigits="2" showButtons :allowEmpty="false" :invalid="!data[field]" autofocus :highlightOnFocus="true"></InputNumber>
            </template>
        </Column>
        <Column field="petty_cash" header="Petty Cash" style="width: calc((100% - 13ch - var(--p-checkbox-width)) / 3)" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>            
            <template #body="{ data, field }">
                {{ data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
            <template #editor="{ data, field }">
                <InputNumber mode="currency" currency="MYR" v-model="data[field]" :min="0" :step="0.01" :minFractionDigits="2" :maxFractionDigits="2" showButtons :allowEmpty="false" :invalid="!data[field]" autofocus :highlightOnFocus="true"></InputNumber>
            </template>
        </Column>
    </Table>
</template>