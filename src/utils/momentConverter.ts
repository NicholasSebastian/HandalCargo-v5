import moment, { isMoment } from 'moment';

// Convert all dates in an object into moment.js dates for use in antd components.
function objectDatesToMoment(data: object) {
  const entries = Object.entries(data).map(entry => {
    const [key, value] = entry;
    if (value instanceof Date) {
      return [key, moment(value)];
    }
    return entry;
  });
  return Object.fromEntries(entries);
}

// Convert all moment.js dates in an object into JS dates for database queries.
function objectMomentToDates(data: object) {
  const entries = Object.entries(data).map(entry => {
    const [key, value] = entry;
    if (isMoment(value)) {
      return [key, value.toDate()];
    }
    return entry;
  });
  return Object.fromEntries(entries);
}

export { objectDatesToMoment, objectMomentToDates };