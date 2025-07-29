import React from 'react'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import type { SocialNetwork } from './Footer'
import { Icon, CapUIIcon, Flex, Link, Text, CapUIFontWeight, Heading } from '@cap-collectif/ui'
import { pxToRem } from '~/utils/styles/mixins'

type Props = {
  textTitle: string
  textBody: string
  socialNetworks?: Array<SocialNetwork>
  titleColor: string
  textColor: string
  backgroundColor: string
}

const FooterAbout = ({ textBody, textTitle, socialNetworks, titleColor, textColor, backgroundColor }: Props) => {
  const getIconName = (item: string): string => {
    return item === 'link-1' ? 'HYPERLINK' : item ? item.toUpperCase() : null
  }

  return (
    <Flex
      backgroundColor={backgroundColor}
      direction={'column'}
      color={textColor}
      p={[pxToRem(15), pxToRem(30), `${pxToRem(20)} ${pxToRem(40)}`]}
      m={0}
      width={'100%'}
      gap={8}
    >
      <Flex direction={'column'} gap={4} maxWidth={pxToRem(960)} margin="auto">
        {textTitle ? (
          <Heading
            as="h2"
            color={titleColor}
            fontSize={pxToRem(12)}
            margin={'0 auto'}
            px={4}
            lineHeight={'unset'}
            textAlign={'center'}
          >
            {textTitle}
          </Heading>
        ) : null}
        <Flex
          justifyContent={'center'}
          maxWidth={'100vw'}
          sx={{
            a: {
              fontWeight: CapUIFontWeight.Bold,
              cursor: 'pointer',
              color: 'inherit',
            },
          }}
        >
          <WYSIWYGRender value={textBody} />
        </Flex>
      </Flex>

      {socialNetworks?.length ? (
        <Flex
          as="ul"
          gap={6}
          justifyContent={'center'}
          alignSelf={'center'}
          ml={'auto'}
          mr={'auto'}
          px={4}
          flexWrap={'wrap'}
          maxWidth={'100%'}
          id="footer-social-networks"
        >
          {socialNetworks.map(socialNetwork => (
            <Flex as="li" key={socialNetwork.title} width={'fit-content'} sx={{ listStyle: 'none' }}>
              <Link
                href={socialNetwork.link}
                className="external-link"
                display={'flex'}
                gap={1}
                color="inherit"
                sx={{
                  '&:hover, &:active, &:focus': {
                    color: 'inherit',
                  },
                }}
              >
                <Icon name={getIconName(socialNetwork.style) as CapUIIcon} />
                <Text>{socialNetwork.title}</Text>
              </Link>
            </Flex>
          ))}
        </Flex>
      ) : null}
    </Flex>
  )
}

export default FooterAbout
