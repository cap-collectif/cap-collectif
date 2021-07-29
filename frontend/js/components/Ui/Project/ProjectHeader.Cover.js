// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { useSelector } from 'react-redux';
import css from '@styled-system/css';
import AppBox from '~ui/Primitives/AppBox';
import { type AppBoxProps } from '~ui/Primitives/AppBox.type';
import AvatarGroup, { type Props as AvatarGroupProps } from '~ds/AvatarGroup/AvatarGroup';
import Text from '~ui/Primitives/Text';
import Icon, { type Props as IconProps } from '~ds/Icon/Icon';
import { cleanChildren } from '~/utils/cleanChildren';
import { formatBigNumber } from '~/utils/bigNumberFormatter';
import Link from '~ds/Link/Link';
import DefaultProjectImage from '~/components/Project/Preview/DefaultProjectImage';
import Tooltip from '~ds/Tooltip/Tooltip';
import useIsMobile from '~/utils/hooks/useIsMobile';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';

const DefaultCoverImage = () => {
  const backgroundColor = useSelector(state => state.default.parameters['color.btn.primary.bg']);
  return (
    <Flex
      className="projectHeader__coverImage"
      borderRadius={[0, 'accordion']}
      alignItems="center"
      justifyContent="center"
      width={['100%', '405px']}
      overflow="hidden"
      minHeight="270px"
      maxHeight="315px"
      backgroundColor={backgroundColor}>
      <DefaultProjectImage />
    </Flex>
  );
};
type CoverProps = {|
  ...AppBoxProps,
  children: React.Node,
|};
export const Cover = ({ children, ...rest }: CoverProps) => {
  const validChildren = cleanChildren(children);
  // eslint-disable-next-line no-use-before-define
  const hasCoverImage = validChildren.some(child => child.type === CoverImage);
  if (!hasCoverImage) {
    validChildren.splice(
      0,
      1,
      ...[React.cloneElement(validChildren[0], { width: '100%' }), <DefaultCoverImage />],
    );
  }
  return (
    <AppBox
      className="projectHeader__cover"
      position="relative"
      display="flex"
      flexDirection={['column-reverse', 'row']}
      flexWrap="nowrap"
      width="100%"
      justifyContent="center"
      {...rest}>
      {hasCoverImage ? children : validChildren}
    </AppBox>
  );
};
type TitleProps = {|
  children: React.Node,
|};
export const Title = ({ children, ...rest }: TitleProps) => {
  return (
    <Text
      className="projectHeader__title platform__title"
      width="100%"
      as="h3"
      fontSize={[4, 6]}
      lineHeight="initial" // {['base', 'l']}
      fontWeight="semibold"
      color="neutral-gray.900"
      marginTop={2}
      truncate={130}
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
    className="projectHeader__cover__content"
    position="relative"
    display="flex"
    flexDirection="column"
    minHeight={['auto', '270px']}
    justifyContent="flex-start"
    alignItems="flex-start"
    paddingLeft={[4, 0]}
    paddingRight={[4, 6]}
    width={['100%', 'calc(100% - 405px)']}
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
  <AppBox
    className="projectHeader__coverImage"
    width={['100%', '405px']}
    borderRadius={[0, 'accordion']}
    overflow="hidden"
    minHeight="270px"
    maxHeight="315px"
    {...rest}>
    <AppBox
      as="img"
      src={src}
      alt={alt}
      width={['100%', '405px']}
      height="100%"
      minHeight="270px"
      style={{ objectFit: 'cover' }}
    />
  </AppBox>
);
type AuthorsProps = {|
  ...AvatarGroupProps,
  active: boolean,
  children: React.Node,
|};
export const Authors = ({ children, active, ...rest }: AuthorsProps) => {
  const isMobile = useIsMobile();
  const hoverColor = useSelector(state => state.default.parameters['color.link.hover']);
  return (
    <AvatarGroup
      id="project-header"
      className="projectHeader__authors platform__body"
      minHeight={isMobile ? 13 : 9}
      marginTop={[-8, 0]}
      zIndex={0}
      flexWrap="wrap"
      size={isMobile ? 'xl' : 'lg'}
      max={3}
      css={
        active &&
        css({
          '& > p:hover': {
            color: hoverColor,
            textDecoration: 'underline',
          },
        })
      }
      showNames
      {...rest}>
      {children}
    </AvatarGroup>
  );
};
type BlocksProps = {|
  ...AppBoxProps,
  children: React.Node,
|};
export const Blocks = ({ children, ...rest }: BlocksProps) => {
  const haschildren = cleanChildren(children).length > 0;
  if (haschildren) {
    return (
      <AppBox
        className="projectHeader__blocks"
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        width="100%"
        flexBasis="100%"
        alignItems="flex-end"
        marginTop={[4, 6]}
        height={10}
        maxHeight={10}
        justifyContent="flex-start"
        as="ul"
        css={{ paddingInlineStart: '0px' }}
        {...rest}>
        {children}
      </AppBox>
    );
  }
  return null;
};
type BlockProps = {|
  ...AppBoxProps,
  title: string,
  content: ?string | ?number,
  contentId?: ?string,
  tooltipLabel?: React.Node,
|};
export const Block = ({ title, content, contentId, tooltipLabel, ...rest }: BlockProps) => (
  <Tooltip label={tooltipLabel} delay={[200, 500]}>
    <AppBox
      className="projectHeader__block"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      marginRight={[6, 8]}
      marginBottom={[2, 0]}
      maxHeight={10}
      as="li"
      {...rest}>
      <Heading
        className="projectHeader__block__content platform__body"
        id={contentId || ''}
        fontSize={[2, 4]}
        lineHeight="base"
        fontWeight="semibold"
        height={[4, 6]}
        color="neutral-gray.900">
        {typeof content === 'number' ? formatBigNumber(content) : content}
      </Heading>
      <Text
        className="projectHeader__block__title platform__body"
        color="neutral-gray.900"
        fontSize={[1, 4]}
        lineHeight="base"
        fontWeight="normal"
        height={[4, 6]}>
        {title.charAt(0).toUpperCase() + title.slice(1)}
      </Text>
    </AppBox>
  </Tooltip>
);

type InfoProps = {|
  ...AppBoxProps,
  children: React.Node,
|};
export const Info = ({ children, ...rest }: InfoProps) => {
  const haschildren = cleanChildren(children).length > 0;
  if (haschildren) {
    return (
      <AppBox
        className="projectHeader__info"
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        width="100%"
        flexBasis="100%"
        alignItems="flex-end"
        marginTop={[0, 6]}
        marginBottom={0}
        maxHeight="24px"
        justifyContent="flex-start"
        as="ul"
        css={{ paddingInlineStart: '0px' }}
        {...rest}>
        {children}
      </AppBox>
    );
  }
  return null;
};
type LocationProps = {|
  ...AppBoxProps,
  content: ?string,
|};
const Location = ({ content, ...rest }: LocationProps) => (
  <AppBox
    className="projectHeader__info__location"
    display="flex"
    flexDirection="row"
    justifyContent="flex-start"
    alignItems="center"
    paddingRight={2}
    marginBottom={0}
    as="li"
    {...rest}>
    <Icon color="neutral-gray.500" size="md" name="PIN_O" marginLeft="-5px" />
    <Text
      className="platform__body"
      fontSize={[1, 2]}
      lineHeight="sm"
      fontWeight="normal"
      color="gray.900"
      truncate={35}>
      {content}
    </Text>
  </AppBox>
);
Info.Location = Location;

type ThemeProps = {|
  ...AppBoxProps,
  content: string,
  href: string,
|};
const Theme = ({ content, href, ...rest }: ThemeProps) => (
  <AppBox
    className="projectHeader__info__theme"
    display="flex"
    flexDirection="row"
    justifyContent="flex-start"
    alignItems="center"
    paddingRight={2}
    marginBottom={0}
    as="a"
    href={href}
    {...rest}>
    <Icon color="neutral-gray.500" size="md" name="FOLDER_O" marginLeft="-3px" />
    <Text
      className="platform__body"
      fontSize={[1, 2]}
      lineHeight="sm"
      fontWeight="normal"
      color="gray.900"
      truncate={35}>
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
    className="projectHeader__socials"
    position={['absolute', 'relative']}
    right={[0]}
    top={[0]}
    justifyContent={['flex-end', 'flex-start']}
    display="flex"
    flexDirection="row"
    maxHeight="24px"
    width="100%"
    flexBasis="100%"
    alignItems="center"
    marginTop={[9, 6]}
    zIndex={9}
    {...rest}>
    {children}
  </AppBox>
);
const SocialContainer: StyledComponent<{}, {}, any> = styled(Link)(
  css({
    color: 'neutral-gray.500',
    boxShadow: 'none !important',
    width: 6,
    cursor: 'pointer',
    '&:hover': {
      color: 'neutral-gray.700',
    },
    '&:focus': {
      color: 'neutral-gray.700',
      outline: 'none',
    },
  }),
);
type SocialProps = {|
  href: string,
  name: string,
  ...IconProps,
|};
export const Social = ({ href, name, ...rest }: SocialProps) => (
  <SocialContainer className="projectHeader__social" mr={[4, 6]} href={href}>
    <Icon name={name} size="md" {...rest} />
  </SocialContainer>
);
