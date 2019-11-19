// @flow

export const getExternalExposedLink = (link: string): string => {
  const linkWithoutHost = link.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return linkWithoutHost.indexOf('/') !== -1
    ? linkWithoutHost.substring(0, linkWithoutHost.indexOf('/'))
    : linkWithoutHost;
};
