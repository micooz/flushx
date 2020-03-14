'use strict';
const path = require('path');
const { codeGen } = require('../lib/utils/code-gen');

async function api({ generate, dir }) {
  // const parser = require('@babel/parser');
  // const { default: traverse } = require('@babel/traverse');
  // const ast = parser.parse(`
  // async function getMetrics(a) {
  //   return request("/getMetrics", { params });
  // }
  // `, {
  //   sourceType: 'module',
  // });
  // traverse(ast, {
  //   FunctionDeclaration(path) {
  //     console.log(path.node);
  //   },
  // })
  // return;
  if (generate) {
    const controllerDir = path.join(__dirname, '../lib/controllers');
    const distDir = path.join(process.cwd(), dir);
    await codeGen(controllerDir, distDir);
  }
}

module.exports = api;
