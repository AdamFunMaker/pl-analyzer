<script setup>
    import { ref } from "vue";
    import Menubar from "primevue/menubar";
    
    const navItems = ref([
        {label: "Home", icon: "pi pi-fw pi-home", to: "/"},
        {
            label: "Manage", icon: "pi pi-fw pi-wrench", 
            items: [
                {label: "Item Categories", icon: "pi pi-fw pi-tag", to: "/manage/item-categories"}, 
                {
                    label: "Items", icon: "pi pi-fw pi-barcode", 
                    items: [
                        {label: "Purchases", icon: "pi pi-fw pi-shop", to: "/manage/items/purchases"}, 
                        {label: "Sales", icon:"pi pi-fw pi-warehouse", to: "/manage/items/sales"}
                    ]
                }
            ]
        },
        {
            label: "Transactions", icon: "pi pi-fw pi-receipt", 
            items: [
                {label: "Purchases", icon:"pi pi-fw pi-shopping-cart", to:"/transactions/purchases"}, 
                {label: "Sales", icon:"pi pi-fw pi-wallet", to:"/transactions/sales"}
            ]
        },
        {label: "Cash Flow", icon: "pi pi-fw pi-money-bill", to: "/cash-flow"},
        {
            label: "Analysis", icon: "pi pi-fw pi-chart-line", 
            items: [
                {label: "Overview", icon: "pi pi-fw pi-sitemap", to: "/analysis/overview"},
                {label: "Transactions", icon: "pi pi-fw pi-tags", to: "/analysis/transactions"}
            ]
        }
    ]);
</script>

<template>
    <nav>
        <Menubar :model="navItems" breakpoint="1080px" :pt="{
            root: {
                style: 'border: none'
            },
            buttonIcon: {
                style: 'width: 1.75rem; height: 1.75rem'
            }
        }">
            <template #item="{item, label, props, root, hasSubmenu}">
                <RouterLink v-if="item.to" v-bind="props.action" :to="item.to">
                    <i v-bind="props.icon"></i>
                    <span v-bind="props.label">{{ label }}</span>
                </RouterLink>
                <a v-else v-bind="props.action" :href="item.href" :target="item.target">
                    <i v-bind="props.icon"></i>
                    <span v-bind="props.label">{{ label }}</span>
                    <i v-if="hasSubmenu" :class="['pi', { 'pi-angle-down': root, 'pi-angle-right': !root }]" v-bind="props.submenuicon"></i>
                </a>
            </template>
        </Menubar>
    </nav>
</template>