import { Box, CapUIIcon, Flex, Heading, Link, Text } from '@cap-collectif/ui'
import React, { useState } from 'react'
import { FC } from 'react'
import { pxToRem } from '@shared/utils/pxToRem'
import useIsMobile from '@shared/hooks/useIsMobile'
import CarrouselButton from './CarrouselButton'
import { useIntl } from 'react-intl'
import Image from '@shared/ui/Image'
import WhatsNewMobile from './WhatsNewMobile'
import { Item } from './CarrouselItem'

const ITEM_TITLE_MAX_LENGTH = 34
const DESCRIPTION_MAX_LENGTH = 220

const WhatsNew: FC<{ items: Item[] }> = ({ items }) => {
  const length = items.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const intl = useIntl()
  const isMobile = useIsMobile()

  const next = () => setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1)
  const prev = () => setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1)

  if (isMobile) return <WhatsNewMobile items={items} />

  return (
    <Box
      as="section"
      id="whats-new"
      width="100%"
      overflow="hidden"
      position="relative"
      margin="auto"
      p={[4, 8]}
      aria-roledescription={intl.formatMessage({ id: 'global.carrousel' })}
      aria-label={intl.formatMessage({ id: 'menu.news' })}
    >
      <Box maxWidth={pxToRem(1232)} width="100%" margin="auto">
        <Flex gap={8}>
          <Box width={pxToRem(348)} flex="none">
            <Flex justifyContent="space-between" alignItems="center">
              {/* <Heading as="h3">{'À la une'.slice(0, SECTION_TITLE_MAX_LENGTH)}</Heading> */}
              {length > 1 ? (
                <Flex zIndex={1} gap={4}>
                  <CarrouselButton
                    variantColor="neutral-gray"
                    icon={CapUIIcon.ArrowUp}
                    aria-controls="whats-new-items"
                    label={intl.formatMessage({ id: 'carrousel.prev_slide' })}
                    onClick={prev}
                  />
                  <CarrouselButton
                    variantColor="neutral-gray"
                    icon={CapUIIcon.ArrowDown}
                    aria-controls="whats-new-items"
                    label={intl.formatMessage({ id: 'carrousel.next_slide' })}
                    onClick={next}
                  />
                </Flex>
              ) : null}
            </Flex>
            <Box id="whats-new-items" aria-live="off">
              {items.map((slide, index) => {
                const isCurrent = index === currentIndex

                if (
                  (currentIndex > 2 && index <= 2) ||
                  (currentIndex > 5 && index <= 5) ||
                  (currentIndex <= 2 && index > 2) ||
                  (currentIndex <= 5 && index > 5)
                )
                  return null

                return (
                  <Flex
                    aria-label={intl.formatMessage(
                      { id: 'carrousel.position' },
                      { position: index + 1, total: length },
                    )}
                    p={6}
                    borderRadius="accordion"
                    mt={3}
                    bg={isCurrent ? 'neutral-gray.150' : null}
                    direction="column"
                    gap={2}
                    key={index}
                    position="relative"
                    role="group"
                    aria-roledescription={intl.formatMessage({ id: 'carrousel.slide' })}
                  >
                    {slide.type ? <Text>{slide.type}</Text> : null}
                    <Heading as="h4" fontWeight={isCurrent ? 600 : undefined}>
                      {slide.title.slice(0, ITEM_TITLE_MAX_LENGTH)}
                    </Heading>
                    {isCurrent ? (
                      <>
                        {slide.description ? (
                          <Text lineHeight="normal" truncate={DESCRIPTION_MAX_LENGTH}>
                            {slide.description}
                          </Text>
                        ) : null}
                        <Link
                          color="primary.600"
                          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                          href={slide.redirectLink}
                        >
                          {intl.formatMessage({ id: 'learn.more' })}
                        </Link>
                      </>
                    ) : null}
                  </Flex>
                )
              })}
            </Box>
          </Box>
          <Box bg="neutral-gray.100" width="100%" height="fit-content">
            <Image
              src={items[currentIndex].image.url}
              alt=""
              width="100%"
              borderRadius="accordion"
              maxHeight={pxToRem(640)}
              style={{
                aspectRatio: '4 / 3',
                objectFit: 'cover',
              }}
              loading="eager"
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default WhatsNew
