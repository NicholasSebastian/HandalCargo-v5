function isEmptyObject(obj: object) {
  const isEmpty = Object.keys(obj).length === 0;
  const hasConstructor = obj.constructor === Object;
  return obj && isEmpty && hasConstructor;
}

export default isEmptyObject;