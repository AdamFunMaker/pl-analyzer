<script setup>
    import { ref, onMounted, markRaw } from "vue";
    import { useDialog } from "primevue/usedialog";
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    import { ItemService } from "@/service/ItemService.js";
    import Button from "primevue/button";
    import Column from "primevue/column";
    import InputText from "primevue/inputtext";
    import Select from "primevue/select";
    import Toolbar from "primevue/toolbar";
    import AddDialog from "@/components/dialogs/add/AddDialog.vue";
    import AddDialogFooter from "@/components/dialogs/add/AddDialogFooter.vue";
    import Table from "@/components/Table.vue";
    
    const transaction = "purchases";
    const itemService = new ItemService();
    const emit = defineEmits(["update-breadcrumbs"]);
    const dialog = useDialog();
    const confirm = useConfirm();
    const toast = useToast();
    const categories = ref([]);
    const items = ref([]);
    const selection = ref([]);
    const editingRows = ref([]);
    const isLoading = ref(true); 

    
    const loadItems = () => {
        itemService.getItems(transaction).then((res) => {
            if (res.success) {
                items.value = res.data;
            } else {
                toast.add({severity:"error", summary: "Error Loading Items", detail: res.error, life: 3000});
            }

            isLoading.value = false;
        });
    }
    
    onMounted(() => {
        emit("update-breadcrumbs", [{label: "Manage"}, {label: "Items"}, {label: "Purchases", to: "/manage/items/purchases"}]);
        loadItems();
        itemService.getCategories().then((res) => {
            if (res.success) {
                categories.value = res.data;
            } else {
                toast.add({severity:"error", summary: "Error Loading Item Categories", detail: res.error, life: 3000});
            }
        });
    });

    const openAddDialog = () => {
        dialog.open(AddDialog, {
            props: {
                header: "Add New Item",                
                modal: true
            },
            templates: {
                footer: markRaw(AddDialogFooter)
            },
            data: {
                addFunction: itemService.addItem,
                addFunctionParam: transaction,
                fields: [
                    {id: "description", label: "Description", type: "text", placeholder: "", required: true},
                    {id: "category", label: "Category", type: "select", placeholder: "Select a Category", options: categories, optionLabel: "name", optionValue: "id", required: true}
                ],
                newRecord: {},
                hasSubmitted: false
            },
            emits: {
                onError: (error) => {
                    toast.add({severity:"error", summary: "Add Item Failed", detail: error, life: 3000});
                }
            },
            onClose: (options) => {
                if (options.data && options.data.success) {
                    toast.add({severity:"success", summary: "Add Item Successful", detail: `${options.data.record.description} has been added successfully.`, life: 3000});
                    loadItems();
                }
            }
        });
    };

    const editItem = (event) => {
        const {newData} = event;
        
        if (newData.description?.trim() && newData.category_id) {
            itemService.editItem(transaction, newData.id, newData).then((editRes) => {
                if (editRes.success) {
                    loadItems();
                    toast.add({severity:"success", summary: "Edit Item Successful", detail: `${newData.description} has been edited successfully.`, life: 3000});
                } else {
                    toast.add({severity:"error", summary: "Edit Item Failed", detail: editRes.error, life: 3000});
                }
            });
        } else {
            toast.add({severity:"error", summary: "Edit Item Failed", detail: "Description and Category are required.", life: 3000});
        }
    };

    const deleteItems = () => {
        itemService.deleteItems(transaction, selection.value.map(item => item.id)).then((delRes) => {
            if (delRes.success) {
                loadItems();
                toast.add({severity:"success", summary: `Delete ${selection.value.length > 1 ? "Items" : "Item"} Successful`, detail: `${selection.value.map(item => item.description).join(", ")} ${selection.value.length > 1 ? "have" : "has"} been deleted successfully.`, life: 3000});
                selection.value = null;
            } else {
                toast.add({severity:"error", summary: `Delete ${selection.value.length > 1 ? "Items" : "Item"} Failed`, detail: delRes.error, life: 3000});
            }
        });
    };

    const confirmDelete = () => {
        confirm.require({
            message: `Are you sure you want to delete ${selection.value.map(item => item.description).join(", ")}?`,
            header: `Delete ${selection.value.length > 1 ? "Items" : "Item"}`,
            icon: "pi pi-trash",
            rejectLabel: "No",
            acceptLabel: "Yes",
            accept: deleteItems,
            severity: "danger",
            defaultFocus: "accept"
        });
    };
</script>

<template>
    <Toolbar>
        <template #start>
            <Button label="Add" icon="pi pi-plus" severity="success" class="mr-2" @click="openAddDialog"></Button>
            <Button label="Delete" icon="pi pi-trash" severity="danger" :disabled="!selection || !selection.length" @click="confirmDelete"></Button>
        </template>
    </Toolbar>
    <Table v-model:selection="selection" v-model:editingRows="editingRows" title="Purchases Items" :loading="isLoading" :value="items" dataKey="id" :saveEdit="editItem">
        <Column field="description" header="Description" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" :invalid="!data[field]" autofocus></InputText>
            </template>
        </Column>
        <Column field="category" header="Category" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #editor="{ data }">
                <Select v-model="data['category_id']" :options="categories" optionLabel="name" optionValue="id" placeholder="Select a Category"></Select>
            </template>
        </Column>
    </Table>   
</template>