// Rounds off numbers to a maximum of two decimal places.
function round(int: number) {
  return Math.round((int + Number.EPSILON) * 100) / 100;
}

export default round;