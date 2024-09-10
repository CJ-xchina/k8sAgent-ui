const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: "javascript/auto"
        }
      ]
    }
  },

  //-----------------------Axios跨域请求-----------------------------------------
  devServer: {
    port: 8084,//vue网页访问的端口
    host: "127.0.0.1",//vue网页访问的地址
    https: false,
    open: false,
    proxy: {
      '/sina': {  //为用于替换的的标识字符串
        target: 'http://localhost:5000/',//Axios跨域请求的IP
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/sina': '' //不改变
        }
      },
      /* 可以同步配置多个转发目标
      '/phpUrl': {  //为用于替换的的标识字符串
        target: 'http://192.168.1.8:8080/VueApi',//Axios跨域请求的IP
        changeOrigin: true,
        ws: true,
        pathRewrite: {
            '^/phpUrl': '' //不用改
        }
     }  */

    }
  }
})
