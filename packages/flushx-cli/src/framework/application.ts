import * as fs from 'fs';
import * as path from 'path';
import * as Koa from 'koa';
import * as Router from 'koa-router';
// import serve from 'koa-simple-static';

import { Controllers, createController } from './controller';

export type ApplicationOptions = {
  // listen port
  port: number;

  // router register function path
  routers: string;

  // controllers path
  controllers: string;
};

export type ApplicationInitOptions = {
  context: { [key: string]: any };
};

export class Application {

  options: ApplicationOptions;

  router: any; // koa router

  controller: Controllers = {};

  constructor(options: ApplicationOptions) {
    const defaultOptions = {
      port: 3000,
      routers: '',
      controllers: '',
    };
    this.options = options || defaultOptions;
  }

  async init(options: ApplicationInitOptions): Promise<void> {
    const { controllers, routers } = this.options;
    const { context } = options;

    // create koa-router
    this.router = new Router();

    // import all controllers from target dir
    const files = await fs.promises.readdir(controllers);

    for (const file of files) {
      const ext = path.extname(file);
      if (ext !== '.js') {
        continue;
      }
      const name = path.basename(file, '.js');
      const { default: clazz } = await import(path.join(controllers, file));
      this.controller[name] = createController(clazz, context);
    }

    // import router register
    const { default: register } = await import(routers);

    // register all routers
    register(this);
  }

  async start(): Promise<() => void> {
    const { router, options: { port } } = this;

    const app = new Koa();

    // app.use(serve({
    //   dir: path.join(__dirname, '../dist'),
    // }));

    app.use(router.routes());
    app.use(router.allowedMethods());

    return new Promise(resolve => {
      app.listen(port, resolve);
    });
  }

}
