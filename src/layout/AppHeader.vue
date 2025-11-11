<script setup>
    import { useLayout } from "@/layout/composables/layout.js";
    import Button from "primevue/button";
    import AppNav from "./AppNav.vue";

    const { isDark, toggleDarkMode } = useLayout();
</script>

<template>
    <header class="layout__header">
        <RouterLink to="/" class="layout__header-logo">
            <img src="/logo.png" alt="P&L Analyzer logo">
            <span>P&L Analyzer</span>
        </RouterLink>
        <AppNav class="layout__header-nav"></AppNav>
        <section class="layout__header-buttons">
            <Button :icon="`pi ${isDark ? 'pi-moon' : 'pi-sun'}`" severity="contrast" rounded outlined @click="toggleDarkMode"></Button>
        </section>
    </header>
</template>