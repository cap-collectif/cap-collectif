import * as React from 'react'
import { Box, CapUIFontWeight, CapUIIcon, CapUIIconSize, Flex, Icon, Text } from '@cap-collectif/ui'
import useDraggableElement from './useDraggableElement'

type Item = { id: string; title: string; cover?: string }

type DraggableItemRowProps = {
  item: Item
  index: number
  type: string
  onRemove: (id: string) => void
}

const DraggableItemRow: React.FC<DraggableItemRowProps> = ({ item, index, type, onRemove }) => {
  const rowRef = React.useRef<HTMLDivElement>(null)
  const { dropEdge } = useDraggableElement({
    id: item.id,
    index,
    type,
    allowedEdges: ['top', 'bottom'],
    elementRef: rowRef,
  })

  return (
    <Flex
      ref={rowRef}
      align="center"
      justify="space-between"
      px="sm"
      py="xs"
      bg="gray.100"
      borderRadius="normal"
      position="relative"
      sx={{
        '&::before':
          dropEdge === 'top'
            ? {
                content: '""',
                position: 'absolute',
                top: '-1px',
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: 'primary.base',
                borderRadius: '2px',
              }
            : {},
        '&::after':
          dropEdge === 'bottom'
            ? {
                content: '""',
                position: 'absolute',
                bottom: '-1px',
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: 'primary.base',
                borderRadius: '2px',
              }
            : {},
      }}
    >
      <Flex align="center" gap="sm">
        <Icon name={CapUIIcon.Drag} size={CapUIIconSize.Sm} color="gray.base" flexShrink={0} sx={{ cursor: 'grab' }} />
        {item.cover && (
          <Box
            as="img"
            src={item.cover}
            flexShrink={0}
            sx={{
              width: '100px',
              height: '70px',
              objectFit: 'cover',
              borderRadius: '4px',
              backgroundColor: 'gray.200',
              display: 'block',
            }}
          />
        )}
        <Text fontWeight={CapUIFontWeight.Semibold}>{item.title}</Text>
      </Flex>
      <Box
        as="button"
        type="button"
        onClick={() => onRemove(item.id)}
        sx={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
        }}
      >
        <Icon name={CapUIIcon.Trash} size={CapUIIconSize.Md} color="gray.base" />
      </Box>
    </Flex>
  )
}

export default DraggableItemRow
