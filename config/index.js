// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../docs/index.html'),
    assetsRoot: path.resolve(__dirname, '../docs'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 7002,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/n8n': {
        target: 'http://localhost:5678',
        secure: false,
        changeOrigin: true,
        pathRewrite: {'^/n8n': ''}
      },
     '/api': { // 匹配所有以 '/api'开头的请求路径
        target: 'http://localhost:8071', // 代理目标的基础路径
        // secure: false,  // 如果是https接口，需要配置这个参数
        secure:false,// 这是签名认证，http和https区分的参数设置y
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" }
      },
      '/word2Pdf': { // 匹配所有以 '/api'开头的请求路径
        target: 'http://localhost:8089/', // 代理目标的基础路径
        // secure: false,  // 如果是https接口，需要配置这个参数
        secure:false,// 这是签名认证，http和https区分的参数设置y
        changeOrigin: true,
        pathRewrite: { "^word2Pdf": "" }
     }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
