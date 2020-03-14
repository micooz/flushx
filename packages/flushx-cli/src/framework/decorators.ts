export type RouteDecoratorOptions = {
  url: string;
  method?: RouteDecoratorOptionsMethod;
};

export enum RouteDecoratorOptionsMethod {
  GET = 'GET',
  POST = 'POST',
}

// export function route({ url, method }: RouteDecoratorOptions) {
//   return function decorator(func: Function) {

//     router.get(url, controller.metric.getGraph);

//     return func.apply(this);
//   };
// }
