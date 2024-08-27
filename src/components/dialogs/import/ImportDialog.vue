<script setup>
    import { utils, read } from "xlsx";
    import { open } from "@tauri-apps/api/dialog";
    import { readBinaryFile } from "@tauri-apps/api/fs";
    import { inject, ref } from "vue";
    import Button from "primevue/button";
    import Fieldset from "primevue/fieldset";
    import Fluid from "primevue/fluid";
    import InputNumber from "primevue/inputnumber";
    import ProgressSpinner from "primevue/progressspinner";
    import Select from "primevue/select";
    import ToggleSwitch from "primevue/toggleswitch";

    const dialogRef = inject("dialogRef");
    const file = dialogRef.value?.data.file;
    const fields = dialogRef.value?.data.fields;
    const options = dialogRef.value?.data.options;
    const worksheets = ref([]);
    const headers = ref([]);
    const isLoading = ref(false);

    async function selectFile() {
        file.path = await open({
            title: "Import from Excel",
            filters: [
                {
                    name: "Excel Spreadsheet",
                    extensions: ["xlsx", "xls"]
                }
            ]
        });

        if (!file.path) {
            return;
        }

        file.name = file.path.replace(/^.*[\\/]/, "");
        isLoading.value = true;
        dialogRef.value.data.hasSubmitted = false;
        file.data = await readBinaryFile(file.path);
        const workbook = read(file.data);
        worksheets.value = workbook.Sheets;
        options.worksheet = workbook.SheetNames[0];
        updateHeaders();
        isLoading.value = false;
    }

    function updateHeaders() {
        headers.value = utils.sheet_to_json(worksheets.value[options.worksheet], { header: 1, blankrows: false })[options.header_row - 1];

        for (let field of fields) {
            field.mapping = null;
            headers.value.forEach((header) => {
                if (typeof(header) === "string" && field.label.localeCompare(header.trim(), "en", { sensitivity: "accent" }) === 0) {
                    field.mapping = header;
                }
            });
        }
    }

    function validateFile() {
        return dialogRef.value?.data.hasSubmitted && !file.data;
    }

    function validateFieldMapping(field) {
        return dialogRef.value?.data.hasSubmitted && (!field.mapping || fields.filter(f => f.label != field.label).map(otherField => otherField.mapping).includes(field.mapping));
    }

    function fieldMappingError(field) {
        if (!field.mapping) {
            return `Field mapping for ${field.label} is required.`;
        } else if (fields.filter(f => f.label != field.label).map(otherField => otherField.mapping).includes(field.mapping)) {
            return `Field mapping for ${field.label} is duplicated.`;
        }
    }
</script>

<template>
    <form class="mx-8 flex flex-col gap-4" @submit.prevent="dialogRef.data.hasSubmitted = true">
        <section class="flex flex-col md:flex-row gap-4">
            <article class="flex flex-col gap-2 w-full">
                <label for="file">Select File to Import<span title="required" class="required-indicator" aria-hidden="true">*</span></label>
                <div class="flex items-center gap-2">
                    <Button id="file" icon="pi pi-upload" label="Browse" size="small" :loading="isLoading" autofocus @click="selectFile"></Button>
                    <span>{{ file.name ? file.name : "No file selected" }}</span>
                </div>
                <small v-if="validateFile()" id="file-error" class="text-red-500">File is required.</small>
            </article>
            <article class="flex flex-col gap-2 w-full">
                <label for="overwrite">Overwrite Existing? <i v-tooltip="'Whether or not to delete existing data before importing'" class="pi pi-question-circle"></i></label>
                <ToggleSwitch id="overwrite" name="overwrite" v-model="options.overwrite"></ToggleSwitch>
            </article>
        </section>
        <ProgressSpinner v-if="isLoading" class="flex flex-wrap overflow-hidden"></ProgressSpinner>
        <Fluid v-if="!isLoading && file.data" class="flex flex-col gap-4">
            <section class="flex flex-col gap-2">
                <label for="worksheet">Worksheet<span title="required" class="required-indicator" aria-hidden="true">*</span></label>
                <Select id="worksheet" v-model="options.worksheet" :options="Object.keys(worksheets)" @update:modelValue="updateHeaders"></Select>
            </section>
            <section class="flex flex-col gap-2">
                <label for="header_row">Header Row<span title="required" class="required-indicator" aria-hidden="true">*</span> <i v-tooltip="'Which row are the headers? (start from 1)'" class="pi pi-question-circle"></i></label>                
                <InputNumber inputId="header_row" v-model="options.header_row" :min="1" :allowEmpty="false" showButtons @update:modelValue="updateHeaders"></InputNumber>
            </section>
            <Fieldset legend="Field Mappings" :pt="{
                content: {
                    class: 'flex flex-col gap-4'
                }
            }">
                <section v-for="field in fields" class="flex flex-col gap-2">
                    <label>{{ field.label }}<span title="required" class="required-indicator" aria-hidden="true">*</span></label>
                    <Select v-model="field.mapping" :options="headers" :invalid="validateFieldMapping(field)"></Select>
                    <small v-if="validateFieldMapping(field)" :id="field.label + '-error'" class="text-red-500">{{ fieldMappingError(field) }}</small>
                </section>
            </Fieldset>
        </Fluid>
    </form>
</template>