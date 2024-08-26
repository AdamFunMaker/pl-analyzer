<script setup>
    import { ref, nextTick, onMounted } from "vue";
    import { useRouter } from "vue-router";
    import { usePrimeVue } from "primevue/config";
    import { useLayout } from "@/layout/composables/layout.js";
    import BlockUI from "primevue/blockui";
    import ProgressSpinner from "primevue/progressspinner";

    const router = useRouter();
    const primevue = usePrimeVue();
    const { isLoading, setLoading } = useLayout();
    const loading_mask = ref();

    primevue.config.locale.firstDayOfWeek = 1;

    router.beforeEach(() => setLoading(true));

    router.afterEach(() => {
        nextTick(() => {
            setLoading(false);
        });
    });
</script>

<template>
    <BlockUI ref="loading_mask" :blocked="isLoading" fullScreen :pt="{
        mask: {
            class: 'backdrop-blur-sm'
        }
    }">
        <ProgressSpinner v-if="loading_mask?.isBlocked" :pt="{
            root: {
                class: 'fixed top-2/4 left-2/4',
                style: 'transform: translate(-50%, -50%); z-index: 1102'
            }
        }">
        </ProgressSpinner>
    </BlockUI>
    <RouterView></RouterView>
</template>