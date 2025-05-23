import * as React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import {
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIFontSize,
  CapUIIcon,
  CapUILineHeight,
  DragnDrop,
  Flex,
  Heading,
  ListCard,
  Text,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import DeleteModal from './DeleteModal'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useAppContext } from '@components/AppProvider/App.context'
import { FormValues } from '@components/Projects/ProjectConfig/ProjectConfigForm.utils'

const getWordingStep = (type: string) =>
  type === 'DebateStep' ? 'global.debate' : `${type.slice(0, -4).toLowerCase()}_step`

const getStepUri = (type: string) => `${type.slice(0, -4).toLowerCase()}-step`

const ProjectConfigFormSteps: React.FC = () => {
  const intl = useIntl()
  const { control, watch } = useFormContext<FormValues>()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [indexToDelete, setIndexToDelete] = React.useState(0)
  const stepsValues = watch('steps')
  const { viewerSession } = useAppContext()

  const {
    fields: steps,
    move,
    remove,
  } = useFieldArray<FormValues, 'steps'>({
    control,
    name: `steps`,
  })

  const onDragEnd = (result: { destination: { index: number }; source: { index: number } }) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return
    }
    move(result.source.index, result.destination.index)
  }

  const hasSelectionStep = stepsValues.some(s => s.__typename === 'SelectionStep')

  const collectStepsCount = stepsValues.filter(s => s.__typename === 'CollectStep').length

  const enableCollectStepDeletion = viewerSession.isSuperAdmin && collectStepsCount > 1 && hasSelectionStep

  return (
    <>
      {isOpen ? (
        <DeleteModal
          onClose={onClose}
          onDelete={() => {
            onClose()
            remove(indexToDelete)
          }}
        />
      ) : null}
      <Flex p={6} direction="column" spacing={6} backgroundColor="white" borderRadius="accordion">
        <Heading as="h4" fontWeight="semibold" color="blue.800">
          {intl.formatMessage({ id: 'project-header-step-modal-title' })}
        </Heading>
        <Flex direction="column" spacing={3}>
          {steps.length ? (
            // @ts-ignore https://github.com/cap-collectif/ui/issues/367
            <DragnDrop onDragEnd={onDragEnd}>
              <DragnDrop.List droppableId="steps">
                {steps.map((step, index) => {
                  const disabledDelete = !enableCollectStepDeletion && step.__typename === 'CollectStep'
                  return (
                    // @ts-ignore https://github.com/cap-collectif/ui/issues/367
                    <DragnDrop.Item draggableId={step.id} index={index} key={step.id}>
                      <ListCard.Item
                        bg="gray.100"
                        borderRadius="normal"
                        borderColor="gray.200"
                        mb={1}
                        mt={1}
                        py={2}
                        draggable
                        width="100%"
                        _hover={{ bg: 'gray.100' }}
                        sx={{ borderWidth: '1px' }}
                      >
                        <Flex direction="column">
                          <Text
                            color="gray.500"
                            fontSize={CapUIFontSize.Caption}
                            fontWeight={400}
                            lineHeight={CapUILineHeight.S}
                          >
                            {intl.formatMessage({
                              id: getWordingStep(stepsValues[index].__typename),
                            })}
                          </Text>
                          <Text
                            color="blue.900"
                            fontSize={CapUIFontSize.BodySmall}
                            fontWeight={600}
                            lineHeight={CapUILineHeight.S}
                          >
                            {stepsValues[index].label}
                          </Text>
                        </Flex>
                        <ButtonGroup>
                          <ButtonQuickAction
                            id={`edit-step-${stepsValues[index].label}`}
                            variantColor="primary"
                            icon={CapUIIcon.Pencil}
                            label={intl.formatMessage({
                              id: 'global.edit',
                            })}
                            onClick={() => {
                              window.location.href += `/update-step/${getStepUri(stepsValues[index].__typename)}/${
                                stepsValues[index].id
                              }`
                            }}
                            type="button"
                          />
                          <ButtonQuickAction
                            id={`delete-step-${stepsValues[index].label}`}
                            onClick={() => {
                              setIndexToDelete(index)
                              onOpen()
                            }}
                            variantColor="danger"
                            icon={CapUIIcon.Trash}
                            label={intl.formatMessage({
                              id: 'global.delete',
                            })}
                            type="button"
                            _disabled={{ cursor: 'not-allowed', opacity: '.5' }}
                            disabled={disabledDelete}
                          />
                        </ButtonGroup>
                      </ListCard.Item>
                    </DragnDrop.Item>
                  )
                })}
              </DragnDrop.List>
            </DragnDrop>
          ) : (
            intl.formatMessage({ id: 'configure-project-steps' })
          )}
        </Flex>
        <div>
          <Button variant="secondary" leftIcon={CapUIIcon.Add} onClick={() => (window.location.href += '/create-step')}>
            {intl.formatMessage({ id: 'global.add' })}
          </Button>
        </div>
      </Flex>
    </>
  )
}

export default ProjectConfigFormSteps
