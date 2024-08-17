<script setup>
    import { useLayout } from "@/layout/composables/layout.js";

    const { appVersion } = useLayout();
</script>

<template>
    <footer class="layout__footer">
        <span>Version {{ appVersion }}</span>
    </footer>
</template>
