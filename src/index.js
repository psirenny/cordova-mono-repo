// @flow

import asyncReduce from 'async/reduce';
import { lstat as fsLstat, readdir as fsReaddir, readFile as fsReadFile } from 'fs';
import _concat from 'lodash/fp/concat';
import _compact from 'lodash/fp/compact';
import _curry from 'lodash/fp/curry';
import _flatMap from 'lodash/fp/flatMap';
import _flow from 'lodash/fp/flow';
import _get from 'lodash/fp/get';
import _getOr from 'lodash/fp/getOr';
import _map from 'lodash/fp/map';
import _reduce from 'lodash/fp/reduce';
import _set from 'lodash/fp/set';
import _sortedUniq from 'lodash/fp/sortedUniq';
import _toString from 'lodash/fp/toString';
import _trim from 'lodash/fp/trim';
import { join as pathJoin } from 'path';
import toposort from 'toposort';
import { parseString as xmlParseString } from 'xml2js';

const getPluginId = (data: any): string => (
  _trim(_toString(_get('plugin.$.id', data)))
);

const getPluginDepIds = (data: any): string[] => {
  const root = _get('plugin', data);
  const rootDeps = _getOr([], 'dependency', root);
  const platforms = _getOr([], 'platform', root);
  const platformDeps = _compact(_flatMap('dependency', platforms));
  return _map('$.id', _concat(rootDeps, platformDeps));
};

type Result = {
  pluginDepIdList: string[],
  pluginIdPathMap: { [string]: string },
};

type ResultCallback = (err: ?Error, result: ?Result) => void;

export const getRepoData = _curry((repoPath: string, cb: ResultCallback): void => (
  fsReaddir(repoPath, (readRepoErr, pluginDirs) => {
    if (readRepoErr) {
      return cb(readRepoErr);
    }

    const accInit = {
      pluginDepIdGraph: [],
      pluginIdPathMap: {},
    };

    return asyncReduce(pluginDirs, accInit,
      (acc, pluginDir, done) => {
        const pluginPath = pathJoin(repoPath, pluginDir);
        const pluginDataPath = pathJoin(pluginPath, 'plugin.xml');

        fsLstat(pluginPath, (readPluginErr, fileStat) => {
          if (readPluginErr) {
            return done(readPluginErr);
          }

          if (!fileStat.isDirectory()) {
            return done(null, acc);
          }

          fsReadFile(pluginDataPath,
            (readPluginDataErr, pluginDataXml) => {
              if (readPluginDataErr) {
                return done(null, acc);
              }

              return xmlParseString(pluginDataXml,
                (parsePluginDataErr, pluginData) => {
                  if (parsePluginDataErr) {
                    return done(parsePluginDataErr);
                  }

                  const pluginId = getPluginId(pluginData);
                  const pluginDepIds = getPluginDepIds(pluginData);

                  if (!pluginId) {
                    return done(new Error(`Cannot find id in "${pluginDataPath}"`));
                  }

                  const pluginDepIdGraph = _concat(
                    acc.pluginDepIdGraph,
                    _map(pluginDepId => [pluginDepId, pluginId], pluginDepIds),
                  );

                  if (_get(pluginId, acc.pluginIdPathMap)) {
                    return done(new Error(`Found duplicate plugin id ${pluginDataPath}`));
                  }

                  const pluginIdPathMap = _set(
                    pluginId,
                    pluginPath,
                    acc.pluginIdPathMap,
                  );

                  return done(null, {
                    pluginDepIdGraph,
                    pluginIdPathMap,
                  });
                }
              );
            }
          );
        });
      },
      (err, result) => {
        if (err) return cb(err);

        return cb(null, {
          pluginDepIdList: toposort(result.pluginDepIdGraph),
          pluginIdPathMap: result.pluginIdPathMap,
        });
      },
    );
  })
));
