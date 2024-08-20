<script setup>
    import { ref, computed, onMounted, onBeforeMount } from "vue";
    import { usePrimeVue } from "primevue/config";
    import { useToast } from "primevue/usetoast";
    import { FilterMatchMode } from "@primevue/core/api";
    import { AnalysisService } from "@/service/AnalysisService.js";
    import { exportXLSX } from "@/utils/exports.js";
    import Button from "primevue/button";
    import Column from "primevue/column";
    import ColumnGroup from "primevue/columngroup";
    import DataTable from "primevue/datatable";
    import DatePicker from "primevue/datepicker";
    import Divider from "primevue/divider";
    import IconField from "primevue/iconfield";
    import InputIcon from "primevue/inputicon";
    import InputText from "primevue/inputtext";
    import Row from "primevue/row";
    import SelectButton from "primevue/selectbutton";
    import Tab from "primevue/tab";
    import Tabs from "primevue/tabs";
    import TabList from "primevue/tablist";
    import TabPanel from "primevue/tabpanel";
    import TabPanels from "primevue/tabpanels";
    import Toolbar from "primevue/toolbar";
    import ChartsTab from "@/components/breakdown/ChartsTab.vue";
    import ColumnsToggler from "@/components/ColumnsToggler.vue";
    import DataTab from "@/components/breakdown/DataTab.vue";

    const analysis = new AnalysisService();
    const emit = defineEmits(["update-breadcrumbs"]);
    const primevue = usePrimeVue();
    const toast = useToast();
    const intervals = ref(["Monthly", "Yearly"]);
    const interval = ref("Monthly");
    const period = ref([new Date(), new Date()]);
    const range = ref([null, null]);
    const columns = ref([]);
    const columns_toggler = ref();
    const table = ref();
    const data = ref([]);
    const filteredData = ref([]);
    const selection = ref([]);
    const filters = ref({
        "global": {value: null, matchMode: FilterMatchMode.CONTAINS}
    });
    const isLoading = ref(true);
    const buyTotalWeight = computed(() => filteredData.value.length ? filteredData.value.map(record => record.buy_weight).reduce((total, val) => total + val) : null);
    const buyTotalPrice = computed(() => filteredData.value.length ? filteredData.value.map(record => record.buy_price).reduce((total, val) => total + val) : null);
    const buyTotalAveragePrice = computed(() => ((buyTotalPrice.value / buyTotalWeight.value) || 0).toLocaleString("en-MY", {style: "currency", currency: "MYR"}));
    const sellTotalWeight = computed(() => filteredData.value.length ? filteredData.value.map(record => record.sell_weight).reduce((total, val) => total + val) : null);
    const sellTotalPrice = computed(() => filteredData.value.length ? filteredData.value.map(record => record.sell_price).reduce((total, val) => total + val) : null);
    const sellTotalAveragePrice = computed(() => ((sellTotalPrice.value / sellTotalWeight.value) || 0).toLocaleString("en-MY", {style: "currency", currency: "MYR"}));
    const totalSalary = computed(() => filteredData.value.length ? filteredData.value.map(record => record.salary).reduce((total, val) => total + val) : null);
    const totalExpenses = computed(() => filteredData.value.length ? filteredData.value.map(record => record.expenses).reduce((total, val) => total + val) : null);
    const totalPettyCash = computed(() => filteredData.value.length ? filteredData.value.map(record => record.petty_cash).reduce((total, val) => total + val) : null);
    const totalPL = computed(() => filteredData.value.length ? filteredData.value.map(record => record.profit_loss).reduce((total, val) => total + val) : null);
    const breakdownData = ref([]);
    const isBreakdownLoading = ref(true);

    onBeforeMount(() => {
        columns.value = [            
            {
                label: "Buy",
                items: [
                    {shown: true, field: "buy_weight", header: "Weight"},
                    {shown: true, field: "buy_price", header: "Buying Price"},
                    {shown: true, field: "buy_average_price", header: "Average Price"}
                ]
            },
            {
                label: "Sell",
                items:  [
                    {shown: true, field: "sell_weight", header: "Weight"},
                    {shown: true, field: "sell_price", header: "Selling Price"},
                    {shown: true, field: "sell_average_price", header: "Average Price"}
                ]
            },
            {
                label: "Salary",
                items: [
                    {shown: true, field: "salary", header: "Salary"}
                ]
            },
            {
                label: "Expenses",
                items: [
                    {shown: true, field: "expenses", header: "Expenses"}
                ]                
            },
            {
                label: "Petty Cash",
                items: [
                    {shown: true, field: "petty_cash", header: "Petty Cash"}
                ]
            },
            {
                label: "P&L",
                items: [
                    {shown: true, field: "profit_loss", header: "P&L"}
                ]
            }
        ];
    });

    function loadOverview() {
        isLoading.value = true;
        isBreakdownLoading.value = true;
        analysis.getOverview(interval.value, range.value).then(res => {
            if (res.success) {
                data.value = res.data;
                filteredData.value = data.value;
            } else {
                toast.add({ severity: "error", summary: "Error Loading Overview", detail: res.error, life: 3000 });
            }

            isLoading.value = false;
        });
        analysis.getOverviewCategories(interval.value, range.value).then(res => {
            if (res.success) {
                breakdownData.value = res.data;
            } else {
                toast.add({ severity: "error", summary: "Error Loading Overview Breakdown", detail: res.error, life: 3000 });
            }

            isBreakdownLoading.value = false;
        })
    }

    function loadRange() {
        analysis.getOverviewRange().then((res) => {
            if (res.success) {
                period.value = [res.data.min_date, res.data.max_date];
                range.value = [new Date(res.data.max_date).setMonth(0) < res.data.min_date ? res.data.min_date : new Date(new Date(res.data.max_date).setMonth(0)), res.data.max_date];
                loadOverview();
            } else {
                toast.add({ severity: "error", summary: "Error Loading Overview", detail: res.error, life: 3000 });
            }
        });
    }

    onMounted(() => {
        emit("update-breadcrumbs", [{label: "Dashboard"}]);
        loadRange();
    });

    function updateFilteredData(event) {
        filteredData.value = event.filteredValue;
    }

    function toggleColumnsToggler(event) {
        columns_toggler.value.toggle(event);
    }

    function exportOverview() {
        exportXLSX(table.value.$el.children[1].children[0], `Overview (${range.value[0] ? range.value[0].toLocaleString("en-MY", interval === "Monthly" ? {year: "numeric", month: "short"} : {year: "numeric"}) : ""} ${range.value[1] ? "- " + range.value[1].toLocaleString("en-MY", interval === "Monthly" ? {year: "numeric", month: "short"} : {year: "numeric"}) : ""}).xlsx`);
    }
