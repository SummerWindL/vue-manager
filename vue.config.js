/**
 * 解决跨域问题
 * @type {{devServer: {proxy: {"/api": {changeOrigin: boolean, pathRewrite: {"^/api": string}, target: string}}, host: string, open: boolean}}}
 */
 module.exports = {
    configureWebpack: {
        plugins: [
          new webpack.EnvironmentPlugin(['VUE_APP_API_BASE_URL'])
        ]
    },
    devServer: {
        host: 'localhost',
        open: true, // 自动打开浏览器
        // 代理配置表，在这里可以配置特定的请求代理到对应的API接口
        // 例如将'localhost:8080/api/xxx'代理到'www.example.com/api/xxx'
        proxy: {
            '/api': { // 匹配所有以 '/api'开头的请求路径
                target: "http://localhost:8071/api", // 代理目标的基础路径
                // secure: false,  // 如果是https接口，需要配置这个参数
                changeOrigin: true, // 支持跨域
                pathRewrite: { // 重写路径: 去掉路径中开头的'/api'
                    '^/api': ''
                }
            }
        }
    }
}