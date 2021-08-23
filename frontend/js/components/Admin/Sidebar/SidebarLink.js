// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import AppBox from '~ui/Primitives/AppBox';
import Link, { type LinkProps } from '~ds/Link/Link';
import colors from '~/styles/modules/colors';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import Tag from '~ds/Tag/Tag';
import Text from '~ui/Primitives/Text';
import { getBaseUrlWithAdminNextSupport } from '~/config';

type Props = {|
  ...LinkProps,
  +text: string,
  +icon?: $Values<typeof ICON_NAME>,
  +beta?: boolean,
  +withLabel?: boolean,
|};

const IconActivePin = () => (
  <svg viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.22361 3.44721C5.393 3.36252 5.5 3.18939 5.5 3C5.5 2.81061 5.393 2.63748 5.22361 2.55279L1.22361 0.552786C1.06861 0.475289 0.884543 0.483571 0.737134 0.574675C0.589726 0.665778 0.5 0.826711 0.5 1V5C0.5 5.17329 0.589726 5.33422 0.737134 5.42533C0.884543 5.51643 1.06861 5.52471 1.22361 5.44721L5.22361 3.44721Z"
      stroke={colors.blue[100]}
      strokeLinejoin="round"
    />
  </svg>
);

export const SidebarLink = ({
  text,
  href,
  icon,
  beta,
  withLabel = true,
  ...props
}: Props): React.Node => {
  const intl = useIntl();
  const active =
    window.location.href.includes(href) ||
    window.location.href.includes(href.slice(0, -4)) ||
    (window.location.href.includes('/admin/capco/app/reporting') && href === '/admin/reporting') ||
    (window.location.href.includes('/admin/alpha/project/') &&
      href === '/admin/capco/app/project/list') ||
    (window.location.href.includes('/admin/capco/app/sitecolor/') &&
      href === '/admin/settings/settings.appearance/list');

  return (
    <Link
      p={1}
      href={getBaseUrlWithAdminNextSupport() + href}
      fontSize={13}
      width="120%"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent={withLabel ? 'space-between' : 'center'}
      css={{
        textDecoration: 'none',
        color: active ? colors.blue[100] : colors.gray[300],
        '&:hover': { textDecoration: 'none', color: colors.blue[100] },
        '&:focus': { textDecoration: 'none', color: colors.blue[100] },
        outline: 'none !important',
        boxShadow: 'none !important',
      }}
      {...props}>
      <AppBox position="relative">
        {active && !icon && (
          <AppBox position="absolute" width="6px" left="-10px" top="1px">
            <IconActivePin />
          </AppBox>
        )}
        {icon && <Icon name={icon} size="md" mr={withLabel ? 1 : 0} verticalAlign="middle" />}
        {withLabel && (
          <Text as="span" verticalAlign="middle" lineHeight="normal">
            {intl.formatMessage({ id: text })}
          </Text>
        )}
      </AppBox>

      {beta && withLabel && (
        <Tag variant="aqua" interactive={false} capitalize>
          {intl.formatMessage({ id: 'global.beta' })}
        </Tag>
      )}
    </Link>
  );
};

export default SidebarLink;
