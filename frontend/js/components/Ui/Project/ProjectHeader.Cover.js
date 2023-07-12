// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import css from '@styled-system/css';
import { Flex, Modal, Heading, Icon, Text, Box, AvatarGroup, Tooltip } from '@cap-collectif/ui';
import { cleanChildren } from '~/utils/cleanChildren';
import { formatBigNumber } from '~/utils/bigNumberFormatter';
import DefaultProjectImage from '~/components/Project/Preview/DefaultProjectImage';
import useIsMobile from '~/utils/hooks/useIsMobile';
import Play from './SVG/Play';
import { type Props as AvatarGroupProps } from '~ds/AvatarGroup/AvatarGroup';
import { type AppBoxProps } from '~ui/Primitives/AppBox.type';
import Image from '~ui/Primitives/Image';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

const DefaultCoverImage = ({ isArchived }: { isArchived: boolean }) => {
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
      backgroundColor={backgroundColor}
      sx={{
        filter: isArchived ? 'grayscale(1)' : null,
        opacity: isArchived ? '50%' : null,
      }}>
      <DefaultProjectImage />
    </Flex>
  );
};
type CoverProps = {|
  children: React.Node,
  isArchived: boolean,
|};
export const Cover = ({ children, isArchived, ...rest }: CoverProps) => {
  const validChildren = cleanChildren(children);
  // eslint-disable-next-line no-use-before-define
  const hasCoverImage = validChildren.some(child => child.type === CoverImage);
  // eslint-disable-next-line no-use-before-define
  const hasCoverVideo = validChildren.some(child => child.type === CoverVideo);
  if (!hasCoverImage && !hasCoverVideo) {
    validChildren.splice(
      0,
      1,
      ...[
        React.cloneElement(validChildren[0], { width: '100%' }),
        <DefaultCoverImage isArchived={isArchived} />,
      ],
    );
  }
  return (
    <Box
      className="projectHeader__cover"
      position="relative"
      display="flex"
      flexDirection={['column-reverse', 'row']}
      flexWrap="nowrap"
      width="100%"
      justifyContent="center"
      {...rest}>
      {hasCoverImage || hasCoverVideo ? children : validChildren}
    </Box>
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
      mb={0}
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
  children: React.Node,
|};
export const Content = ({ children, ...rest }: ContentProps) => (
  <Box
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
  </Box>
);
type CoverImageProps = {|
  src: string,
  alt: string,
  isArchived: boolean,
|};
export const CoverImage = ({ src, alt, isArchived, ...rest }: CoverImageProps) => (
  <Box
    className="projectHeader__coverImage"
    width={['100%', '405px']}
    borderRadius={[0, 'accordion']}
    overflow="hidden"
    minHeight="270px"
    maxHeight="315px"
    sx={{
      filter: isArchived ? 'grayscale(1)' : null,
      opacity: isArchived ? '50%' : null,
    }}
    {...rest}>
    <Image
      src={src}
      alt={alt}
      width={['100%', '405px']}
      height="100%"
      minHeight="270px"
      loading="eager"
      style={{ objectFit: 'cover' }}
      sizes="(max-width: 320px) 320px,
        (max-width: 640px) 640px,
        (max-width: 960px) 960px,
        (max-width: 1280px) 960px,
        (max-width: 2560px) 960px,"
    />
  </Box>
);
type CoverVideoProps = {|
  src?: string,
  alt?: string,
  +url: string,
  +isArchived: boolean,
|};
export const CoverVideo = ({ url, src, alt, isArchived, ...rest }: CoverVideoProps) => {
  const isMobile = useIsMobile();
  const intl = useIntl();
  const renderButton = () => {
    if (src) {
      return (
        <Box minHeight="270px" maxHeight="315px" width="100%" height="100%" position="relative">
          <Image
            src={src}
            alt={alt}
            width={['100%', '405px']}
            height="100%"
            minHeight="270px"
            style={{ objectFit: 'cover' }}
          />
          <Play />
        </Box>
      );
    }
    return (
      <Box minHeight="270px" maxHeight="315px" width="100%" height="100%" position="relative">
        <DefaultCoverImage isArchived={isArchived} />
        <Play />
      </Box>
    );
  };
  return (
    <Box
      className="projectHeader__coverVideo"
      position="relative"
      width={['100%', '405px']}
      borderRadius={[0, 'accordion']}
      overflow="hidden"
      minHeight="270px"
      maxHeight="315px"
      height="100%"
      {...rest}>
      <Modal
        baseId="project-header-cover-modal"
        ariaLabel={intl.formatMessage({ id: 'project-header-video-modal' })}
        fullSizeOnMobile
        height={isMobile ? '64%' : '60%'}
        width={isMobile ? '90%' : '60%'}
        disclosure={renderButton()}>
        <iframe
          title="Video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          src={url}
          width="100%"
          height="100%"
        />
      </Modal>
    </Box>
  );
};
type AuthorsProps = {|
  ...AvatarGroupProps,
  active: boolean,
  children: React.Node,
  authors: $ReadOnlyArray<{|
    +id: string,
    +username: ?string,
    +url: string,
    +avatarUrl: ?string,
    +__typename?: string,
  |}> | null,
|};

export const Authors = ({ children, active, onClick, authors, ...rest }: AuthorsProps) => {
  const isMobile = useIsMobile();
  const hoverColor = useSelector(state => state.default.parameters['color.link.hover']);
  const intl = useIntl();
  const profilesToggle = useFeatureFlag('profiles');

  const firstAuthor = authors?.[0];
  const showProfileLink = profilesToggle || firstAuthor?.__typename === 'Organization';

  if (!authors) return null;

  const getTextValue = (): string => {
    const remainingAuthorsLength = authors.length - 1;
    const firstAuthorUsername = firstAuthor?.username ?? '';
    if (remainingAuthorsLength === 0) {
      return firstAuthorUsername;
    }
    if (remainingAuthorsLength === 1) {
      const secondAuthorUsername = authors[1].username ?? '';
      return intl.formatMessage(
        { id: 'avatar-group-shownames-2' },
        { first: firstAuthorUsername, second: secondAuthorUsername },
      );
    }
    return intl.formatMessage(
      { id: 'avatar-group-shownames' },
      { name: firstAuthorUsername, length: remainingAuthorsLength },
    );
  };

  return (
    <Flex alignItems="center" zIndex={2} flexWrap="wrap" width="85%">
      <AvatarGroup
        id="project-header"
        className="projectHeader__authors platform__body"
        minHeight={isMobile ? 13 : 9}
        marginTop={[-8, 0]}
        flexWrap="nowrap"
        size={isMobile ? 'xl' : 'lg'}
        max={3}
        sx={
          active &&
          css({
            '& > p:hover': {
              color: hoverColor,
              textDecoration: 'underline',
            },
          })
        }
        onClick={onClick}
        {...rest}>
        {children}
      </AvatarGroup>
      <Text
        id="authors-credit"
        className="platform__body"
        fontWeight={400}
        lineHeight="24px"
        onClick={onClick}
        color="neutral-gray.900"
        paddingLeft={[0, 2]}
        fontSize="14px"
        sx={{
          '&:hover': {
            textDecoration: showProfileLink ? 'underline' : 'none',
            cursor: showProfileLink ? 'pointer' : 'default',
          },
        }}>
        {getTextValue()}
      </Text>
    </Flex>
  );
};
type BlocksProps = {|
  children: React.Node,
|};
export const Blocks = ({ children, ...rest }: BlocksProps) => {
  const haschildren = cleanChildren(children).length > 0;
  if (haschildren) {
    return (
      <Box
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
        p={0}
        as="ul"
        {...rest}>
        {children}
      </Box>
    );
  }
  return null;
};
type BlockProps = {|
  title: string,
  content: ?string | ?number,
  contentId?: ?string,
  tooltipLabel?: React.Node,
|};
export const Block = ({ title, content, contentId, tooltipLabel, ...rest }: BlockProps) => {
  if (tooltipLabel) {
    return (
      <Tooltip label={tooltipLabel} delay={[200, 500]} zIndex={10}>
        <Box
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
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
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
    </Box>
  );
};

type InfoProps = {|
  children: React.Node,
|};
export const Info = ({ children, ...rest }: InfoProps) => {
  const haschildren = cleanChildren(children).length > 0;
  if (haschildren) {
    return (
      <Box
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
        p={0}
        {...rest}>
        {children}
      </Box>
    );
  }
  return null;
};
type LocationProps = {|
  content: ?string,
|};
const Location = ({ content, ...rest }: LocationProps) => (
  <Box
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
  </Box>
);
Info.Location = Location;

type ThemeProps = {|
  content: string,
  href: string,
  eventView?: boolean,
|};
const Theme = ({ content, href, eventView, ...rest }: ThemeProps) => (
  <Box
    className="projectHeader__info__theme"
    display="flex"
    flexDirection="row"
    justifyContent="flex-start"
    alignItems="center"
    paddingRight={eventView ? 7 : 2}
    marginBottom={0}
    as="a"
    href={href}
    {...rest}>
    <Icon
      color="neutral-gray.500"
      size="md"
      name="FOLDER_O"
      marginLeft={eventView ? undefined : '-3px'}
    />
    <Text
      className="platform__body"
      fontSize={eventView ? undefined : [1, 2]}
      lineHeight="sm"
      fontWeight="normal"
      color="gray.900"
      truncate={35}>
      {content}
    </Text>
  </Box>
);
Info.Theme = Theme;

type SocialsProps = {|
  ...AppBoxProps,
  children: React.Node,
|};

export const Socials = ({ children, ...rest }: SocialsProps) => (
  <Box
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
    marginTop={[3, 6]}
    zIndex={2}
    {...rest}>
    {children}
  </Box>
);

type SocialProps = {|
  name: string,
  onClick: () => void,
  ariaLabel?: string,
|};

export const Social = ({ onClick, ariaLabel, name, ...rest }: SocialProps) => (
  <Box
    as="button"
    className="projectHeader__social"
    mr={[4, 6]}
    p={0}
    bg="transparent"
    border="none"
    color="neutral-gray.500"
    width={6}
    aria-label={ariaLabel}
    sx={{
      boxShadow: 'none !important',
      cursor: 'pointer',
      '&:hover': {
        color: 'neutral-gray.700',
      },
      '&:focus': {
        color: 'neutral-gray.700',
        outline: 'none',
      },
    }}
    onClick={onClick}
    {...rest}>
    <Icon name={name} size="md" />
  </Box>
);
