const withMultipleValues = (insertQuery: string, queryValues: Array<object>) => {
  const from = insertQuery.lastIndexOf('(');
  const queryEnd = insertQuery.substring(from);

  let newInsertQuery = insertQuery;
  for (let i = 0; i < queryValues.length - 1; i++) {
    newInsertQuery += `,${queryEnd}`;
  }
  
  const flattenedValues = queryValues.map(entry => Object.values(entry)).flat();
  return [newInsertQuery, flattenedValues];
}

export default withMultipleValues;