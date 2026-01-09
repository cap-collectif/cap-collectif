import { FieldInput, FormControl } from '@cap-collectif/form'
import {
  Box,
  Button,
  CapInputSize,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormGuideline,
  FormLabel,
  Heading,
  Icon,
  Modal,
  Text,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import { zodResolver } from '@hookform/resolvers/zod'
import CreateProposalMutation from '@mutations/CreateProposalMutation'
import MajorityQuestion from '@shared/ui/MajorityQuestion/MajorityQuestion'
import { dangerToast, successToast } from '@shared/utils/toasts'
import { UPLOAD_PATH } from '@utils/config'
import * as React from 'react'
import { DragDropContext, Draggable, Droppable, DroppableProps, DropResult } from 'react-beautiful-dnd'
import { Controller, FormProvider, useController, useForm, useWatch } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { ButtonChoicesProps, FormValues, Props, RankingChoice, RankingChoicesProps } from './ProposalCreateModal.type'
import { createProposalSchema, getAvailableQuestionIds } from './utils'

// StrictModeDroppable wrapper to fix react-beautiful-dnd with React 18 StrictMode
const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = React.useState(false)

  React.useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true))
    return () => {
      cancelAnimationFrame(animation)
      setEnabled(false)
    }
  }, [])

  if (!enabled) {
    return null
  }

  return <Droppable {...props}>{children}</Droppable>
}

