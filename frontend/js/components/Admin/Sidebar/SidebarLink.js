// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import AppBox from '~ui/Primitives/AppBox';
import Link from '~ds/Link/Link';
import colors from '~/styles/modules/colors';

type Props = {| +text: string, +url: string |};

export const SidebarLink = ({ text, url }: Props): React.Node => {
  const intl = useIntl();
  const active =
    window.location.href.includes(url) ||
    window.location.href.includes(url.slice(0, -4)) ||
    (window.location.href.includes('/admin/capco/app/reporting') && url === '/admin/reporting') ||
    (window.location.href.includes('/admin/alpha/project/') &&
      url === '/admin/capco/app/project/list') ||
    (window.location.href.includes('/admin/capco/app/sitecolor/') &&
      url === '/admin/settings/settings.appearance/list');

  return (
    <Link
      p={1}
      href={url}
      fontSize={13}
      width="120%"
      position="relative"
      css={{
        textDecoration: 'none',
        color: active ? colors.blue[100] : colors.gray[300],
        '&:hover': { textDecoration: 'none', color: colors.blue[100] },
        '&:focus': { textDecoration: 'none', color: colors.blue[100] },
        outline: 'none !important',
        boxShadow: 'none !important',
      }}>
      {intl.formatMessage({ id: text })}
      {active && (
        <AppBox position="absolute" width="6px" left="-10px" top="2px">
          <svg viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.22361 3.44721C5.393 3.36252 5.5 3.18939 5.5 3C5.5 2.81061 5.393 2.63748 5.22361 2.55279L1.22361 0.552786C1.06861 0.475289 0.884543 0.483571 0.737134 0.574675C0.589726 0.665778 0.5 0.826711 0.5 1V5C0.5 5.17329 0.589726 5.33422 0.737134 5.42533C0.884543 5.51643 1.06861 5.52471 1.22361 5.44721L5.22361 3.44721Z"
              stroke={colors.blue[100]}
              strokeLinejoin="round"
            />
          </svg>
        </AppBox>
      )}
    </Link>
  );
};

export default SidebarLink;
