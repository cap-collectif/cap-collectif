// @flow

export type Base64String = string;
export function base64(i: string): Base64String {
  return Buffer.from(i, 'utf8').toString('base64');
}
export function unbase64(i: Base64String): string {
  return Buffer.from(i, 'base64').toString('utf8');
}
export type ResolvedGlobalId = {
  type: ?string,
  id: string,
};

export function fromGlobalId(globalId: ?string): ResolvedGlobalId {
  if (!globalId) {
    return { type: '', id: '' };
  }
  const unbasedGlobalId = unbase64(globalId);
  const delimiterPos = unbasedGlobalId.indexOf(':');
  if (delimiterPos === -1) {
    return { id: globalId, type: null };
  }
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1),
  };
}
