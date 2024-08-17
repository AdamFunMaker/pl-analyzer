<script setup>
    import { nextTick } from "vue";
    import { useRouter } from "vue-router";
    import { useLayout } from "@/layout/composables/layout.js";
    import BlockUI from "primevue/blockui";
    import ProgressSpinner from "primevue/progressspinner";

    const router = useRouter();
    const { isLoading, setLoading } = useLayout();

    router.beforeEach(() => setLoading(true));

    router.afterEach(() => {
        nextTick(() => {
            setLoading(false);
        });
    });
</script>

<template>
    <BlockUI :blocked="isLoading" fullScreen :pt="{
        mask: {
            style: 'backdrop-filter: blur(2px)'
        }
    }">
    </BlockUI>
    <ProgressSpinner v-if="isLoading" :pt="{
        root: {
            style: 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1102'
        }
    }">
    </ProgressSpinner>
    <RouterView></RouterView>
</template>