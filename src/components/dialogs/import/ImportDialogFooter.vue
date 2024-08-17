<script setup>
    import { inject, ref, computed } from "vue";
    import Button from "primevue/button";

    const emit = defineEmits(["error"]);
    const dialogRef = inject("dialogRef");
    const file = dialogRef?.value.data.file;
    const isProcessing = ref(false);
    
    const closeDialog = () => {
        dialogRef?.value.close();
    };
    
    const submit = () => {
        dialogRef.value.data.hasSubmitted = true;
        const fields = dialogRef?.value.data.fields;
        const options = dialogRef?.value.data.options;

        let isInputValid = true;

        if (!file || !options.worksheet || !options.header_row) {
            isInputValid = false;
        }

        fields.forEach(field => {
            if (!field.mapping || fields.filter(f => f.name != field.name).map(otherField => otherField.mapping).includes(field.mapping)) {
                isInputValid = false;
            }
        });

        if (isInputValid) {
            isProcessing.value = true;

            if (dialogRef?.value.data.importFunctionParam) {
                dialogRef?.value.data.importFunction(dialogRef?.value.data.importFunctionParam, file, fields, options).then((res) => {
                    if (res.success) {
                        dialogRef?.value.close({success: true, file: file, result: res.data});
                    } else {
                        emit("error", res.error);
                    }
    
                    isProcessing.value = false;
                });
            } else {
                dialogRef?.value.data.importFunction(file, fields, options).then((res) => {
                    if (res.success) {
                        dialogRef?.value.close({success: true, file: file, result: res.data});
                    } else {
                        emit("error", res.error);
                    }
    
                    isProcessing.value = false;
                });
            }
        }
    }
</script>

<template>
    <Button label="Cancel" severity="danger" text @click="closeDialog"></Button>
    <Button :class="isProcessing ? 'cursor-wait' : ''" label="Import" iconPos="right" severity="success" :loading="isProcessing" :disabled="!file.data || isProcessing" autofocus @click="submit"></Button>
</template>