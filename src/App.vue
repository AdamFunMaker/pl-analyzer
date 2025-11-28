<script setup>
    import { ref, nextTick, onMounted } from "vue";
    import { useRouter } from "vue-router";
    import { useNetwork } from "@vueuse/core";
    import { useAppStateStore } from "./stores/appstate";
    import { checkForAppUpdates } from "@/utils/updater.js";
    import BlockUI from "primevue/blockui";
    import ProgressSpinner from "primevue/progressspinner";

    const router = useRouter();
    const { isOnline } = useNetwork();
    const appstate = useAppStateStore();
    const loading_mask = ref();

    onMounted(async () => {
        if (isOnline) {
            try {
                await checkForAppUpdates();
            } catch (err) {
                console.log(`App updates check failed: ${err}`);
            }
        }
    });

    router.beforeEach(() => appstate.setLoading(true));
    router.afterEach(() => {
        nextTick(() => {
            appstate.setLoading(false);
        });
    });
</script>

<template>
    <BlockUI ref="loading_mask" :blocked="appstate.loading" fullScreen :pt="{
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