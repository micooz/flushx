// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export async function codeGen(src: string, dist: string): Promise<void> {
  const files = await fs.promises.readdir(src);

  for (const file of files) {
    if (!/\.d\.ts$/.test(file)) {
      continue;
    }

    const fullPath = path.join(src, file);

    let code = await fs.promises.readFile(fullPath, { encoding: 'utf8' });

    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'classProperties',
        'typescript',
      ],
    });

    const appendNodes: t.Statement[] = [];

    /**
     * implement ts declare method using following code:
     * {
     *   return request('/xxx');
     * }
     */
    traverse(ast, {
      TSDeclareMethod(path) {
        let node = t.cloneNode(path.node);

        const name = node.key.name;

        // first change it to normal function
        node.type = 'FunctionDeclaration';
        // give a name
        node.id = t.identifier(name);
        // make it async
        node.async = true;
        // inject function body
        node.body = t.blockStatement([
          t.returnStatement(
            t.callExpression(
              t.identifier('request'),
              [
                // method
                t.stringLiteral(`/${name}`),
                // params
                (Array.isArray(node.params) && node.params.length) ? t.objectExpression([
                  t.objectProperty(
                    node.params[0],
                    node.params[0],
                    // t.identifier('params'),
                    // t.identifier('params')
                  )
                ]) : null,
              ].filter(Boolean)
            )
          ),
        ]);
        // export the function
        node = t.exportNamedDeclaration(node);

        appendNodes.push(node);
      },
    });

    // remove class declaration
    traverse(ast, {
      ClassDeclaration(path) {
        path.remove();
      },
    })

    const importDeclaration = t.importDeclaration(
      [
        t.importSpecifier(
          t.identifier('request'),
          t.identifier('request')
        ),
      ],
      t.stringLiteral('@/utils'),
    );

    t.addComment(
      importDeclaration,
      'leading',
      ' NOTICE: YOU SHOULD NOT MODIFY THIS FILE MANUALLY',
      true
    );

    ast.program.body = [
      // insert import statement
      importDeclaration,
      ...ast.program.body,
      // append new functions to the tail
      ...appendNodes,
    ];

    // generate code
    code = generate(ast).code;

    // write to disk
    await fs.promises.writeFile(
      path.join(dist, `${path.basename(file, '.d.ts')}.ts`),
      code,
      { encoding: 'utf8' }
    );
  }
}