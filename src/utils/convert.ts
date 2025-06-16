export const convertValueToString = (value: string | number | boolean | object, type: string): string => {
  if (type === "json" && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

export const parseConfigValue = (value: string, type: string): string | number | boolean | object => {
  switch (type) {
    case 'number':
      const num = Number(value);
      return isNaN(num) ? value : num;
    case 'boolean':
      return value === 'true';
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value; // 如果解析失败，返回原始字符串
      }
    case 'string':
    default:
      return value;
  }
}