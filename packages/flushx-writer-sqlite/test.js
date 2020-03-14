const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
  require('better-sqlite3');
  new Worker(__filename);
} else {
  require('better-sqlite3'); // Error: Module did not self-register
}
