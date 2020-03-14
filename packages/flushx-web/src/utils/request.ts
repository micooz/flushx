import { extend, RequestOptionsInit } from 'umi-request';

const req = extend({
  prefix: '/api',
});

export const request = async (url: string, options?: RequestOptionsInit) => {
  return req(url, options).then(res => res?.data);
};
