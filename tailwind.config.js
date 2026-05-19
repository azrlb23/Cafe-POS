import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.vue',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                serif: ['Playfair Display', ...defaultTheme.fontFamily.serif],
                jakarta: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                cafe: {
                    base: 'var(--color-bg-base)',
                    surface: 'var(--color-bg-surface)',
                    overlay: 'var(--color-bg-overlay)',
                    'overlay-hover': 'var(--color-bg-overlay-hover)',
                    main: 'var(--color-text-main)',
                    secondary: 'var(--color-text-secondary)',
                    muted: 'var(--color-text-muted)',
                    border: 'var(--color-border-subtle)',
                    'border-strong': 'var(--color-border-strong)',
                }
            }
        },
    },

    plugins: [forms],
};
