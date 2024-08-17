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
            <section class="p-dialog-header flex-col !justify-center">
                <i :class="['p-confirm-dialog-icon', message.icon, '!text-8xl']"></i>
                <span class="p-dialog-title">{{ message.header }}</span>
            </section>
            <section class="p-dialog-content">
                <p class="p-confirm-dialog-message m-0 text-sm text-center">{{ message.message }}</p>
            </section>
            <section v-focustrap class="p-dialog-footer">
                <Button class="p-confirm-dialog-reject" :label="message.rejectLabel" :icon="message.rejectIcon" severity="secondary" @click="rejectCallback"></Button>
                <Button class="p-confirm-dialog-accept" :label="message.acceptLabel" :icon="message.acceptIcon" :severity="message.severity" @click="acceptCallback" autofocus></Button>
            </section>
        </template>
    </ConfirmDialog>
    <AppHeader></AppHeader>
    <main class="layout__main">
        <AppBreadcrumb :items="breadcrumbItems">
        </AppBreadcrumb>
        <RouterView @update-breadcrumbs="updateBreadcrumbs"></RouterView>
    </main>
    <AppFooter></AppFooter>
</template>
