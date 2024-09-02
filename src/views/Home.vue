<script setup>
    import { ref, computed, provide, onMounted } from "vue";
    import { usePrimeVue } from "primevue/config";
    import { useToast } from "primevue/usetoast";
    import { FilterMatchMode } from "@primevue/core/api";
    import { AnalysisService } from "@/service/AnalysisService.js";
    import { highlightMatch } from "@/utils/text.js";
    import { exportTableXLSX } from "@/utils/exports.js";
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
    const columns = ref([
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
    ]);
    const columns_toggler = ref();
    const overview_table = ref();
    const data = ref([]);
    const selection = ref([]);
    const filters = ref({
        "global": {value: null, matchMode: FilterMatchMode.CONTAINS}
    });
    const isLoading = ref(true);
    const buyTotalWeight = computed(() => overview_table.value?.processedData.length ? overview_table.value.processedData.map(record => record.buy_weight).reduce((total, val) => total + val) : null);
    const buyTotalPrice = computed(() => overview_table.value?.processedData.length ? overview_table.value.processedData.map(record => record.buy_price).reduce((total, val) => total + val) : null);
    const buyTotalAveragePrice = computed(() => ((buyTotalPrice.value / buyTotalWeight.value) || 0).toLocaleString("en-MY", {style: "currency", currency: "MYR"}));
    const sellTotalWeight = computed(() => overview_table.value?.processedData.length ? overview_table.value.processedData.map(record => record.sell_weight).reduce((total, val) => total + val) : null);
    const sellTotalPrice = computed(() => overview_table.value?.processedData.length ? overview_table.value.processedData.map(record => record.sell_price).reduce((total, val) => total + val) : null);
    const sellTotalAveragePrice = computed(() => ((sellTotalPrice.value / sellTotalWeight.value) || 0).toLocaleString("en-MY", {style: "currency", currency: "MYR"}));
    const totalSalary = computed(() => overview_table.value?.processedData.length ? overview_table.value.processedData.map(record => record.salary).reduce((total, val) => total + val) : null);
    const totalExpenses = computed(() => overview_table.value?.processedData.length ? overview_table.value.processedData.map(record => record.expenses).reduce((total, val) => total + val) : null);
    const totalPettyCash = computed(() => overview_table.value?.processedData.length ? overview_table.value.processedData.map(record => record.petty_cash).reduce((total, val) => total + val) : null);
    const totalPL = computed(() => overview_table.value?.processedData.length ? overview_table.value.processedData.map(record => record.profit_loss).reduce((total, val) => total + val) : null);
    const overviewBreakdownData = ref([]);
    const isOverviewBreakdownLoading = ref(true);

    provide("interval", interval);
    provide("range", range);
    provide("overviewBreakdownData", overviewBreakdownData)

    function loadOverview() {
        isLoading.value = true;
        isOverviewBreakdownLoading.value = true;
        data.value = [];
        overviewBreakdownData.value = [];
        analysis.getOverview(interval.value, range.value).then(res => {
            if (res.success) {
                data.value = res.data;
            } else {
                toast.add({ severity: "error", summary: "Error Loading Overview", detail: res.error, life: 3000 });
            }

            isLoading.value = false;
        });
        analysis.getOverviewBreakdown(interval.value, range.value).then(res => {
            if (res.success) {
                overviewBreakdownData.value = res.data;
            } else {
                toast.add({ severity: "error", summary: "Error Loading Overview Breakdown", detail: res.error, life: 3000 });
            }

            isOverviewBreakdownLoading.value = false;
        })
    }

    function loadRange() {
        analysis.getOverviewRange().then((res) => {
            if (res.success) {
                period.value = [res.data.min_date, res.data.max_date];
                range.value = res.data.min_date && res.data.max_date ? [new Date(new Date(res.data.max_date).setMonth(0)) < res.data.min_date ? res.data.min_date : new Date(new Date(res.data.max_date).setMonth(0)), res.data.max_date] : [null, null];
                loadOverview();
            } else {
                toast.add({ severity: "error", summary: "Error Loading Overview", detail: res.error, life: 3000 });
                isLoading.value = false;
                isOverviewBreakdownLoading.value = false;
            }
        });
    }

    onMounted(() => {
        emit("update-breadcrumbs", [{label: "Overview", to: "/"}]);
        loadRange();
    });

    function toggleColumnsToggler(event) {
        columns_toggler.value.toggle(event);
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
    <DataTable ref="overview_table" v-model:selection="selection" :loading="isLoading" :value="data" :dataKey="data => `${data.year}${interval === 'Monthly' ? primevue.config.locale.monthNamesShort[data.month - 1] : ''}`" :globalFilterFields="['year', (data) => primevue.config.locale.monthNamesShort[data.month - 1], data => `${data.buy_weight.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, data => data.buy_price.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.buy_average_price.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => `${data.sell_weight.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, data => data.sell_price.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.sell_average_price.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.salary.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.expenses.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.petty_cash.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.profit_loss.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})]" :filters rowHover removableSort reorderableColumns scrollable scrollHeight="flex" stateKey="tableOverviewState">
        <template #header>
            <section class="flex items-center justify-between">
                <h4>Overview</h4>
                <article class="flex items-center gap-2">
                    <Button label="Export" icon="pi pi-file-export" size="small" :disabled="!data.length" @click="() => exportTableXLSX(overview_table.$el.children[1].children[0], `Overview (${range[0] ? range[0].toLocaleString('en-MY', interval === 'Monthly' ? {year: 'numeric', month: 'short'} : {year: 'numeric'}) : ''} ${range[1] ? '- ' + range[1].toLocaleString('en-MY', interval === 'Monthly' ? {year: 'numeric', month: 'short'} : {year: 'numeric'}) : ''}).xlsx`)"></Button>
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
            <template #body="{ data, field }">
                <span v-html="highlightMatch(data[field], filters.global)"></span>
            </template>
        </Column>
        <Column v-if="interval === 'Monthly'" header="Month" field="month" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(primevue.config.locale.monthNamesShort[data[field] - 1], filters.global)"></span>
            </template>
        </Column>
        <Column v-for="column of [...columns[0].items, ...columns[1].items, ...columns[2].items, ...columns[3].items, ...columns[4].items, ...columns[5].items].filter(column => column.shown)" :field="column.field" sortable>
            <template v-if="column.header.match(/weight/gi)" #body="{ data, field }">
                <span v-html="highlightMatch(`${data[field].toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, filters.global)"></span>
            </template>
            <template v-else-if="column.header.match(/price/gi) || column.header === 'Salary' || column.header === 'Expenses' || column.header === 'Petty Cash' || column.header === 'P&L'" #body="{ data, field }">
                <span v-html="highlightMatch(data[field].toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), filters.global)" :class="column.header !== 'P&L' ? null : data[field] < 0 ? 'text-red-500' : data[field] > 0 ? 'text-green-500' : null"></span>
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
                <DataTab :loading="isOverviewBreakdownLoading"></DataTab>
            </TabPanel>
            <TabPanel value="charts">
                <ChartsTab :loading="isOverviewBreakdownLoading"></ChartsTab>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>