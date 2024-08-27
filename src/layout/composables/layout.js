import { getVersion } from "@tauri-apps/api/app";
import { computed, reactive, readonly, watch } from "vue";
import { usePreferredDark, useLocalStorage } from "@vueuse/core";

const appVersion = await getVersion();
const layoutState = reactive({
    darkTheme: useLocalStorage("darkTheme", usePreferredDark()),
    loading: true
});

watch(usePreferredDark(), (preferDark) => {
    layoutState.darkTheme = preferDark;
});

watch(() => layoutState.darkTheme, (darkTheme) => {
    darkTheme ? document.documentElement.classList.add("theme-dark") : document.documentElement.classList.remove("theme-dark");
}, {immediate: true});

export function useLayout() {
    const setLoading = (state) => {
        layoutState.loading = state;
    }
    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();
            return
        }

        document.startViewTransition(() => executeDarkModeToggle());
    };
    const executeDarkModeToggle = () => {
        layoutState.darkTheme = !layoutState.darkTheme;
        document.documentElement.classList.toggle("theme-dark");
    };
    const isLoading = computed(() => layoutState.loading);
    const isDarkTheme = computed(() => layoutState.darkTheme);

    return { appVersion, layoutState: readonly(layoutState), isDarkTheme, isLoading, setLoading, toggleDarkMode };
}