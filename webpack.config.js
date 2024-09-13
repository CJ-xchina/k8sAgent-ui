const {VueLoaderPlugin} = require('vue-loader')

module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                'assets': "@/assets",
                'common': '@/common',
                'components': '@/components',
                'network': '@/network'
            }
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,  // 处理 .vue 文件
                    loader: 'vue-loader',
                },
                {
                    test: /\.ts$/,  // 处理 TypeScript 文件
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/],  // 确保 .vue 文件也会被 ts-loader 处理
                    },
                },
                {
                    test: /\.css$/,  // 处理 CSS 文件
                    use: ['style-loader', 'css-loader'],
                },
            ],
        }
    },

    devServer: {
        client: {
            overlay: {
                runtimeErrors: (error) => {
                    if (error?.message === "ResizeObserver loop completed with undelivered notifications.") {
                        console.error(error)
                        return false;
                    }
                    return true;
                },
            },
        },
    },
}
