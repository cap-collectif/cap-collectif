// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import css from '@styled-system/css';
import AppBox from '~ui/Primitives/AppBox';
import { type AppBoxProps } from '~ui/Primitives/AppBox.type';
import AvatarGroup, { type Props as AvatarGroupProps } from '~ds/AvatarGroup/AvatarGroup';
import Text from '~ui/Primitives/Text';
import Icon, { type Props as IconProps } from '~ds/Icon/Icon';
import { cleanChildren } from '~/utils/cleanChildren';
import { formatBigNumber } from '~/utils/bigNumberFormatter';
import Link from '~ds/Link/Link';

type CoverProps = {|
  ...AppBoxProps,
  children: React.Node,
|};
export const Cover = ({ children, ...rest }: CoverProps) => {
  const validChildren = cleanChildren(children);
  // eslint-disable-next-line no-use-before-define
  const hasCoverImage = validChildren.some(child => child.type === CoverImage);
  return (
    <AppBox
      display="flex"
      flexDirection={['column-reverse', 'row']}
      flexWrap="nowrap"
      width="100%"
      justifyContent="center"
      {...rest}>
      {hasCoverImage
        ? children
        : React.cloneElement(validChildren[0], { width: ['100%', '100%'], marginTop: 5 })}
    </AppBox>
  );
};
type TitleProps = {|
  children: React.Node,
|};
export const Title = ({ children, ...rest }: TitleProps) => {
  return (
    <Text
      width="100%"
      as="h3"
      fontSize={[4, 6]}
      lineHeight="initial" // {['base', 'l']}
      fontWeight="semibold"
      color="neutral-gray.900"
      marginTop={2}
      truncate={50}
      {...rest}>
      {children}
    </Text>
  );
};
type ContentProps = {|
  ...AppBoxProps,
  children: React.Node,
|};
export const Content = ({ children, ...rest }: ContentProps) => (
  <AppBox
    position="relative"
    display="flex"
    flexDirection="column"
    paddingLeft={[4, 0]}
    paddingRight={[4, 0]}
    width={['100%', 'calc(100% - 400px)']}
    {...rest}>
    {children}
  </AppBox>
);
type CoverImageProps = {|
  ...AppBoxProps,
  src: string,
  alt: string,
|};
export const CoverImage = ({ src, alt, ...rest }: CoverImageProps) => (
  <AppBox width={['100%', '400px']} borderRadius="accordion" overflow="hidden" {...rest}>
    <img src={src} alt={alt} width="100%" height="100%" />
  </AppBox>
);
type AuthorsProps = {|
  ...AvatarGroupProps,
  children: React.Node,
|};
export const Authors = ({ children, ...rest }: AuthorsProps) => (
  <AvatarGroup marginTop={[-5, 0]} zIndex={0} flexWrap="wrap" size="md" max={3} showNames {...rest}>
    {children}
  </AvatarGroup>
);
type BlocksProps = {|
  ...AppBoxProps,
  children: React.Node,
|};
export const Blocks = ({ children, ...rest }: BlocksProps) => (
  <AppBox
    display="flex"
    flexDirection="row"
    flexWrap="wrap"
    width="100%"
    flexBasis="100%"
    alignItems="flex-end"
    marginTop={[4, 6]}
    height="48px"
    justifyContent="flex-start"
    as="ul"
    css={{ paddingInlineStart: '0px' }}
    {...rest}>
    {children}
  </AppBox>
);
type BlockProps = {|
  ...AppBoxProps,
  title: string,
  content: string | number,
|};
export const Block = ({ title, content, ...rest }: BlockProps) => (
  <AppBox
    display="flex"
    flexDirection="column"
    justifyContent="flex-start"
    marginRight={[6, 8]}
    marginBottom={[2, 0]}
    as="li"
    {...rest}>
    <Text as="h3" fontSize={[2, 4]} lineHeight="base" fontWeight="semibold" height={[4, 6]}>
      {typeof content === 'number' ? formatBigNumber(content) : content}
    </Text>
    <Text fontSize={[1, 4]} lineHeight="base" fontWeight="normal" height={[4, 6]}>
      {title}
    </Text>
  </AppBox>
);

type InfoProps = {|
  ...AppBoxProps,
  children: React.Node,
|};
export const Info = ({ children, ...rest }: InfoProps) => (
  <AppBox
    display="flex"
    flexDirection="row"
    flexWrap="wrap"
    width="100%"
    flexBasis="100%"
    alignItems="flex-end"
    marginTop={[0, 6]}
    marginBottom={0}
    height="24px"
    justifyContent="flex-start"
    as="ul"
    css={{ paddingInlineStart: '0px' }}
    {...rest}>
    {children}
  </AppBox>
);
type LocationProps = {|
  ...AppBoxProps,
  content: string,
|};
const Location = ({ content, ...rest }: LocationProps) => (
  <AppBox
    display="flex"
    flexDirection="row"
    justifyContent="flex-start"
    alignItems="center"
    paddingRight={2}
    marginBottom={0}
    as="li"
    {...rest}>
    <Icon color="neutral-gray.500" size="md" name="PIN_O" marginLeft="-5px" />
    <Text fontSize={[1, 2]} lineHeight="sm" fontWeight="normal" color="gray.900" truncate={35}>
      {content}
    </Text>
  </AppBox>
);
Info.Location = Location;

type ThemeProps = {|
  ...AppBoxProps,
  content: string,
|};
const Theme = ({ content, ...rest }: ThemeProps) => (
  <AppBox
    display="flex"
    flexDirection="row"
    justifyContent="flex-start"
    alignItems="center"
    paddingRight={2}
    marginBottom={0}
    as="li"
    {...rest}>
    <Icon color="neutral-gray.500" size="md" name="FOLDER_O" marginLeft="-3px" />
    <Text fontSize={[1, 2]} lineHeight="sm" fontWeight="normal" color="gray.900" truncate={35}>
      {content}
    </Text>
  </AppBox>
);
Info.Theme = Theme;

type SocialsProps = {|
  ...AppBoxProps,
  children: React.Node,
|};

export const Socials = ({ children, ...rest }: SocialsProps) => (
  <AppBox
    position={['absolute', 'relative']}
    right={[0]}
    top={[0]}
    justifyContent={['flex-end', 'flex-start']}
    display="flex"
    flexDirection="row"
    width="100%"
    flexBasis="100%"
    alignItems="center"
    marginTop={[3, 6]}
    zIndex={9}
    {...rest}>
    {children}
  </AppBox>
);
const SocialContainer: StyledComponent<{}, {}, any> = styled(Link)(
  css({
    color: 'neutral-gray.500',
    cursor: 'pointer',
    '&:hover': {
      color: 'neutral-gray.700',
    },
  }),
);
type SocialProps = {|
  href: string,
  name: string,
  ...IconProps,
|};
export const Social = ({ href, name, ...rest }: SocialProps) => (
  <SocialContainer href={href}>
    <Icon name={name} size="md" mr={[4, 6]} {...rest} />
  </SocialContainer>
);