</script>

<template>
    <Toolbar>
        <template #start>
            <article class="flex items-center gap-2">
                <SelectButton v-model="interval" :options="intervals" :allowEmpty="false" @update:modelValue="loadOverview"></SelectButton>
                <DatePicker v-model="range" :dateFormat="`${interval === 'Monthly' ? 'M ' : ''}yy`" :view="`${interval === 'Monthly' ? 'month' : 'year'}`" :minDate="period[0]" :maxDate="period[1]" selectionMode="range" showIcon @update:modelValue="loadOverview"></DatePicker>
            </article>
        </template>
        <template #end>
            <Button label="Columns" icon="pi pi-sliders-v" text :badge="String([...columns[0].items, ...columns[1].items, ...columns[2].items, ...columns[3].items, ...columns[4].items, ...columns[5].items].filter(column => column.shown).length)" badgeSeverity="contrast" @click="toggleColumnsToggler"></Button>
            <ColumnsToggler ref="columns_toggler" :columns></ColumnsToggler>
        </template>        
    </Toolbar>
    <DataTable ref="table" v-model:selection="selection" :loading="isLoading" :value="data" :dataKey="(data) => `${data.year} ${primevue.config.locale.monthNamesShort[data.month - 1]}`" :globalFilterFields="['year', (data) => primevue.config.locale.monthNamesShort[data.month - 1], 'buy_weight', 'buy_price', 'buy_average_price', 'sell_weight', 'sell_price', 'sell_average_price', 'salary', 'expenses', 'petty_cash', 'profit_loss']" :filters rowHover removableSort reorderableColumns scrollable scrollHeight="flex" stateKey="tableOverviewState" @filter="updateFilteredData">
        <template #header>
            <section class="flex items-center justify-between">
                <h4>Overview</h4>
                <article class="flex items-center gap-2">
                    <Button label="Export" icon="pi pi-file-export" :disabled="!data.length" @click="exportOverview"></Button>
                    <IconField>
                        <InputIcon class="pi pi-search"></InputIcon>
                        <InputText v-model="filters.global.value" placeholder="Search" fluid></InputText>
                    </IconField>
                </article>
            </section>
        </template>
        <ColumnGroup type="header">
            <Row>
                <Column header="Year" field="year" :rowspan="2" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column v-if="interval === 'Monthly'" header="Month" field="month" :rowspan="2" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column v-if="columns[0].items.filter(column => column.shown).length" :header="columns[0].label" :colspan="columns[0].items.filter(column => column.shown).length"></Column>
                <Column v-if="columns[1].items.filter(column => column.shown).length" :header="columns[1].label" :colspan="columns[1].items.filter(column => column.shown).length"></Column>
                <Column v-for="column of [...columns[2].items, ...columns[3].items, ...columns[4].items, ...columns[5].items].filter(column => column.shown)" :header="column.header" :field="column.field" :rowspan="2" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
            </Row>
            <Row>
                <Column v-for="column of [...columns[0].items, ...columns[1].items].filter(column => column.shown)" :header="column.header" :field="column.field" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
            </Row>
        </ColumnGroup>
        <template #empty><span class="block w-full text-center">No record(s) found</span></template>
        <Column header="Year" field="year" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
        </Column>
        <Column v-if="interval === 'Monthly'" header="Month" field="month" sortable>
            <template #sorticon="{sorted, sortOrder}">
                <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
            </template>
            <template #body="{ data, field }">
                {{ primevue.config.locale.monthNamesShort[data[field] - 1] }}
            </template>
        </Column>
        <Column v-for="column of [...columns[0].items, ...columns[1].items, ...columns[2].items, ...columns[3].items, ...columns[4].items, ...columns[5].items].filter(column => column.shown)" :field="column.field" sortable>
            <template v-if="column.header.match(/weight/gi)" #body="{ data, field }">
                {{ `${data[field].toLocaleString("en-MY", {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg` }}
            </template>
            <template v-else-if="column.header.match(/price/gi) || column.header === 'Salary' || column.header === 'Expenses' || column.header === 'Petty Cash' || column.header === 'P&L'" #body="{ data, field }">
                {{ column.header === 'P&L' ? undefined : data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
                <span v-if="column.header === 'P&L'" :class="data[field] < 0 ? 'text-red-500' : data[field] > 0 ? 'text-green-500' : null">{{ data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}</span>
            </template>
        </Column>
        <ColumnGroup v-if="!(buyTotalWeight === null || buyTotalPrice === null || sellTotalWeight === null || sellTotalPrice === null || totalSalary === null || totalExpenses === null || totalPettyCash === null || totalPL === null) && [...columns[2].items, ...columns[3].items, ...columns[4].items, ...columns[5].items].filter(column => column.shown).length" type="footer">
            <Row>
                <Column footer="Total:" :colspan="interval === 'Monthly' ? 2 : 1" footerClass="text-right"></Column>
                <Column v-if="columns[0].items.filter(column => column.field === 'buy_weight' && column.shown === true).length" :footer="`${buyTotalWeight.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`"></Column>
                <Column v-if="columns[0].items.filter(column => column.field === 'buy_price' && column.shown === true).length" :footer="buyTotalPrice.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></Column>
                <Column v-if="columns[0].items.filter(column => column.field === 'buy_average_price' && column.shown === true).length" :footer="buyTotalAveragePrice"></Column>
                <Column v-if="columns[1].items.filter(column => column.field === 'sell_weight' && column.shown === true).length" :footer="`${sellTotalWeight.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`"></Column>
                <Column v-if="columns[1].items.filter(column => column.field === 'sell_price' && column.shown === true).length" :footer="sellTotalPrice.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></Column>
                <Column v-if="columns[1].items.filter(column => column.field === 'sell_average_price' && column.shown === true).length" :footer="sellTotalAveragePrice"></Column>
                <Column v-if="columns[2].items.filter(column => column.field === 'salary' && column.shown === true).length" :footer="totalSalary.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></Column>
                <Column v-if="columns[3].items.filter(column => column.field === 'expenses' && column.shown === true).length" :footer="totalExpenses.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></Column>
                <Column v-if="columns[4].items.filter(column => column.field === 'petty_cash' && column.shown === true).length" :footer="totalPettyCash.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></Column>
                <Column v-if="columns[5].items.filter(column => column.field === 'profit_loss' && column.shown === true).length" :footer="totalPL.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})" :class="totalPL < 0 ? 'text-red-500' : totalPL > 0 ? 'text-green-500' : null"></Column>
            </Row>
        </ColumnGroup>
    </DataTable>
    <Divider></Divider>
    <h4>Breakdown</h4>
    <Tabs value="data" lazy>
        <TabList>
            <Tab value="data">Data</Tab>
            <Tab value="charts">Charts</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="data">
                <DataTab :loading="isBreakdownLoading" :value="breakdownData" :interval></DataTab>
            </TabPanel>
            <TabPanel value="charts">
                <ChartsTab></ChartsTab>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>