var Importer = require('../importer/importer');
var co = require('co');
var fs = require('fs');
var path = require('path');

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to tutorial root is required.")
      .demand(['root'])
      .argv;

    var root = fs.realpathSync(args.root);

    var importer = new Importer({
      root: root
    });

    return co(function* () {

      yield* importer.destroyAll();

      var subRoots = fs.readdirSync(root);

      for (var i = 0; i < subRoots.length; i++) {
        var subRoot = subRoots[i];
        if (!parseInt(subRoot)) continue;
        yield* importer.sync(path.join(root, subRoot));
      }

      yield* importer.generateCaches();

      console.log("DONE");

    });
  };
};


