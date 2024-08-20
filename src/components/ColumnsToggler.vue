<script setup>
    import { ref } from "vue";
    import Popover from "primevue/popover";
    import ScrollPanel from "primevue/scrollpanel";
    import ToggleSwitch from "primevue/toggleswitch";

    const props = defineProps({
        columns: {
            type: Array,
            required: true
        }
    });
    const popover = ref();
    const toggle_switch_dt = {
        width: "2.25rem",
        height: "1.25rem"
    };

    defineExpose({toggle: (event) => popover.value.toggle(event)});
</script>

<template>
    <Popover ref="popover">
        <ScrollPanel class="px-2 w-full" style="max-height: 25vh">
            <ul class="flex flex-col gap-4">
                <li v-for="group in props.columns" class="flex flex-col gap-2">
                    <span class="text-muted-color font-semibold">{{ group.label }}</span>
                    <ul v-if="group.items.length" class="flex flex-col gap-2">
                        <li v-for="column in group.items" class="flex items-center justify-between gap-2">
                            <span class="text-sm">{{ column.header }}</span>
                            <ToggleSwitch v-model="column.shown" :dt="toggle_switch_dt"></ToggleSwitch>
                        </li>
                    </ul>
                </li>
            </ul>
        </ScrollPanel>
    </Popover>
</template>