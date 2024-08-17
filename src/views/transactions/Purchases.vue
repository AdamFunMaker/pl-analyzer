<script setup>
    import { ref, onMounted, markRaw } from "vue";
    import { usePrimeVue } from "primevue/config";
    import { useDialog } from "primevue/usedialog";
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    import { ItemService } from "@/service/ItemService";
    import { TransactionService } from "@/service/TransactionService.js";
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

    const transaction = "purchases";
    const itemService = new ItemService();
    const transactionService = new TransactionService();
    const emit = defineEmits(["update-breadcrumbs"]);
    const primevue = usePrimeVue();
    const dialog = useDialog();
    const confirm = useConfirm();
    const toast = useToast();    
    const items = ref([]);
    const purchases = ref([]);
    const purchases_table = ref();
    const selection = ref([]);
    const editingRows = ref([]);
    const isLoading = ref(true);    
    
    function loadPurchases() {
        transactionService.getTransactions(transaction).then((res) => {
            if (res.success) {
                purchases.value = res.data;
            } else {
                toast.add({ severity: "error", summary: "Error Loading Purchases", detail: res.error, life: 3000 });
            }

            isLoading.value = false;
        });
    }
    
    onMounted(() => {
        emit('update-breadcrumbs', [{label: "Transactions"}, {label: "Purchases", to: "/transactions/purchases"}]);
        loadPurchases();
        itemService.getItems(transaction).then((res) => {
            if (res.success) {
                items.value = res.data;
            } else {
                toast.add({severity:"error", summary: "Error Loading Items", detail: res.error, life: 3000});
            }
        });        
    });

    function openAddDialog() {
        dialog.open(AddDialog, {
            props: {
                header: "Add New Purchase",
                modal: true
            },
            templates: {
                footer: markRaw(AddDialogFooter)
            },
            data: {
                addFunction: transactionService.addTransaction,
                addFunctionParam: transaction,
                fields: [
                    { id: "date", label: "Date", type: "month", minimum: null, maximum: null, required: true },
                    { id: "item", label: "Item", type: "select", placeholder: "Select an Item", options: items, optionLabel: "description", optionValue: "id", required: true },
                    { id: "weight", label: "Weight", type: "number", minimum: 0, maximum: null, step: 0.1, minFractionDigits: 2, maxFractionDigits: 5, prefix: "", suffix: " kg", required: true },
                    { id: "price", label: "Buying Price", type: "currency", minimum: 0, maximum: null, required: true }
                ],
                newRecord: {},
                hasSubmitted: false
            },
            emits: {
                onError: (error) => {
                    toast.add({ severity: "error", summary: "Add Purchase Failed", detail: error, life: 3000 });
                }
            },
            onClose: (options) => {
                if (options.data && options.data.success) {
                    toast.add({ severity: "success", summary: "Add Purchase Successful", detail: `The purchase for ${items.value.filter(item => item.id == options.data.record.item).map(item => item.description)[0]} on ${new Date(options.data.record.date).toLocaleString("en-MY", { month: "short", year: "numeric" })} has been added successfully.`, life: 3000 });
                    loadPurchases();
                }
            }
        });
    }

    function openImportDialog() {
        dialog.open(ImportDialog, {
            props: {
                header: "Import Purchases",
                modal: true
            },
            templates: {
                footer: markRaw(ImportDialogFooter)
            },
            data: {
                importFunction: transactionService.importTransactions,
                importFunctionParam: "purchases",
                file: {
                    path: null,
                    name: null,
                    data: null
                },
                fields: [
                    { name: "year", label: "Year", type: "year", mapping: null },
                    { name: "month", label: "Month", type: "month", mapping: null },
                    { name: "category", label: "Category", type: "string", mapping: null },
                    { name: "item", label: "Description", type: "string", mapping: null },
                    { name: "weight", label: "Weight", type: "numeric", mapping: null },
                    { name: "price", label: "Buying Price", type: "numeric", mapping: null }
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
                    toast.add({ severity: "error", summary: "Import Purchases Failed", detail: error, life: 3000 });
                }
            },
            onClose: (options) => {
                if (options.data && options.data.success) {
                    toast.add({ severity: "success", summary: "Import Purchases Successful", detail: `Successfully imported ${options.data.result.rowsAffected} ${options.data.result.rowsAffected > 1 ? "purchases" : "purchase"} from ${options.data.file.name}`, life: 3000 });
                    loadPurchases();
                }
            }
        });
    }

    function editPurchase(event) {
        const { data, newData } = event;

        if (newData.year && typeof (newData.month) === "number" && newData.item_id && newData.weight && newData.price) {
            newData.date = new Date(newData.year, newData.month - 1);
            transactionService.editTransaction(transaction, { date: data.date, item: data.item_id }, newData).then((editRes) => {
                if (editRes.success) {
                    loadPurchases();
                    toast.add({ severity: "success", summary: "Edit Purchase Successful", detail: `Purchase for ${data.item} on ${data.date.toLocaleString("en-MY", { month: "short", year: "numeric" })} has been edited successfully.`, life: 3000 });
                } else {
                    toast.add({ severity: "error", summary: "Edit Purchase Failed", detail: editRes.error, life: 3000 });
                }
            });
        } else {
            toast.add({ severity: "error", summary: "Edit Purchase Failed", detail: "Year, Month, Item, Weight, and Buying Price are required.", life: 3000 });
        }
    }

    function deletePurchases() {
        transactionService.deleteTransactions(transaction, selection.value.map(purchase => { return { date: purchase.date, item: purchase.item_id }; })).then((delRes) => {
            if (delRes.success) {
                loadPurchases();
                toast.add({ severity: "success", summary: `Delete ${selection.value.length > 1 ? "Purchases" : "Purchase"} Successful`, detail: `${selection.value.length > 1 ? "Purchases" : "Purchase"} for ${selection.value.map(purchase => purchase.item).join(", ")} on ${selection.value.map(purchase => new Date(purchase.date).toLocaleString("en-MY", { month: "short", year: "numeric" })).join(", ")} ${selection.value.length > 1 ? "have" : "has"} been deleted successfully.`, life: 3000 });
                selection.value = null;
            } else {
                toast.add({ severity: "error", summary: `Delete ${selection.value.length > 1 ? "Purchases" : "Purchase"} Failed`, detail: delRes.error, life: 3000 });
            }
        });
    }

    function confirmDelete() {
        confirm.require({
            message: `Are you sure you want to delete the selected ${selection.value.length > 1 ? "purchases" : "purchase"}?`,
            header: `Delete ${selection.value.length > 1 ? "Purchases" : "Purchase"}`,
            icon: "pi pi-trash",
            rejectLabel: "No",
            acceptLabel: "Yes",
            accept: deletePurchases,
            severity: "danger",
            defaultFocus: "accept"
        });
    }

    function exportTable() {
        purchases_table.value.exportXLSX();
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
            <Button label="Export" icon="pi pi-file-export" iconPos="right" severity="info" :disabled="!purchases.length" @click="exportTable($event)"></Button>
        </template>
    </Toolbar>
    <Table ref="purchases_table" v-model:selection="selection" v-model:editingRows="editingRows" title="Purchases" :loading="isLoading" :value="purchases" :dataKey="(data) => data.date + data.item_id" :globalFilterFields="['year', (data) => primevue.config.locale.monthNamesShort[data.month - 1], 'category', 'item', 'weight', 'price', 'average_price']" :saveEdit="editPurchase" exportFilename="Purchases">
        <Column field="year" header="Year" style="width: 6ch" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" :min="0" :max="9999" :step="1" :useGrouping="false" showButtons :allowEmpty="false" :invalid="!data[field]" autofocus highlightOnFocus inputStyle="width: calc(6ch + var(--p-inputnumber-button-width))"></InputNumber>
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
        <Column field="category" header="Category" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #editor="{ data }">
                 {{ items.filter(item => item.id == data["item_id"])[0].category }}
            </template>
        </Column>
        <Column field="item" header="Description" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #editor="{ data }">
                <Select v-model="data['item_id']" :options="items" optionLabel="description" optionValue="id" placeholder="Select an Item"></Select>
            </template>
        </Column>
        <Column field="weight" header="Weight" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{ data, field }">
                {{ `${data[field].toLocaleString("en-MY", {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg` }}
            </template>
            <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" :min="0" :step="0.1" :minFractionDigits="2" :maxFractionDigits="5" showButtons :allowEmpty="false" :invalid="!data[field]" autofocus :highlightOnFocus="true"></InputNumber>
            </template>
        </Column>
        <Column field="price" header="Buying Price" sortable>
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
        <Column field="average_price" header="Average Price" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{ data, field }">
                {{ data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
            <template #editor="{ data }">
                 {{ (data["price"] / data["weight"]).toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
        </Column>
    </Table>
</template>
