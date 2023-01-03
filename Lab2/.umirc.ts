import { defineConfig } from 'umi';

export default defineConfig({
    title: 'test',
    chainWebpack(memo, args) {
        memo.module
            .rule('csvLoader')
            .test(/\.csv$/)
            .use('csvLoader')
            .loader('csv-loader')
            .options({
                dynamicTyping: true,
                header: true,
                skipEmptyLines: true,
            });
    },
    nodeModulesTransform: {
        type: 'none',
    },

    routes: [{ path: '/', component: '@/pages/index' }],
    fastRefresh: {},
    proxy: {
        '/server': {
            target: 'http://192.168.18.199:8080/',
            // target: 'http://localhost:8000/',
            changeOrigin: true,
            pathRewrite: { '^/server': '' },
        },
    },
});
