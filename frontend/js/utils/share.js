// @flow

export const openSharer = (href: string, name: string) => {
  const height = 500;
  const width = 700;
  const top = window.screen.height / 2 - height / 2;
  const left = window.screen.width / 2 - width / 2;
  window.open(
    href,
    name,
    `top=${top},left=${left},menubar=0,toolbar=0,status=0,width=${width},height=${height}`,
  );
};

const getEncodedUrl = url => {
  return encodeURIComponent(url);
};

type networkType = 'facebook' | 'twitter';
const share = (title: string, url: string, network: networkType) => {
  if (network === 'facebook') {
    openSharer(`http://www.facebook.com/sharer.php?u=${getEncodedUrl(url)}&t=${title}`, 'Facebook');
  }
  if (network === 'twitter') {
    openSharer(`https://twitter.com/share?url=${getEncodedUrl(url)}&text=${title}`, 'Twitter');
  }
};

export default share;
