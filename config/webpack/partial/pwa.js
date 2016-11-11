"use strict";
var path = require('path');
var archetype = require("../../archetype");
var mergeWebpackConfig = archetype.devRequire("webpack-partial").default;
var fileLoader = archetype.devRequire.resolve("file-loader");
var webAppManifestLoader = require.resolve("web-app-manifest-loader");
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
var FaviconsWebpackPlugin = require('favicons-webpack-plugin');


var runtimeCachePath = path.resolve(process.cwd(), 'client/pwa-runtime-cache.json');

function getRuntimeCacheJSON() {
  var runtimeCacheJSON;

  try {
    runtimeCacheJSON = require(runtimeCachePath);
  } catch(err) {
    runtimeCacheJSON = [];
  }

  return runtimeCacheJSON;
}

module.exports = function () {
  return function (config) {
    var runtimeCacheJSON = getRuntimeCacheJSON();
    var precacheConfig = {
      staticFileGlobs: [
        'dist/js/*.{js,css,png,jpg,svg}',
        'dist/js/icons**/*.png'
      ],
      stripPrefix: 'dist',
      cacheId: 'electrode',
      filepath: 'dist/sw.js',
      maximumFileSizeToCacheInBytes: 4194304
    };

    if (runtimeCacheJSON && runtimeCacheJSON.length) {
      precacheConfig.runtimeCaching = runtimeCacheJSON.map(function(runtimeCache) {
        return {
          handler: runtimeCache.handler,
          urlPattern: new RegExp(runtimeCache.urlPattern)
        }
      });
    }

    return mergeWebpackConfig(config, {
      module: {
        loaders: [
          {
            test: /manifest.json$/,
            loader: fileLoader + '?name=manifest.json!' + webAppManifestLoader
          }
        ]
      },
      plugins: [
        new FaviconsWebpackPlugin({
          logo: './images/electrode.png',
          emitStats: true,
          inject: false,
          background: '#FFFFFF',
          title: 'Electrode',
          statsFilename: '../server/iconstats.json',
          icons: {
            android: true,
            appleIcon: true,
            appleStartup: true,
            favicons: true
          }
        }),
        new SWPrecacheWebpackPlugin(precacheConfig)
      ]
    });
  };
};
