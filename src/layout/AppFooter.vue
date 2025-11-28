<script setup>
    import { useAppStateStore } from "@/stores/appstate";

    const appstate = useAppStateStore();
</script>

<template>
    <footer class="layout__footer">
        <span>Version {{ appstate.version }}</span>
    </footer>
</template>
