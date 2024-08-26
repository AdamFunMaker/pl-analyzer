<script setup>
    import { ref } from "vue";
    import Button from "primevue/button";
    import ConfirmDialog from "primevue/confirmdialog";
    import DynamicDialog from 'primevue/dynamicdialog';
    import Toast from "primevue/toast";
    import AppHeader from "./AppHeader.vue";
    import AppFooter from "./AppFooter.vue";
    import AppBreadcrumb from "./AppBreadcrumb.vue";

    const breadcrumbItems = ref([]);

    const updateBreadcrumbs = (breadcrumbs) => {
        breadcrumbItems.value = breadcrumbs
    }
</script>

<template>
    <Toast></Toast>
    <DynamicDialog></DynamicDialog>
    <ConfirmDialog>
        <template #container="{ message, acceptCallback, rejectCallback }">
            <section class="p-dialog-header pb-0 flex-col justify-center">
                <i :class="['p-confirmdialog-icon', message.icon]"></i>
                <span class="p-dialog-title my-4 text-2xl">{{ message.header }}</span>
            </section>
            <section class="p-dialog-content px-6 py-0 mb-6">
                <p class="p-confirmdialog-message w-full m-0 text-sm text-center">{{ message.message }}</p>
            </section>
            <section v-focustrap class="p-dialog-footer">
                <Button class="p-confirmdialog-reject-button grow" :label="message.rejectLabel" :icon="message.rejectIcon" severity="secondary" @click="rejectCallback"></Button>
                <Button class="p-confirmdialog-accept-button grow" :label="message.acceptLabel" :icon="message.acceptIcon" :severity="message.severity" @click="acceptCallback" autofocus></Button>
            </section>
        </template>
    </ConfirmDialog>
    <AppHeader></AppHeader>
    <main class="layout__main">
        <AppBreadcrumb :items="breadcrumbItems"></AppBreadcrumb>
        <RouterView @update-breadcrumbs="updateBreadcrumbs"></RouterView>
    </main>
    <AppFooter></AppFooter>
</template>
