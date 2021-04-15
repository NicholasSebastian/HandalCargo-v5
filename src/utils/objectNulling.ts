function fillEmptyValues(obj: object) {
  const objectEntries = Object.entries(obj).map(entry => {
    const [key, value] = entry;
    if (typeof value === 'boolean') {
      return entry;
    }
    else {
      const newValue = value || null;
      return [key, newValue];
    }
  });
  return Object.fromEntries(objectEntries);
}

export default fillEmptyValues;