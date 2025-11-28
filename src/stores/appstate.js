import { getVersion } from "@tauri-apps/api/app";
import { ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { defineStore } from "pinia";

const appVersion = await getVersion();
const isDark = useDark({
    onChanged(dark) {
        dark ? document.documentElement.classList.add("theme-dark") : document.documentElement.classList.remove("theme-dark");
    }
});
const toggleDark = useToggle(isDark);
const isLoading = ref(true);

export const useAppStateStore = defineStore("app_state", {
    state: () => ({
        version: appVersion,
        dark: isDark,
        loading: isLoading
    }),
    actions: {
        setLoading(state) {
            this.loading = state
        },
        toggleDarkMode() {
            if (!document.startViewTransition) {
                toggleDark();
                return
            }

            document.startViewTransition(() => toggleDark());
        }
    }
})