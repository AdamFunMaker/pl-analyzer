<script setup>
    import { ref, onMounted, markRaw } from "vue";
    import { useDialog } from 'primevue/usedialog';
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    import { ItemService } from "@/service/ItemService";
    import { TransactionService } from "@/service/TransactionService.js";
    import Button from "primevue/button";
    import DatePicker from "primevue/datepicker";
    import Column from "primevue/column";
    import InputNumber from "primevue/inputnumber";
    import Select from "primevue/select";
    import Toolbar from "primevue/toolbar";
    import AddDialog from "@/components/dialogs/add/AddDialog.vue";
    import AddDialogFooter from "@/components/dialogs/add/AddDialogFooter.vue";
    import ImportDialog from "@/components/dialogs/import/ImportDialog.vue";
    import ImportDialogFooter from "@/components/dialogs/import/ImportDialogFooter.vue";
    import Table from "@/components/Table.vue";

    const transaction = "sales";
    const itemService = new ItemService();
    const transactionService = new TransactionService();
    const emit = defineEmits(["update-breadcrumbs"]);
    const dialog = useDialog();
    const confirm = useConfirm();
    const toast = useToast();    
    const items = ref([]);
    const sales = ref([]);
    const sales_table = ref();
    const selection = ref([]);
    const editingRows = ref([]);
    const isLoading = ref(true);    
    
    function loadSales() {
        transactionService.getTransactions(transaction).then((res) => {
            if (res.success) {
                sales.value = res.data;
            } else {
                toast.add({ severity: "error", summary: "Error Loading Sales", detail: res.error, life: 3000 });
            }

            isLoading.value = false;
        });
    }
    
    onMounted(() => {
        emit('update-breadcrumbs', [{label: "Transactions"}, {label: "Sales", to: "/transactions/sales"}]);
        loadSales();
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
                header: "Add New Sale",
                modal: true
            },
            templates: {
                footer: markRaw(AddDialogFooter)
            },
            data: {
                addFunction: transactionService.addTransaction,
                addFunctionParam: transaction,
                fields: [
                    { id: "date", label: "Date", type: "date", format: "dd/mm/yyyy", minimum: null, maximum: null, required: true },
                    { id: "item", label: "Item", type: "select", placeholder: "Select an Item", options: items, optionLabel: "description", optionValue: "id", required: true },
                    { id: "weight", label: "Weight", type: "number", minimum: 0, maximum: null, step: 0.1, minFractionDigits: 2, maxFractionDigits: 5, prefix: "", suffix: " kg", required: true },
                    { id: "price", label: "Unit Price", type: "currency", minimum: 0, maximum: null, required: true }
                ],
                newRecord: {},
                hasSubmitted: false
            },
            emits: {
                onError: (error) => {
                    toast.add({ severity: "error", summary: "Add Sale Failed", detail: error, life: 3000 });
                }
            },
            onClose: (options) => {
                if (options.data && options.data.success) {
                    toast.add({ severity: "success", summary: "Add Sale Successful", detail: `The sale for ${items.value.filter(item => item.id === options.data.record.item).map(item => item.description)[0]} on ${options.data.record.date.toLocaleString("en-MY", { dateStyle: "short" })} has been added successfully.`, life: 3000 });
                    loadSales();
                }
            }
        });
    }

    function openImportDialog() {
        dialog.open(ImportDialog, {
            props: {
                header: "Import Sales",
                modal: true
            },
            templates: {
                footer: markRaw(ImportDialogFooter)
            },
            data: {
                importFunction: transactionService.importTransactions,
                importFunctionParam: "sales",
                file: {
                    path: null,
                    name: null,
                    data: null
                },
                fields: [
                    { name: "date", label: "Date", type: "date", mapping: null},
                    { name: "category", label: "Category", type: "string", mapping: null},
                    { name: "item", label: "Description", type: "string", mapping: null},
                    { name: "weight", label: "Weight", type: "numeric", mapping: null},
                    { name: "price", label: "Unit Price", type: "numeric", mapping: null}
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
                    toast.add({ severity: "error", summary: "Import Sales Failed", detail: error, life: 3000 });
                }
            },
            onClose: (options) => {
                if (options.data && options.data.success) {
                    toast.add({ severity: "success", summary: "Import Sales Successful", detail: `Successfully imported ${options.data.result.rowsAffected} ${options.data.result.rowsAffected > 1 ? "sales" : "sale"} from ${options.data.file.name}`, life: 3000 });
                    loadSales();
                }
            }
        });
    }

    function editSale(event) {
        const { data, newData } = event;

        if (newData.date && newData.item_id && newData.weight && newData.price) {
            transactionService.editTransaction(transaction, { date: data.date, item: data.item_id }, newData).then((editRes) => {
                if (editRes.success) {
                    loadSales();
                    toast.add({ severity: "success", summary: "Edit Sale Successful", detail: `Sale for ${data.item} on ${data.date.toLocaleString("en-MY", { dateStyle: "short" })} has been edited successfully.`, life: 3000 });
                } else {
                    toast.add({ severity: "error", summary: "Edit Sale Failed", detail: editRes.error, life: 3000 });
                }
            });
        } else {
            toast.add({ severity: "error", summary: "Edit Sale Failed", detail: "Date, Item, Weight, and Unit Price are required.", life: 3000 });
        }
    }

    function deleteSales() {
        transactionService.deleteTransactions(transaction, selection.value.map(sale => { return { date: sale.date, item: sale.item_id }; })).then((delRes) => {
            if (delRes.success) {
                loadSales();
                toast.add({ severity: "success", summary: `Delete ${selection.value.length > 1 ? "Sales" : "Sale"} Successful`, detail: `${selection.value.length > 1 ? "Sales" : "Sale"} for ${selection.value.map(sale => sale.item).join(", ")} on ${selection.value.map(sale => new Date(sale.date).toLocaleString("en-MY", { dateStyle: "short" })).join(", ")} ${selection.value.length > 1 ? "have" : "has"} been deleted successfully.`, life: 3000 });
                selection.value = null;
            } else {
                toast.add({ severity: "error", summary: `Delete ${selection.value.length > 1 ? "Sales" : "Sale"} Failed`, detail: delRes.error, life: 3000 });
            }
        });
    }

    function confirmDelete() {
        confirm.require({
            message: `Are you sure you want to delete the selected ${selection.value.length > 1 ? "sales" : "sale"}?`,
            header: `Delete ${selection.value.length > 1 ? "Sales" : "Sale"}`,
            icon: "pi pi-trash",
            rejectLabel: "No",
            acceptLabel: "Yes",
            accept: deleteSales,
            severity: "danger",
            defaultFocus: "accept"
        });
    }

    function exportTable() {
        sales_table.value.exportXLSX();
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
            <Button label="Export" icon="pi pi-file-export" iconPos="right" severity="info" :disabled="!sales.length" @click="exportTable($event)"></Button>
        </template>
    </Toolbar>
    <Table ref="sales_table" title="Sales" :loading="isLoading" :value="sales" :dataKey="(data) => data.date + data.item_id" v-model:selection="selection" v-model:editingRows="editingRows" :saveEdit="editSale" exportFilename="Sales">
        <Column field="date" header="Date" style="width: 20ch" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{ data, field }">
                {{ data[field].toLocaleString("en-MY", {dateStyle: "short"}) }}
            </template>
            <template #editor="{ data, field}">
                <DatePicker v-model="data[field]" dateFormat="dd/mm/yy" showIcon showButtonBar :invalid="!data[field]" autofocus></DatePicker>
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
                <InputNumber v-model="data[field]" :min="0" :step="0.1" :minFractionDigits="2" :maxFractionDigits="5" suffix=" kg" showButtons :allowEmpty="false" :invalid="!data[field]" autofocus highlightOnFocus></InputNumber>
            </template>
        </Column>
        <Column field="price" header="Unit Price" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{ data, field }">
                {{ data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
            <template #editor="{ data, field }">
                <InputNumber mode="currency" currency="MYR" v-model="data[field]" :min="0" :step="0.01" :minFractionDigits="2" :maxFractionDigits="2" showButtons :allowEmpty="false" :invalid="!data[field]" autofocus highlightOnFocus></InputNumber>
            </template>
        </Column>        
        <Column field="selling_price" header="Selling Price" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{ data, field }">
                {{ data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
            <template #editor="{ data }">
                 {{ (data["price"] * data["weight"]).toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
            </template>
        </Column>
    </Table>
</template>
