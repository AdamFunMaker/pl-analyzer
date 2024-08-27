<script setup>
    import { inject, ref, watch } from "vue";
    import Button from "primevue/button";

    const emit = defineEmits(["error"]);
    const dialogRef = inject("dialogRef");
    const isProcessing = ref(false);

    function closeDialog() {
        dialogRef.value?.close();
    }

    function submit() {        
        const fields = dialogRef.value?.data.fields;
        const newRecord = dialogRef.value?.data.newRecord;

        let isInputValid = true;

        fields.forEach((field) => {
            if (field.required && !newRecord[field.id]) {
                isInputValid = false;
            }
        });

        if (isInputValid) {
            isProcessing.value = true;

            if (dialogRef.value?.data.addFunctionParam) {
                dialogRef.value?.data.addFunction(dialogRef.value?.data.addFunctionParam, newRecord).then((res) => {
                    if (res.success) {
                        dialogRef.value?.close({ success: true, record: newRecord });
                    } else {
                        emit("error", res.error);
                    }

                    isProcessing.value = false;
                });
            } else {
                dialogRef.value?.data.addFunction(newRecord).then((res) => {
                    if (res.success) {
                        dialogRef.value?.close({ success: true, record: newRecord });
                    } else {
                        emit("error", res.error);
                    }

                    isProcessing.value = false;
                });
            }
        }
    }

    watch(
        () => dialogRef.value?.data.hasSubmitted,
        hasSubmitted => {
            if (hasSubmitted) {
                submit();
            }
        }
    );
</script>

<template>
    <Button label="Cancel" severity="danger" text @click="closeDialog"></Button>
    <Button :class="isProcessing ? 'cursor-wait' : ''" label="Add" iconPos="right" severity="success" :loading="isProcessing" @click="dialogRef.data.hasSubmitted = true"></Button>
</template>