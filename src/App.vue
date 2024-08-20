<script setup>
    import { nextTick } from "vue";
    import { useRouter } from "vue-router";
    import { usePrimeVue } from "primevue/config";
    import { useLayout } from "@/layout/composables/layout.js";
    import BlockUI from "primevue/blockui";
    import ProgressSpinner from "primevue/progressspinner";

    const router = useRouter();
    const primevue = usePrimeVue();
    const { isLoading, setLoading } = useLayout();

    primevue.config.locale.firstDayOfWeek = 1;

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
            class: 'backdrop-blur-sm'
        }
    }">
    </BlockUI>
    <ProgressSpinner v-if="isLoading" :pt="{
        root: {
            class: 'fixed top-2/4 left-2/4',
            style: 'transform: translate(-50%, -50%); z-index: 1102'
        }
    }">
    </ProgressSpinner>
    <RouterView></RouterView>
</template>