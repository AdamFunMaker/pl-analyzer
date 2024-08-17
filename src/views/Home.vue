<script setup>
    import { onMounted } from "vue";

    const emit = defineEmits(['update-breadcrumbs']);

    onMounted(() => {
        emit('update-breadcrumbs', [{label: "Dashboard"}]);
    });
</script>

<template></template>