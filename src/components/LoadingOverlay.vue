<script setup>
    import { ref } from "vue";
    import BlockUI from "primevue/blockui";
    import ProgressSpinner from "primevue/progressspinner";

    const props = defineProps({
        loading: {
            type: Boolean,
            default: true
        }
    });
    const mask = ref();
</script>

<template>
    <BlockUI ref="mask" :blocked="loading" :autoZIndex="false" :pt="{
        mask: {
            class: 'backdrop-blur-sm'
        }
    }">
        <ProgressSpinner v-if="mask?.isBlocked" :pt="{
            root: {
                class: 'absolute top-2/4 left-2/4',
                style: 'transform: translate(-50%, -50%); z-index: 1102'
            }
        }">
        </ProgressSpinner>
        <slot></slot>
    </BlockUI>
</template>