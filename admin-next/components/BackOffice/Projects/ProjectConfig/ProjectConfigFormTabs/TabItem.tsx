import * as React from 'react'
import {
  Box,
  CapUIIcon,
  CapUIIconSize,
  CapUIFontSize,
  CapUIFontWeight,
  CapUILineHeight,
  Flex,
  Icon,
  Text,
} from '@cap-collectif/ui'
import { graphql, useFragment } from 'react-relay'
import { TabItem_tab$key } from '@relay/TabItem_tab.graphql'
import EditTabPopover from '../EditTabModal'
import { Edge, SavedValues } from './types'

const FRAGMENT = graphql`
  fragment TabItem_tab on ProjectTab {
    id
    title
    slug
    enabled
    ...EditTabModal_tab
  }
`

type TabItemProps = {
  tab: TabItem_tab$key
  isActive: boolean
  dropEdge: Edge | null
  onSelect: (slug: string) => void
  onSaved: (values: SavedValues) => Promise<void>
  onDeleted: (tabId: string) => Promise<void>
  dragHandleRef: React.RefObject<HTMLSpanElement>
}

const TabItem: React.FC<TabItemProps> = ({ tab: tabRef, isActive, dropEdge, onSelect, onSaved, onDeleted, dragHandleRef }) => {
  const tab = useFragment(FRAGMENT, tabRef)

  return (
    <Flex
      align="center"
      onClick={() => onSelect(tab.slug)}
      py="md"
      gap="xxs"
      position="relative"
      borderBottom={isActive ? '2px solid' : '2px solid transparent'}
      borderColor={isActive ? 'primary.base' : 'transparent'}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        '&::before':
          dropEdge === 'left'
            ? {
                content: '""',
                position: 'absolute',
                left: '-2px',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: 'primary.base',
                borderRadius: '2px',
              }
            : {},
        '&::after':
          dropEdge === 'right'
            ? {
                content: '""',
                position: 'absolute',
                right: '-2px',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: 'primary.base',
                borderRadius: '2px',
              }
            : {},
      }}
    >
      {isActive && (
        <Box as="span" ref={dragHandleRef} sx={{ cursor: 'grab' }}>
          <Icon name={CapUIIcon.Drag} size={CapUIIconSize.Sm} color="gray.base" />
        </Box>
      )}
      <Text
        fontSize={CapUIFontSize.Caption}
        fontWeight={CapUIFontWeight.Bold}
        lineHeight={CapUILineHeight.S}
        color={!tab.enabled ? 'gray.300' : isActive ? 'primary.base' : 'gray.700'}
        sx={{ textTransform: 'uppercase', whiteSpace: 'nowrap' }}
      >
        {tab.title}
      </Text>
      {isActive && <EditTabPopover tab={tab} onSaved={onSaved} onDeleted={onDeleted} />}
    </Flex>
  )
}

export default TabItem
