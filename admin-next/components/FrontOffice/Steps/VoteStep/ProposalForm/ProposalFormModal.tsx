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
  Modal,
  Spinner,
  Text,
  UPLOADER_SIZE,
} from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import ChangeProposalContentMutation from '@mutations/ChangeProposalContentMutation'
import CreateProposalMutation from '@mutations/CreateProposalMutation'
import MajorityQuestion from '@shared/ui/MajorityQuestion/MajorityQuestion'
import { isResponseValueEmpty } from '@shared/utils/isResponseValueEmpty'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { dangerToast, mutationErrorToast, successToast } from '@shared/utils/toasts'
import { UPLOAD_PATH } from '@utils/config'
import { formatConnectionPath } from '@utils/relay'
import * as React from 'react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { SubmitButtonType } from '../VoteStep.type'
import ExternalLinks from './ExternalLinks'
import { FormValues } from './ProposalFormModal.type'
import ButtonChoices from './Questions/ButtonChoices'
import MultipleChoiceQuestion from './Questions/MultipleChoiceQuestion'
import RankingChoices from './Questions/RankingChoices'
import { getAvailableQuestionIds } from './utils'

const PROPOSAL_FORM_FRAGMENT = graphql`
  fragment ProposalFormModal_proposalForm on ProposalForm {
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
              description
              color
              image {
                id
                url
              }
            }
          }
        }
      }
    }
  }
`

const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalFormModal_proposal on Proposal {
    id
    title
    body
    summary
    publicationStatus
    category {
      id
    }
    district {
      id
    }
    theme {
      id
    }
    address {
      json
      formatted
    }
    media {
      id
      name
      url
    }
    responses {
      ... on ValueResponse {
        question {
          id
        }
        value
      }
      ... on MediaResponse {
        question {
          id
        }
        medias {
          id
          name
          url
        }
      }
    }
    webPageUrl
    facebookUrl
    twitterUrl
    instagramUrl
    youtubeUrl
    linkedInUrl
  }
