# cordova-mono-repo

Tools to help manage a mono repo of cordova plugins

## Installation

npm i --save-dev cordova-mono-repo-tools

## Usage

    import asyncEachSeries from 'async/eachSeries';
    import { plugin as cordovaPlugin } from 'cordova';
    import { getRepoData } from 'cordova-mono-repo';

    // Install all mono repo plugins in the current working directory
    // as well as any remote plugins they depend on
    getRepoData('path/to/plugin/repo', (err, repoData) => {
      if (err) return console.error(err);

      return asyncEachSeries(repoData.pluginDepIdList,
        (pluginId, next) => {
          const pluginPath = repoData.pluginIdPathMap[pluginId];

          return pluginPath ?
            cordovaPlugin('add', pluginPath, next) :
            cordovaPlugin('add', pluginId, next);
        }
      );
    });
