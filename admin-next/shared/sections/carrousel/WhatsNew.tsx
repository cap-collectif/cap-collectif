import { Box, CapUIIcon, Flex, Heading, Link, Text, useTheme } from '@cap-collectif/ui'
import React, { useState } from 'react'
import { FC } from 'react'
import { pxToRem } from '@shared/utils/pxToRem'
import useIsMobile from '@shared/hooks/useIsMobile'
import CarrouselButton from './CarrouselButton'
import { useIntl } from 'react-intl'
import Image from '@shared/ui/Image'
import WhatsNewMobile, { DateItem, getCardLabel, getPlaceholder, SECTION_TITLE_MAX_LENGTH } from './WhatsNewMobile'
import { Item } from './CarrouselItem'

const ITEM_TITLE_MAX_LENGTH = 55
const DESCRIPTION_MAX_LENGTH = 220
const ID_KEY = 'whats-new-item-'

const WhatsNew: FC<{ items: Item[]; title: string; backgroundColor: 'WHITE' | 'GRAY' }> = ({
  items,
  title,
  backgroundColor,
}) => {
  const length = items.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const intl = useIntl()
  const isMobile = useIsMobile()
  const { colors } = useTheme()

  const sx = { svg: { color: 'neutral-gray.700' } }
  const bg = `${colors['neutral-gray'][backgroundColor === 'WHITE' ? 100 : 150]} !important`

  const scroll = (e: HTMLElement | null) => {
    if (e) e.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  const next = () => {
    scroll(document.getElementById(`${ID_KEY}${currentIndex + 1}`))
    setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1)
  }
  const prev = () => {
    scroll(document.getElementById(`${ID_KEY}${currentIndex - 1}`))
    setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1)
  }

  if (isMobile) return <WhatsNewMobile items={items} title={title} />
  return (
    <Box
      width="100%"
      overflow="hidden"
      position="relative"
      margin="auto"
      px={[4, 8]}
      py={[4, pxToRem(72)]}
      aria-roledescription={intl.formatMessage({ id: 'global.carrousel' })}
      aria-label={intl.formatMessage({ id: 'menu.news' })}
    >
      <Box maxWidth={pxToRem(1232)} width="100%" margin="auto">
        <Flex gap={8}>
          <Box width={pxToRem(348)} flex="none">
            <Flex justifyContent="space-between" alignItems="center" mb={3}>
              <Heading as="h3">{title.slice(0, SECTION_TITLE_MAX_LENGTH)}</Heading>
              {length > 1 ? (
                <Flex zIndex={1} gap={4}>
                  <CarrouselButton
                    variantColor="neutral-gray"
                    icon={CapUIIcon.ArrowUp}
                    aria-controls="whats-new-items"
                    label={intl.formatMessage({ id: 'carrousel.prev_slide' })}
                    onClick={prev}
                    disabled={!currentIndex}
                    boxShadow={null}
                    sx={sx}
                    backgroundColor={bg}
                  />
                  <CarrouselButton
                    variantColor="neutral-gray"
                    icon={CapUIIcon.ArrowDown}
                    aria-controls="whats-new-items"
                    label={intl.formatMessage({ id: 'carrousel.next_slide' })}
                    onClick={next}
                    disabled={currentIndex === items.length - 1}
                    boxShadow={null}
                    sx={sx}
                    backgroundColor={bg}
                  />
                </Flex>
              ) : null}
            </Flex>
            <Box
              id="whats-new-items"
              aria-live="off"
              height={['', '33vw', '33vw', '40vw']}
              maxHeight={pxToRem(584)}
              overflowY="scroll"
              sx={{ scrollbarWidth: 'none' }}
            >
              {items.map((slide, index) => {
                const isCurrent = index === currentIndex
                const title = slide.title?.slice(0, ITEM_TITLE_MAX_LENGTH)
                return (
                  <Flex
                    id={`${ID_KEY}${index}`}
                    aria-label={intl.formatMessage(
                      { id: 'carrousel.position' },
                      { position: index + 1, total: length },
                    )}
                    p={6}
                    borderRadius="accordion"
                    mt={index ? 3 : 0}
                    bg={isCurrent ? (backgroundColor === 'GRAY' ? 'neutral-gray.150' : 'neutral-gray.100') : null}
                    direction="column"
                    gap={2}
                    key={index}
                    position="relative"
                    role="group"
                    aria-roledescription={intl.formatMessage({ id: 'carrousel.slide' })}
                    onClick={e => {
                      scroll(e?.currentTarget)
                      setCurrentIndex(index)
                    }}
                    sx={{ cursor: 'pointer' }}
                    color={isCurrent ? 'neutral-gray.900' : 'neutral-gray.600'}
                    _hover={isCurrent ? {} : { '*': { color: `${colors['neutral-gray'][900]} !important` } }}
                  >
                    {slide.type ? (
                      <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        color={isCurrent ? 'neutral-gray.900' : 'neutral-gray.700'}
                      >
                        <Text>{intl.formatMessage({ id: getCardLabel(slide.type) })}</Text>
                        <DateItem dateRange={slide.extraData} />
                      </Flex>
                    ) : null}
                    <Heading
                      as="h4"
                      fontWeight={isCurrent ? 600 : undefined}
                      lineHeight="normal"
                      color={isCurrent ? 'neutral-gray.900' : 'neutral-gray.700'}
                    >
                      {title}
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
                          fontWeight={600}
                        >
                          {intl.formatMessage({ id: 'learn.more' })}
                          <span className="sr-only">
                            {intl.formatMessage({ id: 'global.on' })}{' '}
                            {intl.formatMessage({ id: getCardLabel(slide.type) })} {title}
                          </span>
                        </Link>
                      </>
                    ) : null}
                  </Flex>
                )
              })}
            </Box>
          </Box>
          <Box bg="neutral-gray.100" width="100%" height="fit-content">
            {items[currentIndex].image ? (
              <Image
                src={items[currentIndex].image.url}
                alt=""
                width="100%"
                borderRadius="accordion"
                maxHeight={pxToRem(640)}
                sx={{
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                }}
                loading="eager"
                sizes="(max-width: 320px) 320px,
                (max-width: 640px) 640px,
                (max-width: 960px) 960px,
                (max-width: 1280px) 960px,
                (max-width: 2560px) 960px,"
              />
            ) : (
              <Flex
                alignItems="center"
                justifyContent="center"
                maxHeight={pxToRem(640)}
                style={{
                  aspectRatio: '4 / 3',
                }}
                borderRadius="accordion"
                bg={colors.primary[600]}
              >
                {getPlaceholder(items[currentIndex].type)}
              </Flex>
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default WhatsNew
