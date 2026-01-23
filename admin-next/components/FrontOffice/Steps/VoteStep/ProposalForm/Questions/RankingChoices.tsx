import { Box, Button, CapUIIcon, CapUIIconSize, DragnDrop, Flex, Icon, ListCard, Text } from '@cap-collectif/ui'
import Image from '@shared/ui/Image'
import * as React from 'react'
import type { DropResult } from 'react-beautiful-dnd'
import { useController } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { RankingChoice, RankingChoicesProps } from '../ProposalFormModal.type'

const RankingChoices: React.FC<RankingChoicesProps> = ({ name, control, choices }) => {
  const intl = useIntl()
  const { field } = useController({ name, control })

  // field.value is an array of selected choice IDs in order
  const selectedIds: string[] = Array.isArray(field.value) ? field.value : []
  const availableChoices = choices.filter(c => !selectedIds.includes(c.id))
  const rankedChoices = selectedIds.map(id => choices.find(c => c.id === id)).filter(Boolean) as RankingChoice[]

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return

    const sourceDroppableId = source.droppableId
    const destDroppableId = destination.droppableId

    // Moving within the same list
    if (sourceDroppableId === destDroppableId) {
      if (sourceDroppableId === 'ranked') {
        // Reorder within ranked list
        const newSelectedIds = [...selectedIds]
        const [removed] = newSelectedIds.splice(source.index, 1)
        newSelectedIds.splice(destination.index, 0, removed)
        field.onChange(newSelectedIds)
      }
      // No reordering needed in available list
      return
    }

    // Moving between lists
    if (sourceDroppableId === 'available' && destDroppableId === 'ranked') {
      // Add to ranked
      const choiceId = availableChoices[source.index].id
      const newSelectedIds = [...selectedIds]
      newSelectedIds.splice(destination.index, 0, choiceId)
      field.onChange(newSelectedIds)
    } else if (sourceDroppableId === 'ranked' && destDroppableId === 'available') {
      // Remove from ranked
      const newSelectedIds = [...selectedIds]
      newSelectedIds.splice(source.index, 1)
      field.onChange(newSelectedIds)
    }
  }

  const handleSelect = (choiceId: string) => {
    const newValue = [...selectedIds, choiceId]
    field.onChange(newValue)
  }

  const handleRemove = (choiceId: string) => {
    const newValue = selectedIds.filter(id => id !== choiceId)
    field.onChange(newValue)
  }

  return (
    <DragnDrop onDragEnd={handleDragEnd}>
      <Flex gap={4}>
        {/* Available choices */}
        <Box flex="1">
          <Text fontWeight="600" mb={2}>
            {intl.formatMessage({ id: 'global.form.ranking.pickBox.title' })}
          </Text>
          <DragnDrop.List droppableId="available" direction="horizontal" minHeight="100px">
            {availableChoices.map((choice, index) => (
              <DragnDrop.Item key={choice.id} draggableId={choice.id} index={index}>
                <ListCard.Item mb={2} bg="white" draggable>
                  <Flex direction="column" gap={2}>
                    <Text fontWeight="600">{choice.label}</Text>
                    {choice.image?.url && (
                      <Image
                        src={choice.image.url}
                        alt={choice.label}
                        width="40px"
                        height="40px"
                        borderRadius="normal"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <Button
                      variant="link"
                      variantColor="primary"
                      onClick={() => handleSelect(choice.id)}
                      rightIcon={CapUIIcon.ArrowRightO}
                    >
                      {intl.formatMessage({ id: 'global.form.ranking.select' })}
                    </Button>
                  </Flex>
                </ListCard.Item>
              </DragnDrop.Item>
            ))}
          </DragnDrop.List>
        </Box>

        <Flex align="center" justify="center" px={2}>
          <Icon name={CapUIIcon.ArrowRightO} size={CapUIIconSize.Lg} color="gray.300" />
        </Flex>

        {/* Ranked choices */}
        <Box flex="1">
          <Text fontWeight="600" mb={2}>
            {intl.formatMessage({ id: 'global.form.ranking.choiceBox.title' })}
          </Text>
          <DragnDrop.List droppableId="ranked" direction="vertical" minHeight="100px">
            {rankedChoices.map((choice, index) => (
              <DragnDrop.Item key={choice.id} draggableId={`ranked-${choice.id}`} index={index}>
                <ListCard.Item mb={2} bg="primary.100" borderColor="primary.500" draggable>
                  <Flex align="center" gap={2}>
                    <Text fontWeight="600" color="primary.700">
                      {index + 1}.
                    </Text>
                    {choice.image?.url && (
                      <Image
                        src={choice.image.url}
                        alt={choice.label}
                        width="40px"
                        height="40px"
                        borderRadius="normal"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <Text fontWeight="600">{choice.label}</Text>
                  </Flex>
                  <Button
                    variant="link"
                    variantColor="primary"
                    onClick={() => handleRemove(choice.id)}
                    leftIcon={CapUIIcon.ArrowLeftO}
                  >
                    {intl.formatMessage({ id: 'global.remove' })}
                  </Button>
                </ListCard.Item>
              </DragnDrop.Item>
            ))}

            {/* Empty slots */}
            {rankedChoices.length < choices.length &&
              Array.from({ length: choices.length - rankedChoices.length }).map((_, index) => (
                <Box
                  key={`empty-${index}`}
                  p={3}
                  border="2px dashed"
                  borderColor="gray.200"
                  borderRadius="normal"
                  minHeight="52px"
                />
              ))}
          </DragnDrop.List>
        </Box>
      </Flex>
    </DragnDrop>
  )
}

export default RankingChoices
