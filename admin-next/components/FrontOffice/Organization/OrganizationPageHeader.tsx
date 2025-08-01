import * as React from 'react'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { Flex, Box, CapUIIcon, Heading, Text, Icon, CapUIIconSize, CapUIFontSize } from '@cap-collectif/ui'
import Image from '@shared/ui/Image'
import { pxToRem } from '@shared/utils/pxToRem'
import { useIntl } from 'react-intl'
import { pageOrganizationMetadataQuery$data } from '@relay/pageOrganizationMetadataQuery.graphql'

const SocialIconLink = ({ icon, href, socialNetwork }: { icon: CapUIIcon; href: string; socialNetwork: string }) => (
  <a href={href}>
    <span className="sr-only">{socialNetwork}</span>
    <Icon name={icon} size={CapUIIconSize.Md} color="neutral-gray.600" />
  </a>
)

export const OrganizationPageHeader: React.FC<{
  organization: pageOrganizationMetadataQuery$data['organization']
}> = ({ organization }) => {
  const intl = useIntl()
  const { socialNetworks, title, body } = organization
  const cover = organization.banner?.url
  const logo = organization.media?.url

  return (
    <Flex as="section" id="organizationHeader" bg="white">
      <Flex
        maxWidth={pxToRem(1280)}
        width="100%"
        margin="auto"
        justify="space-between"
        bg="white"
        py={[0, 8]}
        px={[4, 6]}
        direction={['column-reverse', 'row']}
      >
        <Flex direction="column" maxWidth={pxToRem(550)} py={[4, 0]}>
          <Heading as="h1" mb={6} fontSize={CapUIFontSize.DisplayMedium} lineHeight={pxToRem(44)}>
            {title}
          </Heading>
          <Text as="div" fontSize={CapUIFontSize.BodyLarge}>
            <WYSIWYGRender value={body} />
          </Text>
          {socialNetworks ? (
            <Flex
              flexDirection="row"
              maxHeight={6}
              width="100%"
              flexBasis="100%"
              alignItems="center"
              marginTop={[9, 6]}
            >
              {socialNetworks.facebookUrl ? (
                <SocialIconLink href={socialNetworks.facebookUrl} icon={CapUIIcon.Facebook} socialNetwork="Facebook" />
              ) : null}
              {socialNetworks.twitterUrl ? (
                <SocialIconLink href={socialNetworks.twitterUrl} icon={CapUIIcon.X} socialNetwork="X" />
              ) : null}
              {socialNetworks.webPageUrl ? (
                <SocialIconLink
                  href={socialNetworks.webPageUrl}
                  icon={CapUIIcon.Link}
                  socialNetwork={intl.formatMessage({ id: 'user_websiteUrl' })}
                />
              ) : null}
            </Flex>
          ) : null}
        </Flex>
        {cover || logo ? (
          <Box
            borderRadius="accordion"
            position="relative"
            overflow="hidden"
            css={{
              filter: 'drop-shadow(0px 10px 50px rgba(0, 0, 0, 0.15))',
            }}
          >
            <Image
              src={cover || logo}
              alt="banner"
              width={['100%', pxToRem(405)]}
              borderRadius={[0, 'accordion']}
              overflow="hidden"
              minHeight={['unset', pxToRem(270)]}
              css={{
                objectFit: !cover ? 'contain' : 'cover',
              }}
              maxHeight={pxToRem(315)}
              loading="eager"
              sizes="(max-width: 320px) 320px,
        (max-width: 640px) 640px,
        (max-width: 960px) 960px,
        (max-width: 1280px) 960px,
        (max-width: 2560px) 960px,"
            />
            {cover && logo ? (
              <Box
                bg="white"
                p={2}
                width={pxToRem(120)}
                height={pxToRem(80)}
                position="absolute"
                top={0}
                right={0}
                css={{
                  borderBottomLeftRadius: 8,
                }}
              >
                <Image
                  src={logo}
                  alt="logo"
                  width={pxToRem(104)}
                  height={pxToRem(64)}
                  css={{
                    objectFit: 'contain',
                  }}
                  loading="eager"
                  sizes="(max-width: 320px) 320px,
        (max-width: 640px) 320px,
        (max-width: 960px) 320px,
        (max-width: 1280px) 320px,
        (max-width: 2560px) 320px,"
                />
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Flex>
    </Flex>
  )
}
export default OrganizationPageHeader
