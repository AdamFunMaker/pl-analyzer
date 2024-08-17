<script setup>
    import { ref, onMounted, onBeforeMount } from "vue";
    import { usePrimeVue } from "primevue/config";
    import { useToast } from "primevue/usetoast";
    import { FilterMatchMode } from "@primevue/core/api";
    import { AnalysisService } from "@/service/AnalysisService.js";
    import { exportXLSX } from "@/utils/exports.js";
    import Accordion from "primevue/accordion";
    import AccordionContent from "primevue/accordioncontent";
    import AccordionHeader from "primevue/accordionheader";
    import AccordionPanel from "primevue/accordionpanel";
    import BlockUI from "primevue/blockui";
    import Button from "primevue/button";
    import Column from "primevue/column";
    import ColumnGroup from "primevue/columngroup";
    import DataTable from "primevue/datatable";
    import DatePicker from "primevue/datepicker";
    import Divider from "primevue/divider";
    import IconField from "primevue/iconfield";
    import InputIcon from "primevue/inputicon";
    import InputText from "primevue/inputtext";
    import ProgressSpinner from "primevue/progressspinner";
    import Row from "primevue/row";
    import Toolbar from "primevue/toolbar";
    import ColumnsToggler from "@/components/analysis/ColumnsToggler.vue";
    import DoughnutChart from "@/components/charts/Doughnut.vue";

    const analysis = new AnalysisService();
    const emit = defineEmits(['update-breadcrumbs']);
    const primevue = usePrimeVue();
    const toast = useToast();
    const period = ref([new Date(), new Date()]);
    const range = ref([null, null]);
    const columns = ref([]);
    const columns_toggler = ref();
    const table = ref();
    const data = ref([]);
    const selection = ref([]);
    const filters = ref({
        "global": {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const accordion = ref();
    const buyWeightChartData = ref({});
    const buyPriceChartData = ref({});
    const sellWeightChartData = ref({});
    const sellPriceChartData = ref({});
    const isLoading = ref(true);
    const isBuyBreakdownChartsLoading = ref(true);
    const isSellBreakdownChartsLoading = ref(true);

    onBeforeMount(() => {
        columns.value = [
            {
                label: "Year",
                items: [
                    {shown: true, field: "year", header: "Year", exportHeader: "Year"}
                ]
            },
            {
                label: "Month",
                items: [
                    {shown: true, field: "month", header: "Month", exportHeader: "Month"}
                ]
            },
            {
                label: "Buy",
                items: [
                    {shown: true, field: "buy_weight", header: "Weight", exportHeader: "Purchases Weight"},
                    {shown: true, field: "buy_price", header: "Buying Price", exportHeader: "Buying Price"},
                    {shown: true, field: "buy_average_price", header: "Average Price", exportHeader: "Average Price"}
                ]
            },
            {
                label: "Sell",
                items:  [
                    {shown: true, field: "sell_weight", header: "Weight", exportHeader: "Sales Weight"},
                    {shown: true, field: "sell_price", header: "Selling Price", exportHeader: "Selling Price"},
                    {shown: true, field: "sell_average_price", header: "Average Price", exportHeader: "Average Price"}
                ]
            },
            {
                label: "Salary",
                items: [
                    {shown: true, field: "salary", header: "Salary", exportHeader: "Salary"}
                ]
            },
            {
                label: "Expenses",
                items: [
                    {shown: true, field: "expenses", header: "Expenses", exportHeader: "Expenses"}
                ]                
            },
            {
                label: "Petty Cash",
                items: [
                    {shown: true, field: "petty_cash", header: "Petty Cash", exportHeader: "Petty Cash"}
                ]
            },
            {
                label: "P&L",
                items: [
                    {shown: true, field: "profit_loss", header: "P&L", exportHeader: "P&L"}
                ]
            }
        ];
    });

    function loadOverview() {
        isLoading.value = true;
        analysis.getOverview(range.value).then((res) => {
            if (res.success) {
                data.value = res.data;
            } else {
                toast.add({ severity: "error", summary: `Error Loading Overview Analysis`, detail: res.error, life: 3000 });
            }

            isLoading.value = false;
        });

        accordion.value.d_value?.forEach((value) => loadCategories(value));
    }

    function loadCategories(transaction) {
        transaction === "purchases" ? isBuyBreakdownChartsLoading.value = true : isSellBreakdownChartsLoading.value = true;
        analysis.getOverviewCategories(transaction, range.value).then((res) => {
            if (res.success) {
                const weightChartData = {
                    labels: res.data.map(record => record.category),
                    datasets: [
                        {
                            data: res.data.map(record => record.weight)
                        }
                    ]
                };
                const priceChartData = {
                    labels: res.data.map(record => record.category),
                    datasets: [
                        {
                            data: res.data.map(record => record.price)
                        }
                    ]
                };
                transaction === "purchases" ? buyWeightChartData.value = weightChartData : sellWeightChartData.value = weightChartData;
                transaction === "purchases" ? buyPriceChartData.value = priceChartData : sellPriceChartData.value = priceChartData;
            } else {
                toast.add({ severity: "error", summary: `Error Loading Overview Analysis Breakdown ${transaction === "purchases" ? "Buy" : "Sell"} Categories`, detail: res.error, life: 3000 });
            }

            transaction === "purchases" ? isBuyBreakdownChartsLoading.value = false : isSellBreakdownChartsLoading.value = false;
        });
    }

    function loadRange() {
        analysis.getOverviewRange().then((res) => {
            if (res.success) {
                period.value = [res.data.min_date, res.data.max_date];
                range.value = period.value;
                loadOverview();
            } else {
                toast.add({ severity: "error", summary: `Error Loading Overview Analysis`, detail: res.error, life: 3000 });
            }
        });
    }

    onMounted(() => {
        emit('update-breadcrumbs', [{label: "Analysis"}, {label: "Overview", to: "/analysis/overview"}]);
        loadRange();
    });

    function toggleColumnsToggler(event) {
        columns_toggler.value.toggle(event);
    }

    function formatExport(record) {
        if (record.field.match(/weight/gi)) {
            return `${record.data.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 5 })} kg`;
        } else if (record.field.match(/price/gi) || record.field === "salary" || record.field === "expenses" || record.field === "petty_cash" || record.field === "profit_loss") {
            return record.data.toLocaleString("en-MY", { style: "currency", currency: "MYR" });
        } else {
            return record.data;
        }
    }

    function exportTable() {
        exportXLSX(table.value.$el.children[1].children[0], `Overview Analysis (${range.value[0] ? range.value[0].toLocaleString("en-MY", {year: "numeric", month: "short"}) : ""} ${range.value[1] ? "- " + range.value[1].toLocaleString("en-MY", {year: "numeric", month: "short"}) : ""}).xlsx`);
    }
</script>

<template>
    <Toolbar class="mb-3">
        <template #start>
            <article class="flex items-center gap-2">
                Period:
                <DatePicker v-model="range" dateFormat="M yy" view="month" :minDate="period[0]" :maxDate="period[1]" selectionMode="range" showIcon :manualInput="false" @update:modelValue="loadOverview"></DatePicker>
            </article>
        </template>
        <template #end>
            <Button label="Columns" icon="pi pi-sliders-v" text :badge="String([...columns[0].items, ...columns[1].items, ...columns[2].items, ...columns[3].items, ...columns[4].items, ...columns[5].items, ...columns[6].items, ...columns[7].items].filter(column => column.shown).length)" badgeSeverity="contrast" @click="toggleColumnsToggler"></Button>
            <ColumnsToggler ref="columns_toggler" :columns></ColumnsToggler>
            <Button label="Export" icon="pi pi-file-export" iconPos="right" :disabled="!data.length" @click="exportTable"></Button>
        </template>
    </Toolbar>
    <DataTable ref="table" v-model:selection="selection" :loading="isLoading" :value="data" :dataKey="(data) => `${data.year} ${primevue.config.locale.monthNamesShort[data.month - 1]}`" :globalFilterFields="['year', (data) => primevue.config.locale.monthNamesShort[data.month - 1], 'buy_weight', 'buy_price', 'buy_average_price', 'sell_weight', 'sell_price', 'sell_average_price', 'salary', 'expenses', 'petty_cash', 'profit_loss']" :filters :exportFilename="'Overview Analysis'" :exportFunction="formatExport" rowHover removableSort scrollable scrollHeight="50vh" stateKey="tableOverviewState">
        <template #header>
            <section class="flex items-center justify-between">
                <h4 class="!m-0">Overview</h4>
                <IconField>
                    <InputIcon class="pi pi-search"></InputIcon>
                    <InputText v-model="filters.global.value" placeholder="Search" fluid></InputText>
                </IconField>
            </section>
        </template>
        <ColumnGroup type="header">
            <Row>
                <Column selectionMode="multiple" :rowspan="2" style="width: fit-content"></Column>
                <Column v-for="column of [...columns[0].items, ...columns[1].items].filter(column => column.shown)" :header="column.header" :field="column.field" :rowspan="2" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column v-if="columns[2].items.filter(column => column.shown).length" :header="columns[2].label" :colspan="columns[2].items.filter(column => column.shown).length"></Column>
                <Column v-if="columns[3].items.filter(column => column.shown).length" :header="columns[3].label" :colspan="columns[3].items.filter(column => column.shown).length"></Column>
                <Column v-for="column of [...columns[4].items, ...columns[5].items, ...columns[6].items, ...columns[7].items].filter(column => column.shown)" :header="column.header" :field="column.field" :rowspan="2" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
            </Row>
            <Row>
                <Column v-for="column of [...columns[2].items, ...columns[3].items].filter(column => column.shown)" :header="column.header" :field="column.field" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
            </Row>
        </ColumnGroup>
        <template #empty><span class="block w-full text-center">No record(s) found</span></template>
        <Column selectionMode="multiple" style="width: fit-content"></Column>
        <Column v-for="column of [...columns[0].items, ...columns[1].items, ...columns[2].items, ...columns[3].items, ...columns[4].items, ...columns[5].items, ...columns[6].items, ...columns[7].items].filter(column => column.shown)" :field="column.field" :exportHeader="column.exportHeader">
            <template v-if="column.header === 'Month'" #body="{ data, field }">
                {{ primevue.config.locale.monthNamesShort[data[field] - 1] }}
            </template>
            <template v-else-if="column.header.match(/weight/gi)" #body="{ data, field }">
                {{ `${data[field].toLocaleString("en-MY", {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg` }}
            </template>
            <template v-else-if="column.header.match(/price/gi) || column.header === 'Salary' || column.header === 'Expenses' || column.header === 'Petty Cash' || column.header === 'P&L'" #body="{ data, field }">
                {{ column.header === 'P&L' ? undefined : data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}
                <span v-if="column.header === 'P&L'" :class="data[field] < 0 ? 'text-red-500' : data[field] > 0 ? 'text-green-500' : null">{{ data[field].toLocaleString("en-MY", {style: "currency", currency: "MYR"}) }}</span>
            </template>
        </Column>
    </DataTable>
    <Divider></Divider>
    <h4 class="!m-0">Breakdown</h4>
    <Accordion ref="accordion" :value="[]" multiple lazy @update:value="(value) => value.forEach((val) => loadCategories(val))">
        <AccordionPanel value="purchases">
            <AccordionHeader>Buy</AccordionHeader>
            <AccordionContent>
                <BlockUI :blocked="isBuyBreakdownChartsLoading" :autoZIndex="false" :pt="{
                    mask: {
                        style: 'backdrop-filter: blur(2px)'
                    }
                }">
                    <ProgressSpinner v-if="isBuyBreakdownChartsLoading" :pt="{
                        root: {
                            style: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2'
                        }
                    }">
                    </ProgressSpinner>
                    <section class="flex flex-wrap grow basis-0">
                        <DoughnutChart title="Buy Weight by Category" :data="buyWeightChartData" :tooltipLabelFunction="(context) => `${context.raw.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`"></DoughnutChart>
                        <DoughnutChart title="Buy Price by Category" :data="buyPriceChartData" :tooltipLabelFunction="(context) => context.raw.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></DoughnutChart>
                    </section>
                </BlockUI>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="sales">
            <AccordionHeader>Sell</AccordionHeader>
            <AccordionContent>
                <BlockUI :blocked="isSellBreakdownChartsLoading" :autoZIndex="false" :pt="{
                    mask: {
                        style: 'backdrop-filter: blur(2px)'
                    }
                }">
                    <ProgressSpinner v-if="isSellBreakdownChartsLoading" :pt="{
                        root: {
                            style: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2'
                        }
                    }">
                    </ProgressSpinner>
                    <section class="flex flex-wrap grow basis-0">
                        <DoughnutChart title="Sell Weight by Category" :data="sellWeightChartData" :tooltipLabelFunction="(context) => `${context.raw.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`"></DoughnutChart>
                        <DoughnutChart title="Sell Price by Category" :data="sellPriceChartData" :tooltipLabelFunction="(context) => context.raw.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})"></DoughnutChart>
                    </section>
                </BlockUI>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>