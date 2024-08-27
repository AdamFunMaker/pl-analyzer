<script setup>
    import { inject, ref, onMounted } from "vue";
    import DatePicker from "primevue/datepicker";
    import InputNumber from "primevue/inputnumber";
    import InputText from "primevue/inputtext";
    import Select from "primevue/select";
    import ToggleButton from "primevue/togglebutton";

    const dialogRef = inject("dialogRef");
    const fields = ref([]);
    const newRecord = dialogRef.value?.data.newRecord;

    onMounted(() => {
        fields.value = dialogRef.value?.data.fields;
        fields.value.map(field => field.type === "boolean" ? dialogRef.value.data.newRecord[field.id] = false : dialogRef.value.data.newRecord[field.id] = null);
    });

    function validateField(field) {
        return dialogRef.value?.data.hasSubmitted && field.required && !dialogRef.value?.data.newRecord[field.id];
    }
</script>

<template>
    <form class="mx-8 flex flex-col gap-4" @submit.prevent="dialogRef.data.hasSubmitted = true">
        <article v-for="field in fields" class="flex flex-col gap-2">
            <label :for="field.id">{{field.label}}<span v-if="field.required" title="required" class="required-indicator" aria-hidden="true">*</span></label>
            <InputText v-if="field.type === 'text'" :id="field.id" v-model.trim="newRecord[field.id]" :placeholder="field.placeholder" :invalid="validateField(field)" fluid autofocus></InputText>
            <InputNumber v-if="field.type === 'number'" :inputId="field.id" v-model="newRecord[field.id]" :min="field.minimum" :max="field.maximum" :step="field.step" :minFractionDigits="field.minFractionDigits" :maxFractionDigits="field.maxFractionDigits" :prefix="field.prefix" :suffix="field.suffix" :placeholder="field.placeholder" :allowEmpty="!field.required" :invalid="validateField(field)" showButtons highlightOnFocus fluid autofocus></InputNumber>
            <InputNumber v-if="field.type === 'currency'" :inputId="field.id" mode="currency" currency="MYR" v-model="newRecord[field.id]" :min="field.minimum" :max="field.maximum" :step="0.01" :minFractionDigits="2" :maxFractionDigits="2" :placeholder="field.placeholder" :allowEmpty="!field.required" :invalid="validateField(field)" showButtons highlightOnFocus fluid autofocus></InputNumber>
            <Select v-if="field.type === 'select'" :id="field.id" v-model="newRecord[field.id]" :loading="!field.options" :options="field.options" :optionLabel="field.optionLabel" :optionValue="field.optionValue" :placeholder="field.placeholder" :invalid="validateField(field)" filter filterPlaceholder="Search" autoOptionFocus checkmark fluid autofocus></Select>
            <DatePicker v-if="field.type === 'date'" :inputId="field.id" v-model="newRecord[field.id]" :minDate="field.minimum" :maxDate="field.maximum" inline showButtonBar :invalid="validateField(field)" fluid autofocus></DatePicker>
            <DatePicker v-if="field.type === 'month'" :inputId="field.id" v-model="newRecord[field.id]" view="month" :minDate="field.minimum" :maxDate="field.maximum" inline showButtonBar :invalid="validateField(field)" fluid autofocus></DatePicker>
            <ToggleButton v-if="field.type === 'boolean'" :id="field.id" v-model="newRecord[field.id]" class="w-fit" onIcon="pi pi-check" offIcon="pi pi-times" onLabel="Yes" offLabel="No" autofocus></ToggleButton>
            <small v-if="validateField(field)" :id="field.id + '-error'" class="text-red-500">{{field.label}} is required.</small>
        </article>
    </form>
</template>