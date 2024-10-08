<script setup>
    import { ref, onMounted, markRaw } from "vue";
    import { useDialog } from 'primevue/usedialog';
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    import { ItemService } from "@/service/ItemService.js";
    import { highlightMatch } from "@/utils/text.js";
    import Button from "primevue/button";
    import Column from "primevue/column";
    import InputText from "primevue/inputtext";
    import ToggleButton from "primevue/togglebutton";
    import Toolbar from "primevue/toolbar";
    import AddDialog from "@/components/dialogs/add/AddDialog.vue";
    import AddDialogFooter from "@/components/dialogs/add/AddDialogFooter.vue";
    import Table from "@/components/Table.vue";
    
    const itemService = new ItemService();
    const emit = defineEmits(['update-breadcrumbs']);
    const dialog = useDialog();
    const confirm = useConfirm();
    const toast = useToast();
    const categories_table = ref();
    const categories = ref([]);
    const selection = ref([]);
    const editingRows = ref([]);
    const isLoading = ref(true);

    function loadCategories() {
        itemService.getCategories().then((res) => {
            if (res.success) {
                categories.value = res.data;
            } else {
                toast.add({ severity: "error", summary: "Error Loading Categories", detail: res.error, life: 3000 });
            }

            isLoading.value = false;
        });
    }
        
    onMounted(() => {
        emit('update-breadcrumbs', [{label: "Manage"}, {label: "Categories", to: "/manage/categories"}]);
        loadCategories();
    });

    function openAddDialog() {
        dialog.open(AddDialog, {
            props: {
                header: "Add New Category",
                modal: true
            },
            templates: {
                footer: markRaw(AddDialogFooter)
            },
            data: {
                addFunction: itemService.addCategory,
                addFunctionParams: null,
                fields: [
                    { id: "name", label: "Name", type: "text", placeholder: "", required: true },
                    { id: "ferous", label: "Ferous", type: "boolean", required: false }
                ],
                newRecord: {},
                hasSubmitted: false
            },
            emits: {
                onError: (error) => {
                    toast.add({ severity: "error", summary: "Add Category Failed", detail: error, life: 3000 });
                }
            },
            onClose: (options) => {
                if (options.data && options.data.success) {
                    toast.add({ severity: "success", summary: "Add Category Successful", detail: `${options.data.record.name} has been added successfully.`, life: 3000 });
                    loadCategories();
                }
            }
        });
    }

    function editCategory(event) {
        const { newData } = event;

        if (newData.name) {
            itemService.editCategory(newData.id, newData).then((editRes) => {
                if (editRes.success) {
                    loadCategories();
                    toast.add({ severity: "success", summary: "Edit Category Successful", detail: `${newData.name} has been edited successfully.`, life: 3000 });
                } else {
                    toast.add({ severity: "error", summary: "Edit Category Failed", detail: editRes.error, life: 3000 });
                }
            });
        } else {
            toast.add({ severity: "error", summary: "Edit Category Failed", detail: "Name is required.", life: 3000 });
        }
    }

    function deleteCategories() {
        itemService.deleteCategories(selection.value.map(category => category.id)).then((delRes) => {
            if (delRes.success) {
                loadCategories();
                toast.add({ severity: "success", summary: `Delete ${selection.value.length > 1 ? "Categories" : "Category"} Successful`, detail: `${selection.value.map(category => category.name).join(", ")} ${selection.value.length > 1 ? "have" : "has"} been deleted successfully.`, life: 3000 });
                selection.value = null;
            } else {
                toast.add({ severity: "error", summary: `Delete ${selection.value.length > 1 ? "Categories" : "Category"} Failed`, detail: delRes.error, life: 3000 });
            }
        });
    }

    function confirmDelete() {
        confirm.require({
            message: `Are you sure you want to delete ${selection.value.map(category => category.name).join(", ")}?`,
            header: `Delete ${selection.value.length > 1 ? "Categories" : "Category"}`,
            icon: "pi pi-trash",
            rejectLabel: "No",
            acceptLabel: "Yes",
            accept: deleteCategories,
            severity: "danger"
        });
    }
</script>

<template>
    <Toolbar>
        <template #start>
            <Button label="Add" icon="pi pi-plus" severity="success" class="mr-2" @click="openAddDialog"></Button>
            <Button label="Delete" icon="pi pi-trash" severity="danger" :disabled="!selection || !selection.length" @click="confirmDelete"></Button>
        </template>
    </Toolbar>    
    <Table ref="categories_table" v-model:selection="selection" v-model:editingRows="editingRows" title="Categories" :loading="isLoading" :value="categories" dataKey="id" :globalFilterFields="['name']" :saveEdit="editCategory">
        <Column field="name" header="Name" style="width: 40%" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{data, field}">
                <span v-html="highlightMatch(data[field], categories_table.filters.global)"></span>
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" :invalid="!data[field]" autofocus></InputText>
            </template>
        </Column>
        <Column field="ferous" header="Ferous" style="width: 40%" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{ data, field }">
                <i :class="data[field] ? 'pi pi-check' : 'pi pi-times'"></i>
            </template>
            <template #editor="{ data, field }">
                <ToggleButton v-model="data[field]" onLabel="Yes" offLabel="No" onIcon="pi pi-check" offIcon="pi pi-times"></ToggleButton>
            </template>
        </Column>
    </Table>
</template>