const ButtonChoices: React.FC<ButtonChoicesProps> = ({ name, control, choices }) => {
  const { field } = useController({ name, control })

  const handleSelect = (choiceId: string) => {
    // Toggle selection - if already selected, deselect; otherwise select
    const newValue = field.value === choiceId ? null : choiceId
    field.onChange(newValue)
  }

  return (
    <Flex gap={2} wrap="wrap">
      {choices.map(choice => {
        const isSelected = field.value === choice.id
        const bgColor = choice.color || '#3182CE'

        return (
          <Button
            key={choice.id}
            type="button"
            variant={isSelected ? 'primary' : 'secondary'}
            onClick={() => handleSelect(choice.id)}
            style={{
              backgroundColor: isSelected ? bgColor : 'transparent',
              borderColor: bgColor,
              color: isSelected ? 'white' : bgColor,
            }}
          >
            {choice.label}
          </Button>
        )
      })}
    </Flex>
  )
}

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
    <DragDropContext onDragEnd={handleDragEnd}>
      <Flex gap={4}>
        {/* Available choices */}
        <Box flex="1">
          <Text fontWeight="600" mb={2}>
            {intl.formatMessage({ id: 'available-choices' })}
          </Text>
          <StrictModeDroppable droppableId="available">
            {(provided, snapshot) => (
              <Flex
                direction="column"
                gap={2}
                ref={provided.innerRef}
                {...provided.droppableProps}
                minHeight="100px"
                bg={snapshot.isDraggingOver ? 'gray.100' : 'transparent'}
                borderRadius="normal"
                p={snapshot.isDraggingOver ? 2 : 0}
              >
                {availableChoices.map((choice, index) => (
                  <Draggable key={choice.id} draggableId={choice.id} index={index}>
                    {(provided, snapshot) => (
                      <Flex
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        p={3}
                        border="1px solid"
                        borderColor={snapshot.isDragging ? 'primary.500' : 'gray.200'}
                        borderRadius="normal"
                        align="center"
                        justify="space-between"
                        bg={snapshot.isDragging ? 'primary.100' : 'white'}
                        boxShadow={snapshot.isDragging ? 'md' : 'none'}
                      >
                        <Flex align="center" gap={2}>
                          <Icon name={CapUIIcon.Drag} color="gray.500" size={CapUIIconSize.Md} />
                          <Text fontWeight="600">{choice.label}</Text>
                        </Flex>
                        <Button
                          variant="link"
                          variantColor="primary"
                          onClick={() => handleSelect(choice.id)}
                          rightIcon={CapUIIcon.ArrowRightO}
                        >
                          {intl.formatMessage({ id: 'global.select' })}
                        </Button>
                      </Flex>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Flex>
            )}
          </StrictModeDroppable>
        </Box>

        {/* Arrow */}
        <Flex align="center" justify="center" px={2}>
          <Icon name={CapUIIcon.ArrowRightO} size={CapUIIconSize.Lg} color="gray.300" />
        </Flex>

        {/* Ranked choices */}
        <Box flex="1">
          <Text fontWeight="600" mb={2}>
            {intl.formatMessage({ id: 'your-ranking' })}
          </Text>
          <StrictModeDroppable droppableId="ranked">
            {(provided, snapshot) => (
              <Flex
                direction="column"
                gap={2}
                ref={provided.innerRef}
                {...provided.droppableProps}
                minHeight="100px"
                bg={snapshot.isDraggingOver ? 'primary.100' : 'transparent'}
                borderRadius="normal"
                p={snapshot.isDraggingOver ? 2 : 0}
              >
                {rankedChoices.map((choice, index) => (
                  <Draggable key={choice.id} draggableId={`ranked-${choice.id}`} index={index}>
                    {(provided, snapshot) => (
                      <Flex
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        p={3}
                        border="1px solid"
                        borderColor="primary.500"
                        borderRadius="normal"
                        align="center"
                        justify="space-between"
                        bg={snapshot.isDragging ? 'primary.200' : 'primary.100'}
                        boxShadow={snapshot.isDragging ? 'md' : 'none'}
                      >
                        <Flex align="center" gap={2}>
                          <Icon name={CapUIIcon.Drag} color="primary.500" size={CapUIIconSize.Md} />
                          <Text fontWeight="600" color="primary.700">
                            {index + 1}.
                          </Text>
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
                      </Flex>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
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
              </Flex>
            )}
          </StrictModeDroppable>
        </Box>
      </Flex>
    </DragDropContext>
  )
}

const FRAGMENT = graphql`
  fragment ProposalCreateModal_proposalForm on ProposalForm {
    id
    description
    objectType
    usingDescription
    descriptionMandatory
    descriptionHelpText
    usingSummary
    summaryHelpText
    usingThemes
    themeMandatory
    themeHelpText
    usingCategories
    categoryMandatory
    categoryHelpText
    usingAddress
    addressHelpText
    usingDistrict
    districtMandatory
    districtHelpText
    usingIllustration
    illustrationHelpText
    titleHelpText
    usingWebPage
    usingFacebook
    usingTwitter
    usingInstagram
    usingYoutube
    usingLinkedIn
    categories(order: ALPHABETICAL) {
      id
      name
    }
    districts(order: ALPHABETICAL) {
      id
      name
    }
    questions {
      id
      title
      type
      required
      helpText
      description
      alwaysJumpDestinationQuestion {
        id
      }
      jumps {
        id
        destination {
          id
        }
        conditions {
          id
          operator
          question {
            id
          }
          value {
            id
            title
          }
        }
      }
      ... on MultipleChoiceQuestion {
        isOtherAllowed
        choices(allowRandomize: true) {
          edges {
            node {
              id
              title
              color
            }
          }
        }
      }
    }
  }
`

const ProposalCreateModal: React.FC<Props> = ({ disabled, proposalForm: proposalFormKey }) => {
  const intl = useIntl()
  const proposalForm = useFragment(FRAGMENT, proposalFormKey)

  const defaultValues = React.useMemo(
    () => ({
      title: '',
      summary: '',
      body: '',
      theme: '',
      category: '',
      district: '',
      address: '',
      media: null,
      responses: proposalForm.questions.map(question => ({
        question: question.id,
        value: null,
      })),
      webPageUrl: '',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      linkedInUrl: '',
    }),
    [proposalForm.questions],
  )

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues,
    resolver: zodResolver(createProposalSchema(proposalForm)),
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods

  // Watch responses to compute which questions should be visible based on logic jumps
  // useWatch subscribes to form changes and triggers re-renders
  const watchedResponses = useWatch({ control, name: 'responses' })

  const availableQuestionIds = React.useMemo(
    () => getAvailableQuestionIds(proposalForm.questions, watchedResponses || []),
    [proposalForm.questions, watchedResponses],
  )

  const onSubmit = async (data: FormValues, isDraft = false, hide?: () => void) => {
    try {
      // Format responses for GraphQL mutation
      const formattedResponses = data.responses
        .filter(response => {
          // Only include responses for visible questions and that have a value
          if (!availableQuestionIds.has(response.question)) return false

          const question = proposalForm.questions.find(q => q.id === response.question)

          // Exclude empty responses unless the question is required
          if (
            !question?.required &&
            (response.value === null || response.value === '' || response.value === undefined)
          ) {
            return false
          }

          return true
        })
        .map(response => {
          const question = proposalForm.questions.find(q => q.id === response.question)

          // For media questions, use medias field instead of value
          if (question?.type === 'medias' && Array.isArray(response.value)) {
            return {
              question: response.question,
              medias: response.value.map((media: any) => (typeof media === 'object' ? media.id : media)),
            }
          }

          // For other questions, format the value appropriately
          let formattedValue = response.value

          // Handle select field format (object with value/label)
          if (typeof formattedValue === 'object' && formattedValue !== null && 'value' in formattedValue) {
            formattedValue = (formattedValue as { value: string }).value
          }

          return {
            question: response.question,
            value: formattedValue,
          }
        })

      const input = {
        proposalFormId: proposalForm.id,
        draft: isDraft,
        title: data.title,
        ...(data.body && { body: data.body }),
        ...(data.summary && { summary: data.summary }),
        ...(data.theme && { theme: data.theme }),
        ...(data.category && { category: data.category }),
        ...(data.district && { district: data.district }),
        ...(data.address && { address: data.address }),
        ...(data.media && { media: data.media.id }),
        ...(formattedResponses.length > 0 && { responses: formattedResponses }),
        ...(data.webPageUrl && { webPageUrl: data.webPageUrl }),
        ...(data.facebookUrl && { facebookUrl: data.facebookUrl }),
        ...(data.twitterUrl && { twitterUrl: data.twitterUrl }),
        ...(data.instagramUrl && { instagramUrl: data.instagramUrl }),
        ...(data.youtubeUrl && { youtubeUrl: data.youtubeUrl }),
        ...(data.linkedInUrl && { linkedInUrl: data.linkedInUrl }),
      }

      const response = await CreateProposalMutation.commit({ input })

      if (response.createProposal?.userErrors && response.createProposal.userErrors.length > 0) {
        const errorMessage = response.createProposal.userErrors.map(e => e.message).join(', ')
        dangerToast(errorMessage)
        return
      }

      if (response.createProposal?.proposal) {
        successToast(
          intl.formatMessage(
            { id: isDraft ? 'proposal-draft-saved' : 'proposal-created-successfully' },
            { title: response.createProposal.proposal.title },
          ),
        )

        // Reset form and close modal
        reset()
        if (hide) {
          hide()
        }

        // Optionally redirect to the proposal page
        if (response.createProposal.proposal.url) {
          window.location.href = response.createProposal.proposal.url
        }
      }
    } catch (error) {
      console.error('Error creating proposal:', error)
      dangerToast(intl.formatMessage({ id: 'global.error.server.form' }))
    }
  }

  const getTitleLabel = () => {
    if (proposalForm.objectType === 'PROPOSAL') return 'global.title'
    if (proposalForm.objectType === 'OPINION') return 'opinion-title'
    return 'title'
  }

  return (
    <Modal
      disclosure={
        <Button disabled={disabled} flex="none" variant="primary" leftIcon={CapUIIcon.Add}>
          {intl.formatMessage({ id: 'front.collect.proposal-submit' })}
        </Button>
      }
      ariaLabel={intl.formatMessage({ id: 'proposal.submit' })}
      size={CapUIModalSize.Xl}
      onClose={reset}
    >
      {({ hide }) => (
        <FormProvider {...methods}>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'proposal.add' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Flex as="form" direction="column" gap={4}>
              {/* Title */}
              <FormControl name="title" control={control} isRequired>
                {/* // todo: check if isRequired is still necessary with zod validation */}
                <FormLabel htmlFor="title" label={intl.formatMessage({ id: getTitleLabel() })} />
                <FieldInput
                  type="text"
                  control={control}
                  name="title"
                  id="title"
                  placeholder={intl.formatMessage({ id: 'proposal.title.placeholder' })}
                />
                {proposalForm.titleHelpText && (
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    {proposalForm.titleHelpText}
                  </Text>
                )}
              </FormControl>

              {/* Summary */}
              {proposalForm.usingSummary && (
                <FormControl name="summary" control={control}>
                  <FormLabel htmlFor="summary" label={intl.formatMessage({ id: 'global.summary' })} />
                  <FieldInput type="textarea" control={control} name="summary" id="summary" maxLength={140} />
                  {proposalForm.summaryHelpText && (
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      {proposalForm.summaryHelpText}
                    </Text>
                  )}
                </FormControl>
              )}

              {/* Category */}
              {proposalForm.usingCategories && proposalForm.categories.length > 0 && (
                <FormControl name="category" control={control} isRequired={proposalForm.categoryMandatory}>
                  <FormLabel htmlFor="category" label={intl.formatMessage({ id: 'global.category' })} />
                  <FieldInput
                    type="select"
                    control={control}
                    name="category"
                    id="category"
                    placeholder={intl.formatMessage({ id: 'proposal.select.category' })}
                    options={proposalForm.categories.map(cat => ({
                      label: cat.name,
                      value: cat.id,
                    }))}
                  />
                  {proposalForm.categoryHelpText && (
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      {proposalForm.categoryHelpText}
                    </Text>
                  )}
                </FormControl>
              )}

              {/* TODO fix places autocomplete */}
              {/* Address */}
              {/* {proposalForm.usingAddress && (
                <FormControl name="address" control={control}>
                  <FormLabel label={intl.formatMessage({ id: 'proposal_form.address' })} htmlFor="address" />
                  <FieldInput
                    type="address"
                    control={control}
                    name="address"
                    id="address"
                    placeholder={intl.formatMessage({ id: 'proposal.map.form.placeholder' })}
                  />
                  {proposalForm.addressHelpText && (
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      {proposalForm.addressHelpText}
                    </Text>
                  )}
                </FormControl>
              )}

              */}
              {proposalForm.usingAddress && (
                <Button variant="link" variantColor="primary" pl={0} pt={0}>
                  {intl.formatMessage({ id: 'front.proposal.locate-on-map' })}
                </Button>
              )}

              {/* District */}
              {proposalForm.usingDistrict && proposalForm.districts.length > 0 && (
                <FormControl name="district" control={control} isRequired={proposalForm.districtMandatory}>
                  <FormLabel htmlFor="district" label={intl.formatMessage({ id: 'proposal.district' })} />
                  <FieldInput
                    type="select"
                    control={control}
                    name="district"
                    id="district"
                    placeholder={intl.formatMessage({ id: 'proposal.select.district' })}
                    options={proposalForm.districts.map(district => ({
                      label: district.name,
                      value: district.id,
                    }))}
                  />
                  {proposalForm.districtHelpText && (
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      {proposalForm.districtHelpText}
                    </Text>
                  )}
                </FormControl>
              )}

              {/* Description/Body */}
              {proposalForm.usingDescription && (
                <Box>
                  <TextEditor
                    label={intl.formatMessage({ id: 'proposal.body' })}
                    name="body"
                    id="body"
                    placeholder={intl.formatMessage({ id: 'admin.content.start-writing' })}
                    required={proposalForm.descriptionMandatory}
                    noModalAdvancedEditor
                    platformLanguage="FR_FR"
                    selectedLanguage="FR_FR"
                  />
                  {proposalForm.descriptionHelpText && (
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      {proposalForm.descriptionHelpText}
                    </Text>
                  )}
                </Box>
              )}

              {/* Illustration */}
              {proposalForm.usingIllustration && (
                <FormControl name="media" control={control}>
                  <FormLabel htmlFor="media" label={intl.formatMessage({ id: 'proposal.media' })}>
                    <Text fontSize={CapUIFontSize.BodySmall} color="text.tertiary" lineHeight={1}>
                      {intl.formatMessage({ id: 'global.optional' })}
                    </Text>
                  </FormLabel>
                  <Text fontSize={CapUIFontSize.BodySmall} color="text.tertiary" lineHeight={1}>
                    {intl.formatMessage({ id: 'front.proposal-form.illustration-help-text' })}
                  </Text>
                  <FieldInput
                    isFullWidth
                    variantColor="default"
                    type="uploader"
                    control={control}
                    name="media"
                    id="media"
                    format=".jpg,.jpeg,.png"
                    maxFiles={1}
                    maxSize={4000000}
                    showThumbnail
                    size={UPLOADER_SIZE.LG}
                    uploadURI={UPLOAD_PATH}
                  />
                  {proposalForm.illustrationHelpText && (
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      {proposalForm.illustrationHelpText}
                    </Text>
                  )}
                </FormControl>
              )}

              {/* Questions */}
              {proposalForm.questions.map((question, idx) => {
                // Skip questions that are not available due to logic jumps
                if (!availableQuestionIds.has(question.id)) {
                  return null
                }

                const name = `responses.${idx}.value`
                const { type, title, required, helpText, description } = question

                const renderQuestionLabel = () => (
                  <>
                    <FormLabel htmlFor={name} label={title} />
                    {helpText && <FormGuideline>{helpText}</FormGuideline>}
                    {description && (
                      <Text color="gray.500" fontSize="sm" mb={2}>
                        {description}
                      </Text>
                    )}
                  </>
                )

                switch (type) {
                  case 'text':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput type="text" control={control} name={name} id={name} variantSize={CapInputSize.Md} />
                      </FormControl>
                    )
                  case 'textarea':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput type="textarea" control={control} name={name} id={name} rows={4} />
                      </FormControl>
                    )
                  case 'editor':
                    // WYSIWYG editor - using textarea as fallback
                    // TODO: Integrate Jodit editor when available
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput type="textarea" control={control} name={name} id={name} rows={6} />
                      </FormControl>
                    )
                  case 'select':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput
                          type="select"
                          control={control}
                          name={name}
                          id={name}
                          options={
                            question.choices?.edges?.map(({ node }) => ({
                              value: node.id,
                              label: node.title,
                            })) || []
                          }
                        />
                      </FormControl>
                    )
                  case 'radio':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput
                          type="radio"
                          control={control}
                          name={name}
                          id={name}
                          choices={
                            question.choices?.edges?.map(({ node }) => ({
                              id: node.id,
                              label: node.title,
                              useIdAsValue: true,
                            })) || []
                          }
                        />
                      </FormControl>
                    )
                  case 'button':
                    // Button type renders as clickable buttons with optional colors
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <ButtonChoices
                          name={name}
                          control={control}
                          choices={
                            question.choices?.edges?.map(({ node }) => ({
                              id: node.id,
                              label: node.title,
                              color: node.color,
                            })) || []
                          }
                        />
                      </FormControl>
                    )
                  case 'checkbox':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput
                          type="checkbox"
                          control={control}
                          name={name}
                          id={name}
                          choices={
                            question.choices?.edges?.map(({ node }) => ({
                              id: node.id,
                              label: node.title,
                              useIdAsValue: true,
                            })) || []
                          }
                        />
                      </FormControl>
                    )
                  case 'ranking':
                    // Ranking: users order choices by preference
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <RankingChoices
                          name={name}
                          control={control}
                          choices={
                            question.choices?.edges?.map(({ node }) => ({
                              id: node.id,
                              label: node.title,
                            })) || []
                          }
                        />
                      </FormControl>
                    )
                  case 'number':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput type="number" control={control} name={name} id={name} />
                      </FormControl>
                    )
                  case 'medias':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput
                          isFullWidth
                          type="uploader"
                          control={control}
                          name={name}
                          id={name}
                          format=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                          maxFiles={5}
                          maxSize={8000000}
                          showThumbnail
                          size={UPLOADER_SIZE.LG}
                          uploadURI={UPLOAD_PATH}
                        />
                      </FormControl>
                    )
                  case 'siret':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput
                          type="text"
                          control={control}
                          name={name}
                          id={name}
                          placeholder="12345678901234"
                          maxLength={14}
                          variantSize={CapInputSize.Md}
                        />
                      </FormControl>
                    )
                  case 'rna':
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <FieldInput
                          type="text"
                          control={control}
                          name={name}
                          id={name}
                          placeholder="W123456789"
                          maxLength={10}
                          variantSize={CapInputSize.Md}
                        />
                      </FormControl>
                    )
                  case 'majority':
                    // Majority decision: pre-defined 6-option colored scale
                    return (
                      <FormControl key={question.id} name={name} control={control} isRequired={required}>
                        {renderQuestionLabel()}
                        <Controller
                          name={name as any} // todo fix type
                          control={control}
                          render={({ field }) => (
                            <MajorityQuestion
                              selectedValue={typeof field.value === 'string' ? field.value : null}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </FormControl>
                    )
                  case 'section':
                    // Section is a visual divider, not a form field
                    return (
                      <Heading key={question.id} as="h3" fontSize="lg" mt={4} mb={2}>
                        {title}
                      </Heading>
                    )
                  default:
                    return null
                }
              })}

              {/* Social Media / External Links */}
              {(proposalForm.usingWebPage ||
                proposalForm.usingFacebook ||
                proposalForm.usingTwitter ||
                proposalForm.usingInstagram ||
                proposalForm.usingYoutube ||
                proposalForm.usingLinkedIn) && (
                <>
                  <Text fontWeight="600" fontSize="md" mt={4}>
                    {intl.formatMessage({ id: 'your-external-links' })}
                  </Text>

                  {proposalForm.usingWebPage && (
                    <FormControl name="webPageUrl" control={control}>
                      <FormLabel htmlFor="webPageUrl" label={intl.formatMessage({ id: 'form.label_website' })} />
                      <FieldInput
                        type="text"
                        control={control}
                        name="webPageUrl"
                        id="webPageUrl"
                        placeholder={intl.formatMessage({ id: 'your-url' })}
                      />
                    </FormControl>
                  )}

                  {proposalForm.usingTwitter && (
                    <FormControl name="twitterUrl" control={control}>
                      <FormLabel htmlFor="twitterUrl" label={intl.formatMessage({ id: 'share.twitter' })} />
                      <FieldInput
                        type="text"
                        control={control}
                        name="twitterUrl"
                        id="twitterUrl"
                        placeholder="https://x.com/pseudo"
                      />
                    </FormControl>
                  )}

                  {proposalForm.usingFacebook && (
                    <FormControl name="facebookUrl" control={control}>
                      <FormLabel htmlFor="facebookUrl" label={intl.formatMessage({ id: 'share.facebook' })} />
                      <FieldInput
                        type="text"
                        control={control}
                        name="facebookUrl"
                        id="facebookUrl"
                        placeholder="https://facebook.com/pseudo"
                      />
                    </FormControl>
                  )}

                  {proposalForm.usingInstagram && (
                    <FormControl name="instagramUrl" control={control}>
                      <FormLabel htmlFor="instagramUrl" label={intl.formatMessage({ id: 'instagram' })} />
                      <FieldInput
                        type="text"
                        control={control}
                        name="instagramUrl"
                        id="instagramUrl"
                        placeholder="https://instagram.com/pseudo"
                      />
                    </FormControl>
                  )}

                  {proposalForm.usingLinkedIn && (
                    <FormControl name="linkedInUrl" control={control}>
                      <FormLabel htmlFor="linkedInUrl" label={intl.formatMessage({ id: 'share.linkedin' })} />
                      <FieldInput
                        type="text"
                        control={control}
                        name="linkedInUrl"
                        id="linkedInUrl"
                        placeholder="https://linkedin.com/in/pseudo"
                      />
                    </FormControl>
                  )}

                  {proposalForm.usingYoutube && (
                    <FormControl name="youtubeUrl" control={control}>
                      <FormLabel htmlFor="youtubeUrl" label={intl.formatMessage({ id: 'youtube' })} />
                      <FieldInput
                        type="text"
                        control={control}
                        name="youtubeUrl"
                        id="youtubeUrl"
                        placeholder="https://youtube.com/channel/pseudo"
                      />
                    </FormControl>
                  )}
                </>
              )}

              {/* Debug: Logic Jump Info */}
              <pre
                style={{
                  fontSize: '10px',
                  background: '#f0f0f0',
                  padding: '8px',
                  overflow: 'auto',
                  maxHeight: '300px',
                }}
              >
                {JSON.stringify(
                  {
                    questionsCount: proposalForm.questions.length,
                    questionsWithJumps: proposalForm.questions
                      .filter(q => q.jumps.length > 0)
                      .map(q => ({
                        id: q.id,
                        title: q.title,
                        jumps: q.jumps,
                      })),
                    availableQuestionIds: Array.from(availableQuestionIds),
                    responses: watchedResponses,
                  },
                  null,
                  2,
                )}
              </pre>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variantSize="big"
              variant="secondary"
              isLoading={isSubmitting}
              onClick={handleSubmit(data => onSubmit(data, true, hide))}
            >
              {intl.formatMessage({ id: 'global.save_as_draft' })}
            </Button>

            <Button
              variantSize="big"
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleSubmit(data => onSubmit(data, false, hide))}
            >
              {intl.formatMessage({ id: 'front.collect.submit-proposal' })}
            </Button>
          </Modal.Footer>
        </FormProvider>
      )}
    </Modal>
  )
}

export default ProposalCreateModal
