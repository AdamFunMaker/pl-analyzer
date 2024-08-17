import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "@/layout/AppLayout.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: AppLayout,
            children: [
                {
                    path: "/",
                    name: "Home",
                    component: () => import("@/views/Home.vue"),
                    alias: "/home"
                },
                {
                    path: "/manage",
                    children: [
                        {
                            path: "item-categories",
                            name: "Manage Item Categories",
                            component: () => import("@/views/manage/ItemCategories.vue")
                        },
                        {
                            path: "items/purchases",
                            name: "Manage Items - Purchases",
                            component: () => import("@/views/manage/items/Purchases.vue")
                        },
                        {
                            path: "items/sales",
                            name: "Manage Items - Sales",
                            component: () => import("@/views/manage/items/Sales.vue")
                        }
                    ]
                },
                {
                    path: "/transactions",
                    children: [
                        {
                            path: "purchases",
                            name: "Purchases",
                            component: () => import("@/views/transactions/Purchases.vue")
                        },
                        {
                            path: "sales",
                            name: "Sales",
                            component: () => import("@/views/transactions/Sales.vue")
                        }
                    ]
                },
                {
                    path: "/cash-flow",
                    name: "Cash Flow",
                    component: () => import("@/views/CashFlow.vue")
                },
                {
                    path: "/analysis",
                    children: [
                        {
                            path: "overview",
                            name: "Analysis - Overview",
                            component: () => import("@/views/analysis/Overview.vue")
                        },
                        {
                            path: "transactions",
                            name: "Analysis - Transactions",
                            component: () => import("@/views/analysis/Transactions.vue")
                        }
                    ]
                }
            ]
        }
    ]
});

export default router;