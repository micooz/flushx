export function mapToJson(map: Map<string, string>): object {
  const obj: { [key: string]: string } = {};
  for (const [ key, value ] of map.entries()) {
    obj[key] = value;
  }
  return obj;
}
