const toCamel = (o) => {
  if (o === null || o === undefined) return o;
  if (Array.isArray(o)) return o.map(toCamel);
  if (typeof o !== 'object') return o;
  const n = {};
  for (const [key, value] of Object.entries(o)) {
    const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
    n[camelKey] = toCamel(value);
  }
  return n;
};
const obj = {
    "id":  "a3b1a8d5-3221-4f1b-90f7-ebf3458e0a81",
    "category":  "Car Wash",
    "name":  "Exterior Wash",
    "price":  299,
    "duration_minutes":  20,
    "is_active":  true,
    "vehicle_types":  ["car", "suv", "ev"]
};
console.log(toCamel(obj));
