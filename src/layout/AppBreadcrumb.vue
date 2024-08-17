<script setup>
    import Breadcrumb from "primevue/breadcrumb";

    defineProps({
        home: {
            type: Object,
            default() {
                return {icon: "pi pi-home", to: "/" }
            }
        },
        items: {
            type: Array,
            default() {
                return []
            }
        }
    })
</script>

<template>
    <Breadcrumb :home="home" :model="items">
        <template #item="{ item, props }">
            <router-link v-if="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
                <a class="p-menuitem-link" :href="href" v-bind="props.action" @click="navigate">
                    <i :class="['p-menuitem-icon', item.icon]"> </i>
                    <span class="p-menuitem-text">{{ item.label }}</span>
                </a>
            </router-link>
            <a v-else class="p-menuitem-link" :href="item.url" :target="item.target" v-bind="props.action">
                <span class="p-menuitem-text">{{ item.label }}</span>
            </a>
        </template>
    </Breadcrumb>
</template>