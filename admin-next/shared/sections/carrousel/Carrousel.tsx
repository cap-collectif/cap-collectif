import { Box, BoxProps, ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex } from '@cap-collectif/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FC } from 'react'
import { pxToRem } from '@shared/utils/pxToRem'
import { useIntl } from 'react-intl'
import CarrouselItem, { BIG_SCREEN_BAND_HEIGHT, Item, RATIO, SMALL_SCREEN_BAND_HEIGHT } from './CarrouselItem'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { CarrouselQuery } from '@relay/CarrouselQuery.graphql'
import WhatsNew from './WhatsNew'

export type Mode = 'inside' | 'below'

const duration = 3500

// No pause button yet, so no auto animation
// Set this to true to enable auto animation if needed
const AUTO_ANIMATE = false

const CarrouselFullView: FC<{ mode?: Mode; items: Item[] } & BoxProps> = ({ mode = 'below', items, ...rest }) => {
  const intl = useIntl()
  const timer = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(1)
  const [disabled, setIsDisabled] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const length = items.length
  const [counter, setCounter] = useState(0)
  const counterValid = AUTO_ANIMATE && counter > -1

  useEffect(() => {
    if (currentIndex === 1 || currentIndex === length) {
      setTransitionEnabled(true)
    }
  }, [currentIndex, length])

  const next = useCallback(() => {
    if (!disabled) {
      setCurrentIndex(prevState => prevState + 1)
      setIsDisabled(true)
    }
  }, [disabled])

  const prev = () => {
    if (!disabled) {
      setCurrentIndex(prevState => prevState - 1)
      setIsDisabled(true)
    }
  }

  const handleTransitionEnd = () => {
    setIsDisabled(false)
    if (currentIndex === 0) {
      setTransitionEnabled(false)
      setCurrentIndex(length)
    } else if (currentIndex === length + 1) {
      setTransitionEnabled(false)
      setCurrentIndex(1)
    }
  }

  useEffect(() => {
    timer.current =
      counterValid &&
      setInterval(() => {
        next()
        setCounter(t => t + 1)
      }, duration)
    return () => clearInterval(timer.current)
  }, [counterValid, next])

  return (
    <Box
      as="section"
      id="carrousel"
      aria-roledescription={intl.formatMessage({ id: 'global.carrousel' })}
      aria-label={intl.formatMessage({ id: 'menu.news' })}
      width="100%"
      overflow="hidden"
      position="relative"
      onMouseEnter={() => setCounter(-1)}
      onMouseLeave={() => setCounter(0)}
      backgroundColor="white"
      {...rest}
    >
      <Box mb={[pxToRem(mode === 'below' ? 60 : 76), 0]}>
        {length > 1 ? (
          <Flex
            position="absolute"
            top={['', mode === 'below' ? `calc(${RATIO} - ${pxToRem(64)})` : 'unset']}
            bottom={[
              4,
              mode === 'below' ? 'unset' : pxToRem(SMALL_SCREEN_BAND_HEIGHT + 16),
              mode === 'below' ? 'unset' : pxToRem(BIG_SCREEN_BAND_HEIGHT + 16),
            ]}
            zIndex={1}
            gap={4}
            left={[`calc(50% - ${pxToRem(52)})`, 'unset', 'unset', `calc(50vw + ${pxToRem(512)})`]}
            right={['', 8, 8, 'unset']}
          >
            <ButtonQuickAction
              icon={CapUIIcon.ArrowLeft}
              aria-controls="carrousel-items"
              label={intl.formatMessage({ id: 'carrousel.prev_slide' })}
              onClick={prev}
              variantColor="hierarchy"
              size={CapUIIconSize.Md}
            />
            <ButtonQuickAction
              icon={CapUIIcon.ArrowRight}
              aria-controls="carrousel-items"
              label={intl.formatMessage({ id: 'carrousel.next_slide' })}
              onClick={next}
              variantColor="hierarchy"
              size={CapUIIconSize.Md}
            />
          </Flex>
        ) : null}

        <Flex
          id="carrousel-items"
          aria-live="off"
          width={`${(items.length + 2) * 100}%`}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate(-${(100 * currentIndex) / (items.length + 2)}%)`,
            transition: transitionEnabled ? 'transform 1s' : null,
          }}
        >
          <CarrouselItem slide={items[length - 1]} mode={mode} aria-hidden tabIndex={-1} />
          {items.map((slide, index) => (
            <CarrouselItem
              key={index}
              slide={slide}
              mode={mode}
              aria-label={intl.formatMessage({ id: 'carrousel.position' }, { position: index + 1, total: length })}
              aria-hidden={currentIndex - 1 !== index}
              tabIndex={currentIndex - 1 !== index ? -1 : undefined}
            />
          ))}
          <CarrouselItem slide={items[0]} mode={mode} aria-hidden tabIndex={-1} />
        </Flex>
      </Box>
    </Box>
  )
}

export const QUERY = graphql`
  query CarrouselQuery($type: String = "carrousel") {
    carrouselConfiguration(type: $type) {
      enabled
      title
      isLegendEnabledOnImage
      carrouselElements {
        edges {
          node {
            title
            position
            description
            isDisplayed
            buttonLabel
            type
            redirectLink
            image {
              id
              url
            }
            startAt
            endAt
          }
        }
      }
    }
  }
`

type SectionType = 'carrousel' | 'carrouselHighlighted'

const Carrousel: FC<{ type: SectionType; alt: boolean }> = ({ type = 'carrousel' }) => {
  const data = useLazyLoadQuery<CarrouselQuery>(QUERY, { type })
  if (!data || !data?.carrouselConfiguration?.enabled) return null

  const { carrouselConfiguration } = data
  const { isLegendEnabledOnImage, carrouselElements, title } = carrouselConfiguration
  const items = carrouselElements.edges
    .map(({ node }) => node)
    .filter(item => item.isDisplayed)
    .sort((item1, item2) => (item1.position > item2.position ? 1 : -1))

  const isOdd = !!document?.querySelector('.section--custom:nth-of-type(odd)#whats-new')

  return type === 'carrouselHighlighted' ? (
    <WhatsNew items={items} title={title} backgroundColor={isOdd ? 'GRAY' : 'WHITE'} />
  ) : (
    <CarrouselFullView mode={isLegendEnabledOnImage ? 'inside' : 'below'} items={items} />
  )
}

export default Carrousel
