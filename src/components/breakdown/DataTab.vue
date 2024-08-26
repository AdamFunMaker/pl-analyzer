<script setup>
    import { inject, ref } from "vue";
    import { usePrimeVue } from "primevue/config";
    import { FilterMatchMode } from "@primevue/core/api";
    import { highlightMatch } from "@/utils/text.js";
    import { exportTableXLSX } from "@/utils/exports.js";
    import Button from "primevue/button";
    import DataTable from "primevue/datatable";
    import IconField from "primevue/iconfield";
    import InputIcon from "primevue/inputicon";
    import InputText from "primevue/inputtext";

    const primevue = usePrimeVue();
    const interval = inject("interval");
    const range = inject("range");
    const table = ref();
    const value = inject("overviewBreakdownData");
    const selection = ref([]);
    const filters = ref({
        "global": {value: null, matchMode: FilterMatchMode.CONTAINS}
    });
    const loading = inject("isOverviewBreakdownLoading");
</script>

<template>
    <DataTable ref="table" v-model:selection="selection" :loading :value :dataKey="data => `${data.year}${interval === 'Monthly' ? primevue.config.locale.monthNamesShort[data.month - 1] : ''}${data.category}`" :filters :globalFilterFields="['year', data => primevue.config.locale.monthNamesShort[data.month - 1], 'category', data => `${data.buy_weight.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, data => data.buy_price.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.buy_average_price.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => `${data.sell_weight.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, data => data.sell_price.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), data => data.sell_average_price.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'})]" rowHover paginator :alwaysShowPaginator="false" :rows="10" paginatorTemplate="FirstPageLink PrevPageLink JumpToPageInput CurrentPageReport NextPageLink LastPageLink" currentPageReportTemplate="of {totalPages}" removableSort reorderableColumns scrollable scrollHeight="flex" stateKey="tableBreakdownState">
        <template #header>
            <section class="flex items-center justify-between">
                <h4>Categorical Breakdown</h4>
                <article class="flex items-center gap-2">
                    <Button label="Export" icon="pi pi-file-export" :disabled="!value.length" @click="() => exportTableXLSX(table.$el.children[1].children[0], `Overview Categorical Breakdown (${range[0] ? range[0].toLocaleString('en-MY', interval === 'Monthly' ? {year: 'numeric', month: 'short'} : {year: 'numeric'}) : ''} ${range[1] ? '- ' + range[1].toLocaleString('en-MY', interval === 'Monthly' ? {year: 'numeric', month: 'short'} : {year: 'numeric'}) : ''}).xlsx`)"></Button>
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
                <Column header="Category" field="category" :rowspan="2" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column header="Buy" :colspan="3"></Column>
                <Column header="Sell" :colspan="3"></Column>
            </Row>                    
            <Row>
                <Column header="Weight" field="buy_weight" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column header="Buying Price" field="buy_price" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column header="Average Price" field="buy_average_price" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column header="Weight" field="sell_weight" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column header="Selling Price" field="sell_price" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
                <Column header="Average Price" field="sell_average_price" sortable>
                    <template #sorticon="{sorted, sortOrder}">
                        <i :class="['p-sortable-column-icon', 'pi', sorted ? (sortOrder == 1 ? 'pi-sort-up-fill' : 'pi-sort-down-fill') : 'pi-sort']"></i>
                    </template>
                </Column>
            </Row>
        </ColumnGroup>
        <template #empty><span class="inline-block w-full text-center">No record(s) found</span></template>
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
        <Column header="Category" field="category" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(data[field], filters.global)"></span>
            </template>
        </Column>
        <Column header="Weight" field="buy_weight" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(`${data[field].toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, filters.global)"></span>
            </template>
        </Column>
        <Column header="Buying Price" field="buy_price" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(data[field].toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), filters.global)"></span>
            </template>
        </Column>
        <Column header="Average Price" field="buy_average_price" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(data[field].toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), filters.global)"></span>
            </template>
        </Column>
        <Column header="Weight" field="sell_weight" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(`${data[field].toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 5})} kg`, filters.global)"></span>
            </template>
        </Column>
        <Column header="Selling Price" field="sell_price" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(data[field].toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), filters.global)"></span>
            </template>
        </Column>
        <Column header="Average Price" field="sell_average_price" sortable>
            <template #body="{ data, field }">
                <span v-html="highlightMatch(data[field].toLocaleString('en-MY', {style: 'currency', currency: 'MYR'}), filters.global)"></span>
            </template>
        </Column>
    </DataTable>
</template>