`

type CreateModeProps = {
  mode: 'create'
  disabled: boolean
  proposalForm: any
  stepId: string
  proposal?: never
  onClose?: never
}

type EditModeProps = {
  mode: 'edit'
  proposal: any
  proposalForm: any
  onClose: () => void
  disabled?: never
  stepId?: never
}

type Props = CreateModeProps | EditModeProps

const parseResponseValue = (response: any) => {
  if (!response) return null

  if (response.medias) {
    return response.medias.map((m: any) => ({ id: m.id, name: m.name, url: m.url }))
  }

  if (response.value !== undefined) {
    // Try to parse JSON for array values (checkbox, ranking)
    if (typeof response.value === 'string') {
      try {
        const parsed = JSON.parse(response.value)
        if (Array.isArray(parsed)) {
          return parsed
        }
      } catch {
        // Not JSON, return as-is
      }
    }
    return response.value
  }

  return null
}

const ProposalFormModal: React.FC<Props> = props => {
  const { mode, proposalForm: proposalFormKey } = props
  const intl = useIntl()
  const proposalForm = useFragment(PROPOSAL_FORM_FRAGMENT, proposalFormKey)
  const proposal = useFragment(PROPOSAL_FRAGMENT, mode === 'edit' ? props.proposal : null)
  const addressJsonRef = React.useRef<any>(null)
  const submitButtonRef = React.useRef<SubmitButtonType | null>(null)

  const defaultValues = React.useMemo(() => {
    if (mode === 'edit' && proposal) {
      const responsesMap = new Map()
      proposal.responses?.forEach((response: any) => {
        if (response.question?.id) {
          responsesMap.set(response.question.id, response)
        }
      })

      return {
        title: proposal.title || '',
        summary: proposal.summary || '',
        body: proposal.body || '',
        theme: proposal.theme?.id || '',
        category: proposal.category?.id || '',
        district: proposal.district?.id || '',
        address: proposal.address?.formatted || '',
        media: proposal.media ? { id: proposal.media.id, url: proposal.media.url } : null,
        responses: proposalForm.questions.map((question: any) => ({
          question: question.id,
          value: parseResponseValue(responsesMap.get(question.id)),
        })),
        webPageUrl: proposal.webPageUrl || '',
        facebookUrl: proposal.facebookUrl || '',
        twitterUrl: proposal.twitterUrl || '',
        instagramUrl: proposal.instagramUrl || '',
        youtubeUrl: proposal.youtubeUrl || '',
        linkedInUrl: proposal.linkedInUrl || '',
      }
    }

    // Create mode: empty defaults
    return {
      title: '',
      summary: '',
      body: '',
      theme: '',
      category: '',
      district: '',
      address: '',
      media: null,
      responses: proposalForm.questions.map((question: any) => ({
        question: question.id,
        value: null,
      })),
      webPageUrl: '',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      linkedInUrl: '',
    }
  }, [mode, proposal, proposalForm.questions])

  const methods = useForm<FormValues>({
    mode: 'onChange',
    defaultValues,
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods

  const watchedResponses = useWatch({ control, name: 'responses' })

  const availableQuestionIds = React.useMemo(
    () => getAvailableQuestionIds(proposalForm.questions, watchedResponses || []),
    [proposalForm.questions, watchedResponses],
  )

  const onSubmit = async (data: FormValues, isDraft = false, hide?: () => void) => {
    try {
      const formattedResponses = data.responses
        .filter(response => {
          if (!availableQuestionIds.has(response.question)) return false
          const question = proposalForm.questions.find((q: any) => q.id === response.question)
          if (!question?.required && isResponseValueEmpty(response.value)) {
            return false
          }
          return true
        })
        .map(response => {
          const question = proposalForm.questions.find((q: any) => q.id === response.question)

          if (question?.type === 'medias' && Array.isArray(response.value)) {
            return {
              question: response.question,
              medias: response.value.map((media: any) => (typeof media === 'object' ? media.id : media)),
            }
          }

          let formattedValue = response.value
          if (typeof formattedValue === 'object' && formattedValue !== null && 'value' in formattedValue) {
            formattedValue = (formattedValue as { value: string }).value
          }

          return {
            question: response.question,
            value: formattedValue,
          }
        })

      const formattedAddress = addressJsonRef.current ? JSON.stringify([addressJsonRef.current]) : null

      if (mode === 'edit' && proposal) {
        const input = {
          id: proposal.id,
          draft: isDraft,
          title: data.title,
          ...(data.body !== undefined && { body: data.body }),
          ...(data.summary && { summary: data.summary }),
          ...(data.theme && { theme: data.theme }),
          ...(data.category && { category: data.category }),
          ...(data.district && { district: data.district }),
          ...(formattedAddress && { address: formattedAddress }),
          ...(data.media && { media: data.media.id }),
          ...(formattedResponses.length > 0 && { responses: formattedResponses }),
          ...(data.webPageUrl && { webPageUrl: data.webPageUrl }),
          ...(data.facebookUrl && { facebookUrl: data.facebookUrl }),
          ...(data.twitterUrl && { twitterUrl: data.twitterUrl }),
          ...(data.instagramUrl && { instagramUrl: data.instagramUrl }),
          ...(data.youtubeUrl && { youtubeUrl: data.youtubeUrl }),
          ...(data.linkedInUrl && { linkedInUrl: data.linkedInUrl }),
        }

        const response = await ChangeProposalContentMutation.commit({ input })

        if (response.changeProposalContent?.proposal) {
          successToast(
            intl.formatMessage(
              { id: isDraft ? 'proposal-draft-saved' : 'proposal-published-successfully' },
              { title: response.changeProposalContent.proposal.title },
            ),
          )
          props.onClose()
        }
      } else {
        const input = {
          proposalFormId: proposalForm.id,
          draft: isDraft,
          title: data.title,
          ...(data.body && { body: data.body }),
          ...(data.summary && { summary: data.summary }),
          ...(data.theme && { theme: data.theme }),
          ...(data.category && { category: data.category }),
          ...(data.district && { district: data.district }),
          ...(formattedAddress && { address: formattedAddress }),
          ...(data.media && { media: data.media.id }),
          ...(formattedResponses.length > 0 && { responses: formattedResponses }),
          ...(data.webPageUrl && { webPageUrl: data.webPageUrl }),
          ...(data.facebookUrl && { facebookUrl: data.facebookUrl }),
          ...(data.twitterUrl && { twitterUrl: data.twitterUrl }),
          ...(data.instagramUrl && { instagramUrl: data.instagramUrl }),
          ...(data.youtubeUrl && { youtubeUrl: data.youtubeUrl }),
          ...(data.linkedInUrl && { linkedInUrl: data.linkedInUrl }),
        }

        const connectionId = formatConnectionPath([props.stepId], 'ProposalsList_proposals')
        const response = await CreateProposalMutation.commit({
          input,
          connections: isDraft ? [] : [connectionId],
          stepId: props.stepId,
        })

        if (response.createProposal.userErrors?.length > 0) {
          const errorMessage = response.createProposal.userErrors.map(e => e.message).join(', ')
          return dangerToast(errorMessage)
        }

        if (response.createProposal?.proposal) {
          successToast(
            intl.formatMessage(
              { id: isDraft ? 'proposal-draft-saved' : 'proposal-created-successfully' },
              { title: response.createProposal.proposal.title },
            ),
          )
          reset()
          hide?.()
        }
      }
    } catch (error) {
      mutationErrorToast(intl)
    }
  }

  const getTitleLabel = () => {
    if (proposalForm.objectType === 'PROPOSAL') return 'global.title'
    if (proposalForm.objectType === 'OPINION') return 'opinion-title'
    return 'title'
  }

  const renderFormContent = (hide?: () => void) => (
    <FormProvider {...methods}>
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: mode === 'edit' ? 'global.edit' : 'proposal.add' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Flex as="form" direction="column" gap={4}>
          {/* Title */}
          <FormControl name="title" control={control}>
            <FormLabel htmlFor="title" label={intl.formatMessage({ id: getTitleLabel() })} />
            <FieldInput type="text" control={control} name="title" id="title" />
            {proposalForm.titleHelpText && (
              <Text color="text.tertiary" fontSize="sm" mt={1}>
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
                <Text color="text.tertiary" fontSize="sm" mt={1}>
                  {proposalForm.summaryHelpText}
                </Text>
              )}
            </FormControl>
          )}

          {/* Category */}
          {proposalForm.usingCategories && proposalForm.categories.length > 0 && (
            <FormControl name="category" control={control}>
              <FormLabel htmlFor="category" label={intl.formatMessage({ id: 'global.category' })} />
              <FieldInput
                type="select"
                control={control}
                name="category"
                id="category"
                placeholder={intl.formatMessage({ id: 'proposal.select.category' })}
                options={proposalForm.categories.map((cat: any) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
              />
              {proposalForm.categoryHelpText && (
                <Text color="text.tertiary" fontSize="sm" mt={1}>
                  {proposalForm.categoryHelpText}
                </Text>
              )}
            </FormControl>
          )}

          {/* Address */}
          {proposalForm.usingAddress && (
            <FormControl name="address" control={control}>
              <FormLabel label={intl.formatMessage({ id: 'proposal_form.address' })} htmlFor="address" />
              <Flex align="center" gap={2} p={2} border="1px solid" borderColor="gray.200" borderRadius="normal">
                <Spinner size={CapUIIconSize.Sm} />
                <Text color="text.tertiary" fontSize="sm">
                  {intl.formatMessage({ id: 'global.loading' })}
                </Text>
              </Flex>
              {proposalForm.addressHelpText && (
                <Text color="text.tertiary" fontSize="sm" mt={1}>
                  {proposalForm.addressHelpText}
                </Text>
              )}
            </FormControl>
          )}

          {/* Locate on map button - only in create mode */}
          {mode === 'create' && proposalForm.usingAddress && (
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
                options={proposalForm.districts.map((district: any) => ({
                  label: district.name,
                  value: district.id,
                }))}
              />
              {proposalForm.districtHelpText && (
                <Text color="text.tertiary" fontSize="sm" mt={1}>
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
                <Text color="text.tertiary" fontSize="sm" mt={1}>
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
                <Text color="text.tertiary" fontSize="sm" mt={1}>
                  {proposalForm.illustrationHelpText}
                </Text>
              )}
            </FormControl>
          )}

          {/* Questions */}
          {proposalForm.questions.map((question: any, idx: number) => {
            if (!availableQuestionIds.has(question.id)) {
              return null
            }

            const name = `responses.${idx}.value`
            const { type, title, helpText, description } = question

            const renderQuestionLabel = () => (
              <>
                <FormLabel htmlFor={name} label={title} />
                {helpText && <FormGuideline>{helpText}</FormGuideline>}
                {description && !isWYSIWYGContentEmpty(description) && (
                  <Text color="text.tertiary" fontSize="sm" mb={2} dangerouslySetInnerHTML={{ __html: description }} />
                )}
              </>
            )

            switch (type) {
              case 'text':
                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <FieldInput type="text" control={control} name={name} id={name} variantSize={CapInputSize.Md} />
                  </FormControl>
                )
              case 'textarea':
                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <FieldInput type="textarea" control={control} name={name} id={name} rows={4} />
                  </FormControl>
                )
              case 'editor':
                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <FieldInput type="textarea" control={control} name={name} id={name} rows={6} />
                  </FormControl>
                )
              case 'select':
                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <FieldInput
                      type="select"
                      control={control}
                      name={name}
                      id={name}
                      options={
                        question.choices?.edges
                          ?.filter((edge: any) => edge?.node)
                          .map(({ node }: any) => ({
                            value: node.id,
                            label: node.title,
                          })) || []
                      }
                    />
                  </FormControl>
                )
              case 'radio': {
                const choices =
                  question.choices?.edges
                    ?.filter((edge: any) => edge?.node)
                    .map(({ node }: any) => ({
                      id: node.id,
                      label: node.title,
                      description: node.description,
                      image: node.image,
                    })) || []

                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <MultipleChoiceQuestion
                      name={name}
                      control={control}
                      choices={choices}
                      isOtherAllowed={question?.isOtherAllowed ?? false}
                    />
                  </FormControl>
                )
              }
              case 'button':
                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <ButtonChoices
                      name={name}
                      control={control}
                      choices={
                        question.choices?.edges
                          ?.filter((edge: any) => edge?.node)
                          .map(({ node }: any) => ({
                            id: node.id,
                            label: node.title,
                            color: node.color,
                            image: node.image,
                          })) || []
                      }
                    />
                  </FormControl>
                )
              case 'checkbox': {
                const choices =
                  question.choices?.edges
                    ?.filter((edge: any) => edge?.node)
                    .map(({ node }: any) => ({
                      id: node.id,
                      label: node.title,
                      description: node.description,
                      image: node.image,
                    })) || []

                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <MultipleChoiceQuestion
                      name={name}
                      control={control}
                      choices={choices}
                      isOtherAllowed={question?.isOtherAllowed ?? false}
                      isMultiple
                    />
                  </FormControl>
                )
              }
              case 'ranking':
                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <RankingChoices
                      name={name}
                      control={control}
                      choices={
                        question.choices?.edges
                          ?.filter((edge: any) => edge?.node)
                          .map(({ node }: any) => ({
                            id: node.id,
                            label: node.title,
                            image: node.image,
                          })) || []
                      }
                    />
                  </FormControl>
                )
              case 'number':
                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <FieldInput type="number" control={control} name={name} id={name} />
                  </FormControl>
                )
              case 'medias':
                return (
                  <FormControl key={question.id} name={name} control={control}>
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
                  <FormControl key={question.id} name={name} control={control}>
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
                  <FormControl key={question.id} name={name} control={control}>
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
                return (
                  <FormControl key={question.id} name={name} control={control}>
                    {renderQuestionLabel()}
                    <Controller
                      name={name as any}
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
          <ExternalLinks
            usingWebPage={proposalForm.usingWebPage}
            usingFacebook={proposalForm.usingFacebook}
            usingTwitter={proposalForm.usingTwitter}
            usingInstagram={proposalForm.usingInstagram}
            usingYoutube={proposalForm.usingYoutube}
            usingLinkedIn={proposalForm.usingLinkedIn}
          />
        </Flex>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variantSize="big"
          variant="secondary"
          isLoading={isSubmitting && submitButtonRef.current === 'save-as-draft'}
          onClick={() => {
            submitButtonRef.current = 'save-as-draft'
            handleSubmit(data => onSubmit(data, true, hide))()
          }}
        >
          {intl.formatMessage({ id: 'global.save_as_draft' })}
        </Button>

        <Button
          type="button"
          variantSize="big"
          variant="primary"
          isLoading={isSubmitting && submitButtonRef.current === 'publish'}
          onClick={() => {
            submitButtonRef.current = 'publish'
            handleSubmit(data => onSubmit(data, false, hide))()
          }}
        >
          {intl.formatMessage({ id: mode === 'edit' ? 'global.publish' : 'front.collect.submit-proposal' })}
        </Button>
      </Modal.Footer>
    </FormProvider>
  )

  if (mode === 'edit') {
    return (
      <Modal
        show
        ariaLabel={intl.formatMessage({ id: 'global.edit' })}
        size={CapUIModalSize.Xl}
        onClose={props.onClose}
        hideOnClickOutside={false}
      >
        {renderFormContent()}
      </Modal>
    )
  }

  return (
    <Modal
      disclosure={
        <Button disabled={props.disabled} flex="none" variant="primary" leftIcon={CapUIIcon.Add}>
          {intl.formatMessage({ id: 'front.collect.proposal-submit' })}
        </Button>
      }
      ariaLabel={intl.formatMessage({ id: 'proposal.submit' })}
      size={CapUIModalSize.Xl}
      onClose={reset}
      hideOnClickOutside={false}
    >
      {({ hide }) => renderFormContent(hide)}
    </Modal>
  )
}

export default ProposalFormModal
