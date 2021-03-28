// This is an anti-pattern but oh well.
// This is the result of components not fucking unmounting properly.
function instanceOfKey(key: string | number) {
  const dateTime = new Date();
  const currentTimeframe = dateTime.getMilliseconds();
  const uniqueKey = `${key}-${currentTimeframe}`;
  return uniqueKey;
}

export default instanceOfKey;