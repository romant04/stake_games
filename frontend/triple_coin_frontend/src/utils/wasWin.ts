export function wasWin(results: string[]) {
  if (results.filter((x) => x === 'H').length > 1) {
    return true;
  }

  if (results.filter((x) => x === 'S').length >= 3) {
    return true;
  }

  return false;
}
