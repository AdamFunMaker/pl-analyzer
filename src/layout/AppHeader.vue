<script setup>
    import { useAppStateStore } from "@/stores/appstate.js";
    import Button from "primevue/button";
    import AppNav from "./AppNav.vue";

    const appstate = useAppStateStore();
</script>

<template>
    <header class="layout__header">
        <RouterLink to="/" class="layout__header-logo">
            <img src="/logo.png" alt="P&L Analyzer logo">
            <span>P&L Analyzer</span>
        </RouterLink>
        <AppNav class="layout__header-nav"></AppNav>
        <section class="layout__header-buttons">
            <Button :icon="`pi ${appstate.dark ? 'pi-moon' : 'pi-sun'}`" severity="contrast" rounded outlined @click="appstate.toggleDarkMode()"></Button>
        </section>
    </header>
</template>