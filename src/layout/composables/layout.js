import { getVersion } from "@tauri-apps/api/app";
import { ref, computed } from "vue";
import { useDark, useToggle } from "@vueuse/core";

const appVersion = await getVersion();
const isDark = useDark({
    onChanged(dark) {
        dark ? document.documentElement.classList.add("theme-dark") : document.documentElement.classList.remove("theme-dark");
    }
});
const toggleDark = useToggle(isDark);
const isLoading = ref(true);

export function useLayout() {
    const setLoading = (state) => {
        isLoading.value = state;
    }
    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            toggleDark();
            return
        }

        document.startViewTransition(() => toggleDark());
    };

    return { appVersion, isDark, isLoading, setLoading, toggleDarkMode };
}