import { ref, onMounted, watch } from 'vue';

export function useTheme() {
    const isDark = ref(false);

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isDark.value = savedTheme === 'dark';
        } else {
            // Default to dark mode for the cafe vibe
            isDark.value = true;
        }
        applyTheme(isDark.value);
    };

    const applyTheme = (dark) => {
        if (dark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleTheme = () => {
        isDark.value = !isDark.value;
        applyTheme(isDark.value);
    };

    onMounted(() => {
        initTheme();
    });

    return {
        isDark,
        toggleTheme
    };
}
