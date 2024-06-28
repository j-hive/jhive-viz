// vite.config.js
import handlebars from 'vite-plugin-handlebars';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { resolve } from 'path'

export default {
    plugins: [handlebars({
        partialDirectory: resolve(__dirname, 'partials')
    }),
    ViteImageOptimizer({ jpeg: { quality: 60 } })
    ],
};