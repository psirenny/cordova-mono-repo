import test from 'ava';
import _map from 'lodash/fp/map';
import { join as pathJoin } from 'path';
import { getRepoData } from '../lib';

test.cb('fails on duplicate plugin id', t => {
  t.plan(1);

  const repoDir = pathJoin(__dirname, 'fixtures/repo-bad-duplicate-plugin-id');

  getRepoData(repoDir, (err) => {
    t.truthy(err);
    t.end();
  });
});

test.cb('fails on missing plugin id', t => {
  t.plan(1);

  const repoDir = pathJoin(__dirname, 'fixtures/repo-bad-missing-plugin-id');

  getRepoData(repoDir, (err) => {
    t.truthy(err);
    t.end();
  });
});

test.cb('succeeds', t => {
  t.plan(2);

  const repoDir = pathJoin(__dirname, 'fixtures/repo-good');

  getRepoData(repoDir, (err, result) => {
    t.ifError(err);

    t.deepEqual(result, {
      pluginDepIdList: [
        'pluginB',
        'pluginY',
        'pluginX',
        'pluginC',
        'pluginA',
        'plugin1',
        'plugin2',
      ],
      pluginIdPathMap: {
        plugin1: pathJoin(repoDir, 'plugin1'),
        plugin2: pathJoin(repoDir, 'plugin2'),
        pluginA: pathJoin(repoDir, 'pluginA'),
        pluginB: pathJoin(repoDir, 'pluginB'),
        pluginC: pathJoin(repoDir, 'pluginC'),
      },
    });

    t.end();
  });
});
