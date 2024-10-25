import { Box, CapUIIcon, Flex, Text } from '@cap-collectif/ui'
import React, { FC, useRef } from 'react'
import Slider from 'react-slick'
import { pxToRem } from '@shared/utils/pxToRem'
import CarrouselButton from './CarrouselButton'
import { useIntl } from 'react-intl'
import Image from '@shared/ui/Image'
import { Item } from './CarrouselItem'

export const SECTION_TITLE_MAX_LENGTH = 11
const ITEM_TITLE_MAX_LENGTH = 45

const WhatsNewMobile: FC<{ items: Item[] }> = ({ items }) => {
  const intl = useIntl()
  let sliderRef = useRef<null | { slickNext: () => void; slickPrev: () => void }>(null)
  const next = () => {
    sliderRef.current.slickNext()
  }
  const prev = () => {
    sliderRef.current.slickPrev()
  }

  return (
    <Box
      as="section"
      id="whats-new"
      width="100%"
      overflow="hidden"
      position="relative"
      margin="auto"
      pb={4}
      aria-roledescription={intl.formatMessage({ id: 'global.carrousel' })}
      aria-label={intl.formatMessage({ id: 'menu.news' })}
      sx={{
        '.slick-slide': {
          px: 4,
        },
      }}
    >
      {/* <Heading as="h3" mb={4} px={4}>
        {'À la une'.slice(0, SECTION_TITLE_MAX_LENGTH)}
      </Heading> */}
      <Slider
        ref={slider => {
          sliderRef.current = slider
        }}
        {...{
          infinite: true,
          slidesToScroll: 1,
          slidesToShow: 1,
        }}
      >
        {items.map((item, index) => (
          <Box
            as="a"
            height="100%"
            href={item.redirectLink}
            key={index}
            borderRadius="accordion"
            overflow="hidden"
            bg="neutral-gray.150"
          >
            <Image src={item.image.url} alt="" loading="eager" height={pxToRem(180)} width="100%" />
            <Box p={4}>
              {item.type ? (
                <Text as="div" fontSize={4} mb={1}>
                  {item.type}
                </Text>
              ) : null}
              <Text fontSize={4} fontWeight={600} truncate={ITEM_TITLE_MAX_LENGTH}>
                {item.title}
              </Text>
            </Box>
          </Box>
        ))}
      </Slider>
      {items.length > 1 ? (
        <Flex zIndex={1} gap={4} justifyContent="center" mt={4}>
          <CarrouselButton
            variantColor="neutral-gray"
            icon={CapUIIcon.ArrowLeft}
            label={intl.formatMessage({ id: 'carrousel.prev_slide' })}
            onClick={prev}
          />
          <CarrouselButton
            variantColor="neutral-gray"
            icon={CapUIIcon.ArrowRight}
            label={intl.formatMessage({ id: 'carrousel.next_slide' })}
            onClick={next}
          />
        </Flex>
      ) : null}
    </Box>
  )
}

export default WhatsNewMobile
