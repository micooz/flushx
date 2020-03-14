import { Context } from 'koa';

export type Controllers = { [key: string]: Controller };

export type Controller = { [key: string]: (ctx: Context) => Promise<void> };

export function createController(clazz: any, extraContext = {}): Controller {
  const instance = new clazz();
  const map: Controller = {};

  for (const method of Object.getOwnPropertyNames(clazz.prototype)) {
    if (method === 'constructor') {
      continue;
    }

    const actualMethod = async (ctx: Context): Promise<void> => {
      const { params, query } = ctx;

      const result = await instance[method].call({
        ctx: { ...ctx, ...extraContext },
      }, {
        ...query,
        ...params,
      });

      ctx.body = {
        success: true,
        data: result,
      };
    }

    map[method] = actualMethod;
  }

  return map;
}
