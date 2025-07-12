import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                global: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                
                // Laravel/Inertia.js globals
                route: 'readonly',
                
                // Browser globals that might not be defined in all environments
                fetch: 'readonly',
                axios: 'readonly',
                FormData: 'readonly',
                URLSearchParams: 'readonly',
                URL: 'readonly',
                Blob: 'readonly',
                
                // Node.js/Browser timer functions
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                setImmediate: 'readonly',
                
                // Browser APIs
                navigator: 'readonly',
                location: 'readonly',
                confirm: 'readonly',
                alert: 'readonly',
                
                // Web APIs
                btoa: 'readonly',
                atob: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                
                // DOM APIs
                Node: 'readonly',
                XMLHttpRequest: 'readonly',
                AbortController: 'readonly',
                MutationObserver: 'readonly',
                getComputedStyle: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                
                // Server-side specific
                self: 'readonly',
                WorkerGlobalScope: 'readonly',
                queueMicrotask: 'readonly',
                TextEncoder: 'readonly',
                ReadableStream: 'readonly',
                Request: 'readonly',
                Response: 'readonly',
                
                // Laravel specific
                Ziggy: 'readonly',
                
                // Libraries that might be globally available
                _: 'readonly',
                Telescope: 'readonly',
                
                // SSR specific
                __VUE_SSR_CONTEXT__: 'readonly',
                
                // Shadow DOM
                ShadowRoot: 'readonly',
                
                // XPath
                XPathResult: 'readonly',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
        },
        settings: {
            react: {
                version: '18.2',
            },
        },
    },
    {
        ignores: [
            'dist',
            'node_modules',
            'build',
            'public/build',
            'vendor',
            'bootstrap/cache',
            'bootstrap/ssr',
            'storage',
            'public/vendor',
            '**/*.min.js',
            '**/vendor/**',
            '**/build/**',
            '**/dist/**',
            '**/*.tsx', // Exclude TypeScript React files until TS is configured
            'lighthouserc.js', // Has non-standard syntax
            'resources/js/ziggy.js', // Auto-generated file
        ],
    },
];
