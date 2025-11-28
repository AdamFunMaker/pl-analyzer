<script setup>
    import { ref, onMounted, computed } from "vue";
    import { useToast } from "primevue/usetoast";
    import { FilterMatchMode } from "@primevue/core/api";
    import { AnalysisService } from "@/service/AnalysisService.js";
    import { exportTableXLSX } from "@/utils/exports.js";
    import { toTitleCase, highlightMatch } from "@/utils/text.js";
    import Button from "primevue/button";
    import Column from "primevue/column";
    import ColumnGroup from "primevue/columngroup";
    import DataTable from "primevue/datatable";
    import DatePicker from "primevue/datepicker";
    import IconField from "primevue/iconfield";
    import InputIcon from "primevue/inputicon";
    import InputText from "primevue/inputtext";
    import Row from "primevue/row";
    import Toolbar from "primevue/toolbar";
    import ColumnsToggler from "../ColumnsToggler.vue";

    const props = defineProps({
        transaction: {
            type: String,
            required: true
        }
    });

    const toast = useToast();
    const analysis = new AnalysisService();
    const period = ref([new Date(), new Date()]);
    const range1 = ref([new Date(), new Date()]);
    const range2 = ref([new Date(), new Date()]);
    const columns = ref([
        {
            label: "Range 1",
            items: props.transaction === "purchases" ? [
                {shown: true, field: "weight1", header: "Weight"},
                {shown: true, field: "price1", header: "Buying Price"},
                {shown: true, field: "average_price1", header: "Average Price"}
            ] : [
                {shown: true, field: "weight1", header: "Weight"},
                {shown: true, field: "price1", header: "Selling Price"},
                {shown: true, field: "average_price1", header: "Average Price"}
            ]
        },
        {
            label: "Range 2",
            items: props.transaction === "purchases" ? [
                {shown: true, field: "weight2", header: "Weight"},
                {shown: true, field: "price2", header: "Buying Price"},
                {shown: true, field: "average_price2", header: "Average Price"}
            ] : [
                {shown: true, field: "weight2", header: "Weight"},
                {shown: true, field: "price2", header: "Selling Price"},
                {shown: true, field: "average_price2", header: "Average Price"}
            ]
        }
    ]);
    const columns_toggler = ref();
    const comparison_table = ref();
    const data = ref([]);
    const selection = ref([]);
    const filters = ref({
        "global": {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const loading = ref(true);
    const range1String = computed(() => `${range1.value[0] ? range1.value[0].toLocaleString("en-MY", {year: "numeric", month: "short"}) : ""} ${range1.value[1] ? "- " + range1.value[1].toLocaleString("en-MY", {year: "numeric", month: "short"}) : ""}`);
    const range2String = computed(() => `${range2.value[0] ? range2.value[0].toLocaleString("en-MY", {year: "numeric", month: "short"}) : ""} ${range2.value[1] ? "- " + range2.value[1].toLocaleString("en-MY", {year: "numeric", month: "short"}) : ""}`);
    const range1TotalWeight = computed(() => comparison_table.value?.processedData.length ? comparison_table.value.processedData.map(record => record.weight1).reduce((total, val) => total + val) : null);
    const range1TotalPrice = computed(() => comparison_table.value?.processedData.length ? comparison_table.value.processedData.map(record => record.price1).reduce((total, val) => total + val) : null);
    const range1TotalAveragePrice = computed(() => ((range1TotalPrice.value / range1TotalWeight.value) || 0).toLocaleString("en-MY", {style: "currency", currency: "MYR"}));
    const range2TotalWeight = computed(() => comparison_table.value?.processedData.length ? comparison_table.value.processedData.map(record => record.weight2).reduce((total, val) => total + val) : null);
    const range2TotalPrice = computed(() => comparison_table.value?.processedData.length ? comparison_table.value.processedData.map(record => record.price2).reduce((total, val) => total + val) : null);
    const range2TotalAveragePrice = computed(() => ((range2TotalPrice.value / range2TotalWeight.value) || 0).toLocaleString("en-MY", {style: "currency", currency: "MYR"}));

    function loadComparison() {
        loading.value = true;
        analysis.getPeriodComparison(props.transaction, range1.value, range2.value).then((res) => {
            if (res.success) {
                data.value = res.data;
            } else {
                toast.add({ severity: "error", summary: `Error Loading ${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Analysis Period Comparison`, detail: res.error, life: 3000 });
            }

            loading.value = false;
        });
    }

    function loadRange() {
        analysis.getComparisonRange(props.transaction).then((res) => {
            if (res.success) {
                period.value = [res.data.min_date, res.data.max_date];
                range1.value = res.data.min_date && res.data.max_date ? [new Date(res.data.max_date).setMonth(0) < res.data.min_date ? res.data.min_date : new Date(new Date(res.data.max_date).setMonth(0)), res.data.max_date] : [null, null];
                range2.value = res.data.min_date && res.data.max_date ? [new Date(res.data.max_date).setMonth(0) < res.data.min_date ? res.data.min_date : new Date(new Date(res.data.max_date).setMonth(0)), res.data.max_date] : [null, null];
                loadComparison();
            } else {
                toast.add({ severity: "error", summary: `Error Loading ${props.transaction.replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())} Analysis Comparison Range`, detail: res.error, life: 3000 });
                loading.value = false;
            }
        });
    }

    onMounted(() => {
        loadRange();
    });

    function toggleColumnsToggler(event) {
        columns_toggler.value.toggle(event);
    }
</script>

<template>
    <Toolbar class=my-3>
        <template #start>
            <article class="flex items-center gap-2">
                Period 1:
                <DatePicker v-model="range1" dateFormat="M yy" view="month" :minDate="period[0]" :maxDate="period[1]" selectionMode="range" showIcon hideOnRangeSelection :manualInput="false" @update:modelValue="loadComparison"></DatePicker>
            </article>
        </template>
        <template #center>
            <Button label="Columns" icon="pi pi-sliders-v" text :badge="String([...columns[0].items, ...columns[1].items].filter(column => column.shown).length)" badgeSeverity="contrast" @click="toggleColumnsToggler"></Button>
            <ColumnsToggler ref="columns_toggler" :columns></ColumnsToggler>
        </template>
        <template #end>
            <article class="flex items-center gap-2">
                Period 2:
                <DatePicker v-model="range2" dateFormat="M yy" view="month" :minDate="period[0]" :maxDate="period[1]" selectionMode="range" showIcon hideOnRangeSelection :manualInput="false" @update:modelValue="loadComparison"></DatePicker>
            </article>
        </template>
    </Toolbar>
    <DataTable ref="comparison_table" v-model:selection="selection" :loading :value="data" :filters :globalFilterFields="['category', data => `${data.weight1.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, data => data.price1.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.average_price1.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => `${data.weight2.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, data => data.price2.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.average_price2.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})]" rowHover removableSort scrollable scrollHeight="flex">
        <template #header>
            <section class="flex items-center justify-between">
                <h4>{{ toTitleCase(props.transaction) }} Comparison</h4>
                <article class="flex items-center gap-2">
                    <Button label="Export" icon="pi pi-file-export" size="small" :disabled="!data.length" @click="() => exportTableXLSX(comparison_table.$el.children[1].children[0], `${toTitleCase(props.transaction)} Comparison (${range1String}, ${range2String}).xlsx`)"></Button>
                    <IconField>
                        <InputIcon class="pi pi-search"></InputIcon>
                        <InputText v-model="filters.global.value" placeholder="Search" fluid></InputText>
                    </IconField>
                </article>
            </section>
        </template>
        <ColumnGroup type="header">
            <Row>
                <Column header="Category" field="category" :rowspan="2" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column v-if="columns[0].items.filter(column => column.shown).length" :header="range1String" :colspan="columns[0].items.filter(column => column.shown).length"></Column>
                <Column v-if="columns[1].items.filter(column => column.shown).length" :header="range2String" :colspan="columns[1].items.filter(column => column.shown).length"></Column>
            </Row>
            <Row>
                <Column v-for="column of [...columns[0].items, ...columns[1].items].filter(column => column.shown)" :header="column.header" :field="column.field" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
            </Row>
        </ColumnGroup>
        <template #empty><span class="inline-block w-full text-center">No record(s) found</span></template>
        <Column field="category" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(data[field], filters.global)"></span>
            </template>
        </Column>
        <Column v-for="column of [...columns[0].items, ...columns[1].items].filter(column => column.shown)" :field="column.field">
            <template #body="{ data, field }">
                <span v-html="highlightMatch(field.match(/price/gi) ? data[field].toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}) : `${data[field].toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, filters.global)"></span>
            </template>
        </Column>
        <ColumnGroup type="footer">
            <Row v-if="!(range1TotalWeight === null || range1TotalPrice === null || range2TotalWeight === null || range2TotalPrice === null) && [...columns[0].items, ...columns[1].items].filter(column => column.shown).length">
                <Column footer="Total:" footerClass="text-right"></Column>
                <Column v-if="columns[0].items.filter(column => column.field === 'weight1' && column.shown === true).length" :footer="`${range1TotalWeight.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`"></Column>
                <Column v-if="columns[0].items.filter(column => column.field === 'price1' && column.shown === true).length" :footer="range1TotalPrice.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></Column>
                <Column v-if="columns[0].items.filter(column => column.field === 'average_price1' && column.shown === true).length" :footer="range1TotalAveragePrice"></Column>
                <Column v-if="columns[1].items.filter(column => column.field === 'weight2' && column.shown === true).length" :footer="`${range2TotalWeight.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`"></Column>
                <Column v-if="columns[1].items.filter(column => column.field === 'price2' && column.shown === true).length" :footer="range2TotalPrice.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></Column>
                <Column v-if="columns[1].items.filter(column => column.field === 'average_price2' && column.shown === true).length" :footer="range2TotalAveragePrice"></Column>
            </Row>
        </ColumnGroup>
    </DataTable>
</template>