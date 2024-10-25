import { FC } from 'react'
import { Mode } from './CarrouselButton'
import { Box, BoxProps, Flex, Heading } from '@cap-collectif/ui'
import useIsMobile from '@shared/hooks/useIsMobile'
import { useIntl } from 'react-intl'
import { pxToRem } from '@shared/utils/pxToRem'
import Image from '@shared/ui/Image'
import { CarrouselQuery$data } from '@relay/CarrouselQuery.graphql'

const TITLE_MAX_LENGTH = 50
const LABEL_MAX_LENGTH = 20
const DESCRIPTION_MAX_LENGTH = 165
export const SMALL_SCREEN_BAND_HEIGHT = 165
export const BIG_SCREEN_BAND_HEIGHT = 145
export const RATIO = '33.33vw'

export type Item = CarrouselQuery$data['carrouselConfiguration']['carrouselElements']['edges'][0]['node']

const CarrouselItem: FC<{ mode?: Mode; slide: Item } & BoxProps> = ({ slide, mode = 'below', ...rest }) => {
  const intl = useIntl()
  const isMobile = useIsMobile()
  const inside = mode === 'inside'
  return (
    <Box
      width="100vw"
      position="relative"
      role="group"
      aria-roledescription={intl.formatMessage({ id: 'carrousel.slide' })}
      {...rest}
    >
      <Box height={[mode === 'below' ? RATIO : pxToRem(286), RATIO]} overflow="hidden" bg="neutral-gray.100">
        <Image
          src={slide.image?.url}
          alt=""
          width="100%"
          height={isMobile && inside ? pxToRem(286) : RATIO}
          style={{ objectFit: 'cover' }}
          loading="eager"
        />
      </Box>

      <Box
        py={[4, 8]}
        bg={inside ? 'rgba(0, 0, 0, 0.65)' : null}
        position={inside ? 'absolute' : null}
        bottom={inside ? 0 : null}
        left={inside ? 0 : null}
        right={inside ? 0 : null}
        top={[inside ? 0 : null, 'unset']}
        height={[
          '',
          inside ? pxToRem(SMALL_SCREEN_BAND_HEIGHT) : null,
          inside ? pxToRem(BIG_SCREEN_BAND_HEIGHT) : null,
        ]}
      >
        <Flex
          maxWidth={pxToRem(1280)}
          px={[4, 6]}
          gap={[4, 8]}
          alignItems={['flex-start', 'center']}
          margin="auto"
          justifyContent={[mode === 'below' ? 'center' : 'space-between', 'space-between']}
          height={inside ? '100%' : null}
          flexDirection={['column', 'row']}
        >
          <Box>
            <Heading as="h3" mb={1} fontSize={[4, 5]} lineHeight="normal" color={inside ? 'white' : 'neutral-gray.900'}>
              {slide.title?.slice(0, TITLE_MAX_LENGTH)}
            </Heading>
            <Box as="p" color={inside ? 'white' : null}>
              {slide.description?.slice(0, DESCRIPTION_MAX_LENGTH)}
            </Box>
          </Box>
          <Flex
            tabIndex={rest['aria-hidden'] ? -1 : undefined}
            flex="none"
            as="a"
            justifyContent="center"
            href={slide.redirectLink}
            backgroundColor="primary.600"
            borderRadius="button"
            px={8}
            py={3}
            color="white !important"
          >
            {slide.buttonLabel?.slice(0, LABEL_MAX_LENGTH)}
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

export default CarrouselItem
