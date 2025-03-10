const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    entry: {
      app: './src/main.ts'
    }
  },
  chainWebpack: config => {
    // Disable eslint
    config.plugins.delete('eslint');
    
    // Disable TypeScript type checking
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => {
        options = options || {};
        options.transpileOnly = true;
        return options;
      });
  }
})
