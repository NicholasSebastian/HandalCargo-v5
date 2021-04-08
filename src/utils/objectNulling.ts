function fillEmptyValues(obj: object) {
  const objectEntries = Object.entries(obj).map(([key, value]) => {
    const newValue = value || null;
    return [key, newValue];
  });
  return Object.fromEntries(objectEntries);
}

export default fillEmptyValues;