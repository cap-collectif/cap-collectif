'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { ProjectPageTabBar_project$key } from '@relay/ProjectPageTabBar_project.graphql'
import { Box, CapUIFontWeight, CapUIIcon, CapUIIconSize, CapUIShadow, Flex, Icon } from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = {
  project: ProjectPageTabBar_project$key
  activeTab: string
  onTabChange: (tabSlug: string) => void
}

const FRAGMENT = graphql`
  fragment ProjectPageTabBar_project on Project {
    tabs {
      id
      slug
      title
      enabled
      ... on ProjectTabNews {
        news {
          id
        }
      }
      ... on ProjectTabEvents {
        events {
          id
        }
      }
    }
  }
`

const SCROLL_AMOUNT = 200

const tabStyles = {
  cursor: 'pointer',
  boxSizing: 'border-box' as const,
}

const ProjectPageTabBar: React.FC<Props> = ({ project: projectRef, activeTab, onTabChange }) => {
  const data = useFragment(FRAGMENT, projectRef)

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState)
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [updateScrollState])

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
  }

  const tabs = data.tabs.filter(tab => {
    if (!tab.enabled) return false
    if (tab.news !== undefined) return tab.news.length > 0
    if (tab.events !== undefined) return tab.events.length > 0
    return true
  })

  const isActive = (slug: string | null | undefined) => slug === activeTab

  return (
    <Flex
      backgroundColor="white"
      borderBottom="1px solid"
      borderBottomColor="gray.200"
      alignItems="center"
      height="48px"
      minHeight="48px"
      width="100%"
      maxWidth={pxToRem(1280)}
      mx="auto"
      px={['md', 'lg']}
    >
      {/* Left arrow */}
      {canScrollLeft && (
        <Box
          as="button"
          onClick={scrollLeft}
          flexShrink={0}
          mr="xs"
          backgroundColor="white"
          boxShadow={CapUIShadow.Small}
          borderRadius="4px"
          p="xs"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ border: 'none', cursor: 'pointer', color: 'gray.700', '&:hover': { color: 'blue.500' } }}
        >
          <Icon name={CapUIIcon.ArrowLeft} size={CapUIIconSize.Sm} />
        </Box>
      )}

      {/* Scrollable tabs */}
      <Flex
        ref={scrollRef}
        alignItems="center"
        height="100%"
        gap="lg"
        sx={{
          overflowX: 'scroll',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          flex: 1,
        }}
      >
        {tabs.map(tab => (
          <Box
            key={tab.id}
            as="button"
            fontWeight={CapUIFontWeight.Bold}
            color={isActive(tab.slug) ? 'blue.500' : 'gray.700'}
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexShrink={0}
            onClick={() => onTabChange(tab.slug ?? '')}
            sx={{
              ...tabStyles,
              background: 'none',
              border: 'none',
              padding: '0',
              borderBottom: isActive(tab.slug) ? '2px solid' : '2px solid transparent',
              borderBottomColor: isActive(tab.slug) ? 'blue.500' : 'transparent',
              '&:hover': { color: 'blue.500', borderBottomColor: 'blue.500' },
            }}
          >
            {tab.title}
          </Box>
        ))}
      </Flex>

      {/* Right arrow */}
      {canScrollRight && (
        <Box
          as="button"
          onClick={scrollRight}
          flexShrink={0}
          ml="xs"
          backgroundColor="white"
          boxShadow={CapUIShadow.Small}
          borderRadius="4px"
          p="xs"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ border: 'none', cursor: 'pointer', color: 'gray.700', '&:hover': { color: 'blue.500' } }}
        >
          <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Sm} />
        </Box>
      )}
    </Flex>
  )
}

export default ProjectPageTabBar
