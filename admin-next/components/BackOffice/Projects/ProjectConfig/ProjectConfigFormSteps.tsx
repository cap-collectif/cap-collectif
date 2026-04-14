import * as React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import {
  Accordion,
  Box,
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  CapUIModalSize,
  DragnDrop,
  Flex,
  Heading,
  Icon,
  ListCard,
  Modal,
  Radio,
  Text,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import DeleteModal from './DeleteModal'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { FormValues } from '@components/BackOffice/Projects/ProjectConfig/ProjectConfigForm.utils'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

const getWordingStep = (type: string) =>
  type === 'DebateStep' ? 'global.debate' : `${type.slice(0, -4).toLowerCase()}_step`

const getStepUri = (type: string) => `${type.slice(0, -4).toLowerCase()}-step`

const ProjectConfigFormSteps: React.FC = () => {
  const intl = useIntl()
  const { control, watch } = useFormContext<FormValues>()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [indexToDelete, setIndexToDelete] = React.useState(0)
  const [stepDisplayMode, setStepDisplayMode] = React.useState<'flat' | 'chronological'>('flat')
  const stepsValues = watch('steps')
  const { viewerSession } = useAppContext()
  const isNewProjectPage = useFeatureFlag('new_project_page')

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

  // Super admins can always delete collect steps
  // Non-super admins can delete collect steps **only** if there is no selection step in the project
  const canDeleteCollectStep = viewerSession.isSuperAdmin || !hasSelectionStep

  const stepsContent = steps.length ? (
    // @ts-ignore https://github.com/cap-collectif/ui/issues/367
    <DragnDrop onDragEnd={onDragEnd} ml={0}>
      <DragnDrop.List droppableId="steps">
        {steps.map((step, index) => {
          const disableDelete = !canDeleteCollectStep && step.__typename === 'CollectStep'
          return (
            // @ts-ignore https://github.com/cap-collectif/ui/issues/367
            <DragnDrop.Item draggableId={step.id} index={index} key={step.id}>
              <ListCard.Item mb={1} mt={1} pl={4} draggable>
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
                    disabled={disableDelete}
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
  )

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
      {isNewProjectPage ? (
        <>
          <Accordion.Button>
            <Flex gap="xs" mr="xs">
              <Text>{intl.formatMessage({ id: 'project-header-step-modal-title' })}</Text>
              <Box onClick={e => e.stopPropagation()}>
                <Modal
                  disclosure={
                    <Button variant="link" p={0}>
                      <Icon color="gray.base" name={CapUIIcon.Cog} />
                    </Button>
                  }
                  size={CapUIModalSize.Lg}
                  ariaLabel={intl.formatMessage({ id: 'back.project-step.display-configuration' })}
                  position="absolute"
                  top="50%"
                  left="50%"
                  mt="0!important"
                  maxHeight="none!important"
                  sx={{
                    transform: 'translate(-50%, -50%)!important',
                  }}
                >
                  {({ hide }) => (
                    <>
                      <Modal.Header>
                        <Modal.Header.Label>
                          {intl.formatMessage({ id: 'global.participative.project.label' })}
                        </Modal.Header.Label>
                        <Heading>{intl.formatMessage({ id: 'back.project-step.display-configuration' })}</Heading>
                      </Modal.Header>
                      <Modal.Body>
                        <Text mb={4}>{intl.formatMessage({ id: 'back.project-step.select-step' })}</Text>
                        <Flex gap={8} direction="row">
                          {(['flat', 'chronological'] as const).map(mode => {
                            const isSelected = stepDisplayMode === mode
                            const modeSteps =
                              mode === 'flat'
                                ? ['questionnaire_step', 'ideas_box_step', 'vote_step']
                                : ['collect_step', 'analysis_step', 'vote_step']
                            return (
                              <Flex
                                key={mode}
                                direction="column"
                                align="center"
                                flex={1}
                                gap={6}
                                border="1px solid"
                                borderColor={isSelected ? '#C2DFFF' : '#DADEE1'}
                                backgroundColor={isSelected ? '#FAFCFF' : 'white'}
                                borderRadius="normal"
                                p={6}
                                sx={{ cursor: 'pointer' }}
                                onClick={() => setStepDisplayMode(mode)}
                              >
                                {/* Header */}
                                <Flex align="center" justify="center" gap={1}>
                                  <Flex
                                    align="center"
                                    justify="center"
                                    width="48px"
                                    height="48px"
                                    p={2}
                                    overflow="hidden"
                                  >
                                    <Icon name={CapUIIcon.UserO} size={CapUIIconSize.Xl} color="primary.base" />
                                  </Flex>
                                  <Text
                                    fontSize={CapUIFontSize.Headline}
                                    lineHeight={CapUILineHeight.M}
                                    color="gray.900"
                                    sx={{ whiteSpace: 'nowrap' }}
                                  >
                                    {intl.formatMessage({ id: 'global.participative.project.label' })}
                                  </Text>
                                </Flex>

                                {/* Step list */}
                                <Box
                                  backgroundColor={isSelected ? 'white' : 'transparent'}
                                  p={2}
                                  borderRadius="xs"
                                  width="100%"
                                >
                                  <Flex direction="column" gap={4}>
                                    {modeSteps.map((step, index) => (
                                      <Flex key={step} align="center" justify="space-between" p={2} borderRadius="xs">
                                        <Text
                                          fontSize={CapUIFontSize.BodyRegular}
                                          lineHeight={CapUILineHeight.M}
                                          color="gray.700"
                                        >
                                          {mode === 'chronological' ? `${index + 1}. ` : ''}
                                          {intl.formatMessage({ id: step })}
                                        </Text>
                                        <Flex align="center" justify="center" width="24px" height="24px" p={2}>
                                          <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Sm} color="gray.500" />
                                        </Flex>
                                      </Flex>
                                    ))}
                                  </Flex>
                                </Box>

                                {/* Description */}
                                <Flex align="flex-start" justify="center" gap={1} px={6}>
                                  <Icon name={CapUIIcon.CheckO} size={CapUIIconSize.Sm} color="primary.base" />
                                  <Text
                                    fontSize={CapUIFontSize.BodySmall}
                                    lineHeight={CapUILineHeight.S}
                                    color="gray.900"
                                    textAlign="center"
                                    flex={1}
                                  >
                                    {intl.formatMessage({ id: `back.project-step.mode-${mode}.description` })}
                                  </Text>
                                </Flex>

                                {/* Radio */}
                                <Radio
                                  id={`step-display-${mode}`}
                                  name="stepDisplayMode"
                                  value={mode}
                                  checked={isSelected}
                                  onChange={() => setStepDisplayMode(mode)}
                                >
                                  {''}
                                </Radio>
                              </Flex>
                            )
                          })}
                        </Flex>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" variantColor="primary" variantSize="big" onClick={hide}>
                          {intl.formatMessage({ id: 'global.back' })}
                        </Button>
                        <Button variant="primary" variantColor="primary" variantSize="big" onClick={hide}>
                          {intl.formatMessage({ id: 'global.validate' })}
                        </Button>
                      </Modal.Footer>
                    </>
                  )}
                </Modal>
              </Box>
            </Flex>
            <Button
              variant="secondary"
              leftIcon={CapUIIcon.Add}
              onClick={() => (window.location.href += '/create-step')}
              ml="auto"
            >
              {intl.formatMessage({ id: 'global.add' })}
            </Button>
          </Accordion.Button>
          <Accordion.Panel ml={0}>{stepsContent}</Accordion.Panel>
        </>
      ) : (
        <Flex p={6} direction="column" spacing={6} backgroundColor="white" borderRadius="accordion">
          <Heading as="h4" fontWeight="semibold" color="blue.800">
            {intl.formatMessage({ id: 'project-header-step-modal-title' })}
          </Heading>
          <Flex direction="column" spacing={3}>
            {stepsContent}
          </Flex>
          <div>
            <Button
              variant="secondary"
              leftIcon={CapUIIcon.Add}
              onClick={() => (window.location.href += '/create-step')}
            >
              {intl.formatMessage({ id: 'global.add' })}
            </Button>
          </div>
        </Flex>
      )}
    </>
  )
}

export default ProjectConfigFormSteps
