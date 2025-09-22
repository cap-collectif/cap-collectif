import {
  Box,
  ButtonQuickAction,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  Heading,
  Text,
  useTheme,
} from '@cap-collectif/ui'
import React, { FC, useRef } from 'react'
import Slider from 'react-slick'
import { pxToRem } from '@shared/utils/pxToRem'
import { useIntl } from 'react-intl'
import Image from '@shared/ui/Image'
import { Item } from './CarrouselItem'
import { CarrouselElementType } from '@relay/CarrouselQuery.graphql'
import { DefaultEventCover, DefaultPostCover, DefaultProjectCover, DefaultThemeCover } from './DefaultCovers'
import moment from 'moment'

export const SECTION_TITLE_MAX_LENGTH = 20
const ITEM_TITLE_MAX_LENGTH = 45
type ItemDate = { startAt: string; endAt?: string | null }

export const getPlaceholder = (type: CarrouselElementType) => {
  switch (type) {
    case 'EVENT':
      return <DefaultEventCover />
    case 'PROJECT':
      return <DefaultProjectCover />
    case 'THEME':
      return <DefaultThemeCover />
    case 'ARTICLE':
    default:
      return <DefaultPostCover />
  }
}

export const getCardLabel = (type: CarrouselElementType) => {
  switch (type) {
    case 'EVENT':
      return 'type-event'
    case 'PROJECT':
      return 'global.project'
    case 'THEME':
      return 'global.theme'
    case 'ARTICLE':
      return 'global.post'
    case 'CUSTOM':
    default:
      return 'customized'
  }
}

export const DateItem: FC<{ dateRange: ItemDate; short?: boolean }> = ({ dateRange, short = false }) => {
  const intl = useIntl()
  if (!dateRange || (!dateRange.startAt && !dateRange.endAt)) return null
  const isSameDay = dateRange?.endAt && moment(dateRange?.startAt).isSame(moment(dateRange?.endAt), 'day')

  return (
    <div>
      {dateRange?.endAt && !isSameDay
        ? intl.formatMessage(
            {
              id: short ? 'fromDayToDayShort' : 'fromDayToDay',
            },
            {
              day: intl.formatDate(dateRange.startAt, {
                day: 'numeric',
                month: 'numeric',
              }),
              anotherDay: intl.formatDate(dateRange.endAt, {
                day: 'numeric',
                month: 'numeric',
              }),
            },
          )
        : intl.formatDate(dateRange.startAt, {
            day: 'numeric',
            month: 'numeric',
          })}
    </div>
  )
}

const WhatsNewMobile: FC<{ items: Item[]; title: string }> = ({ items, title }) => {
  const intl = useIntl()
  const { colors } = useTheme()

  let sliderRef = useRef<null | { slickNext: () => void; slickPrev: () => void }>(null)
  const next = () => {
    sliderRef.current.slickNext()
  }
  const prev = () => {
    sliderRef.current.slickPrev()
  }

  return (
    <Box
      width="100%"
      overflow="hidden"
      position="relative"
      margin="auto"
      py={4}
      aria-roledescription={intl.formatMessage({ id: 'global.carrousel' })}
      aria-label={intl.formatMessage({ id: 'menu.news' })}
      sx={{
        '.slick-slide': {
          px: 4,
        },
      }}
    >
      <Heading as="h3" mb={4} px={4}>
        {title?.slice(0, SECTION_TITLE_MAX_LENGTH)}
      </Heading>
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
            {item.image ? (
              <Image
                src={item.image.url}
                alt=""
                loading="eager"
                height={pxToRem(180)}
                width="100%"
                style={{
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Flex
                alignItems="center"
                justifyContent="center"
                height={pxToRem(180)}
                width="100%"
                borderRadius="accordion"
                bg={colors.primary[600]}
              >
                {getPlaceholder(item.type)}
              </Flex>
            )}
            <Box p={4}>
              {item.type ? (
                <Flex alignItems="center" justifyContent="space-between">
                  <Text as="div" fontSize={CapUIFontSize.Headline} mb={1}>
                    {intl.formatMessage({ id: getCardLabel(item.type) })}
                  </Text>
                  <DateItem dateRange={{ startAt: item.startAt, endAt: item.endAt }} short />
                </Flex>
              ) : null}
              <Text fontSize={CapUIFontSize.Headline} fontWeight={600} truncate={ITEM_TITLE_MAX_LENGTH}>
                {item.title}
              </Text>
            </Box>
          </Box>
        ))}
      </Slider>
      {items.length > 1 ? (
        <Flex zIndex={1} gap={4} justifyContent="center" mt={4}>
          <ButtonQuickAction
            icon={CapUIIcon.ArrowLeft}
            label={intl.formatMessage({ id: 'carrousel.prev_slide' })}
            onClick={prev}
            variantColor="hierarchy"
            size={CapUIIconSize.Md}
          />
          <ButtonQuickAction
            icon={CapUIIcon.ArrowRight}
            label={intl.formatMessage({ id: 'carrousel.next_slide' })}
            onClick={next}
            variantColor="hierarchy"
            size={CapUIIconSize.Md}
          />
        </Flex>
      ) : null}
    </Box>
  )
}

export default WhatsNewMobile
