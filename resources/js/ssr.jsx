import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { Ziggy } from './ziggy.js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.jsx`,
                import.meta.glob('./Pages/**/*.jsx'),
            ),
        setup: ({ App, props }) => {
            global.route = (name, params, absolute) => {
                // For SSR, we need to use the Ziggy config from props or fallback to our imported Ziggy
                const config = props.ziggy || Ziggy;
                
                // Simple route generation for SSR
                const routeData = config.routes[name];
                if (!routeData) {
                    return name;
                }
                
                let url = routeData.uri;
                
                // Replace parameters
                if (params) {
                    for (const [key, value] of Object.entries(params)) {
                        url = url.replace(`{${key}}`, value);
                    }
                }
                
                // Handle absolute URLs
                if (absolute) {
                    return `${config.url}${url.startsWith('/') ? '' : '/'}${url}`;
                }
                
                return url.startsWith('/') ? url : `/${url}`;
            };

            return <App {...props} />;
        },
    }),
);
