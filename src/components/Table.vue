<script setup>    
    import { ref } from "vue";
    import { FilterMatchMode } from "@primevue/core/api";
    import { exportXLSX, exportTableXLSX } from "@/utils/exports.js";
    import Column from "primevue/column";
    import DataTable from "primevue/datatable";
    import IconField from "primevue/iconfield";
    import InputIcon from "primevue/inputicon";
    import InputText from "primevue/inputtext";

    const props = defineProps({
        loading: {
            type: Boolean,
            default: true
        },        
        value: {
            type: Array,
            required: true
        },
        dataKey: {
            type: [String, Function],
            default: "id"
        },
        globalFilterFields: {
            type: Array,
            default: null
        },
        filters: {
            type: Object,
            default: () => {
                return {"global": {value: null, matchMode: FilterMatchMode.CONTAINS}}
            }
        },
        saveEdit: {
            type: Function
        },
        exportFilename: {
            type: String
        },
        exportFunction: {
            type: Function
        },
        title: {
            type: String,
            default: "Table"
        }
    });
    const selection = defineModel("selection", {type: Array});
    const editingRows = defineModel("editingRows", {type: Array});
    const table = ref();
    const filters = ref({
        "global": {value: null, matchMode: FilterMatchMode.CONTAINS},
    });

    defineExpose({
        exportCSV: () => table.value.exportCSV(),
        exportXLSX: () => exportXLSX(table, `${props.exportFilename}.xlsx`)
    });
</script>

<template>
    <DataTable ref="table" v-model:selection="selection" v-model:editingRows="editingRows" :loading :value :dataKey :globalFilterFields :filters @row-edit-save="saveEdit" :exportFilename :exportFunction rowHover paginator :alwaysShowPaginator="false" :rows="10" paginatorTemplate="FirstPageLink PrevPageLink JumpToPageInput CurrentPageReport NextPageLink LastPageLink" currentPageReportTemplate="of {totalPages}" removableSort scrollable scrollHeight="flex" editMode="row">
        <template #header>
            <section class="flex flex-wrap items-center justify-between">
                <h4> {{ title }} </h4>
                <IconField>
                    <InputIcon class="pi pi-search"></InputIcon>
                    <InputText v-model="filters.global.value" placeholder="Search" fluid></InputText>
                </IconField>
            </section>
        </template>
        <template #empty><span class="block w-full text-center">No record(s) found</span></template>
        <Column selectionMode="multiple" style="width: var(--p-checkbox-width)" :exportable="false"></Column>
        <slot></slot>
        <Column rowEditor class="w-fit" :exportable="false"></Column>
    </DataTable>
</template>