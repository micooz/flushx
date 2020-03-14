'use strict';
// flushx plugin utils
function plugin({ create, update, pkg }) {
  if (create) {
    createPlugin(pkg);
  }
  if (update) {
    updatePlugin(pkg);
  }
}

function createPlugin(name) {
  // TODO
}

function updatePlugin(pkg) {
  // TODO
}

module.exports = plugin;
