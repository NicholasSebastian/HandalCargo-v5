function onMultipleValues (deleteQuery: string, queryValues: Array<string>) {
  const queryEnd = queryValues.map(() => '?').join(',');
  const newDeleteQuery = deleteQuery.replace('?', queryEnd);
  return newDeleteQuery;
}

function withMultipleValues (insertQuery: string, queryValues: Array<object>) {
  const from = insertQuery.lastIndexOf('(');
  const queryEnd = insertQuery.substring(from);

  let newInsertQuery = insertQuery;
  for (let i = 0; i < queryValues.length - 1; i++) {
    newInsertQuery += `,${queryEnd}`;
  }
  
  const flattenedValues = queryValues.map(entry => Object.values(entry)).flat();
  return [newInsertQuery, flattenedValues];
}

export { onMultipleValues };
export default withMultipleValues;