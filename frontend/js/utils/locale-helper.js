// @flow
export function formatCodeToLocale(code: string): string {
  const codeSplitted = code.split('_');
  codeSplitted[0] = codeSplitted[0].toLowerCase();
  return codeSplitted.join('-');
}