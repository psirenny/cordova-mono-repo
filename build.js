const asyncParallel = require('async/parallel');
const flowCopySource = require('flow-copy-source');
const pathJoin = require('path').join;
const rollupBundle = require('rollup').rollup;
const rollupPluginBabel = require('rollup-plugin-babel');

const run = (done0) => {
  const srcDir = pathJoin(__dirname, 'src');
  const destDir = pathJoin(__dirname, 'lib');

  const bundlePlugins = [
    rollupPluginBabel({
      plugins: ['transform-flow-strip-types'],
      presets: [
        ['env', {
          modules: false,
          targets: { node: 6 },
        }],
      ],
    }),
  ];

  const bundleOptsCreate = {
    entry: pathJoin(srcDir, 'index.js'),
    plugins: bundlePlugins,
  };

  const bundleOptsWrite = {
    dest: pathJoin(destDir, 'index.js'),
    format: 'cjs',
  };

  asyncParallel([
    done1 => (
      flowCopySource([srcDir], destDir)
        .catch(err => done1(err))
        .then(() => done1())
    ),
    done1 => (
      rollupBundle(bundleOptsCreate)
        .catch(err => done1(err))
        .then((bundle) => (
          bundle.write(bundleOptsWrite)
            .catch(err => done1(err))
            .then(() => done1())
        ))
    ),
  ], done0);
};

run((err) => {
  if (err) throw err;
});
