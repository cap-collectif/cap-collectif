import { Button, CapUIIcon, CapUIModalSize, Flex, Heading, Modal } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import { yupResolver } from '@hookform/resolvers/yup'
import ChangeProposalContentMutation from '@mutations/ChangeProposalContentMutation'
import CreateProposalMutation from '@mutations/CreateProposalMutation'
import { ProposalFormModalThemesQuery } from '@relay/ProposalFormModalThemesQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { isResponseValueEmpty } from '@shared/utils/isResponseValueEmpty'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import * as React from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import { SubmitButtonType } from '../VoteStep.type'
import ExternalLinks from './ExternalLinks'
import {
  AddressInput,
  CategoryInput,
  DescriptionInput,
  DistrictInput,
  IllustrationInput,
  SummaryInput,
  ThemeInput,
  TitleInput,
} from './Inputs'
import { CreateModeProps, EditModeProps, FormValues } from './ProposalFormModal.type'
import QuestionField from './Questions/QuestionField'
import {
  createProposalSchema,
  getAvailableQuestionIds,
  getChoiceLabelById,
  parseResponseValue,
  validateCheckboxRules,
} from './utils'

const THEMES_QUERY = graphql`
  query ProposalFormModalThemesQuery {
    themes {
      id
      title
    }
    platformLocales: availableLocales(includeDisabled: false) {
      code
      isDefault
    }
  }
`

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
      ... on SimpleQuestion {
        isRangeBetween
        rangeMin
        rangeMax
      }
      ... on MultipleChoiceQuestion {
        isOtherAllowed
        groupedResponsesEnabled
        responseColorsDisabled
        validationRule {
          type
          number
        }
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

type Props = CreateModeProps | EditModeProps

const ProposalFormModal: React.FC<Props> = props => {
  const { mode, proposalForm: proposalFormKey } = props
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const proposalForm = useFragment(PROPOSAL_FORM_FRAGMENT, proposalFormKey)
  const proposal = useFragment(PROPOSAL_FRAGMENT, mode === 'edit' ? props.proposal : null)
  const addressJsonRef = React.useRef<any>(null)
  const submitButtonRef = React.useRef<SubmitButtonType | null>(null)

  // Initialize addressJsonRef with existing address data when editing
  React.useEffect(() => {
    if (mode === 'edit' && proposal?.address?.json) {
      try {
        const addressArray = JSON.parse(proposal.address.json)
        if (Array.isArray(addressArray) && addressArray.length > 0) {
          addressJsonRef.current = addressArray[0]
        }
      } catch (err) {
        // Invalid JSON, ignore
      }
    }
  }, [mode, proposal?.address?.json])
  const themesEnabled = useFeatureFlag('themes')
  const themesData = useLazyLoadQuery<ProposalFormModalThemesQuery>(
    THEMES_QUERY,
    {},
    { fetchPolicy: 'store-or-network' },
  )
  const themes = themesData?.themes ?? []
  const platformLocales = themesData?.platformLocales ?? []
  const defaultLocale = platformLocales.find(locale => locale.isDefault)?.code ?? 'FR_FR'

  const defaultValues = React.useMemo(() => {
    if (mode === 'edit' && proposal) {
      const responsesMap = new Map()
      proposal.responses?.forEach((response: any) => {
        if (response.question?.id) {
          responsesMap.set(response.question.id, response)
        }
      })

      // Parse responses and collect "other" values
      const parsedResponses: { question: string; value: any }[] = []
      const otherValues: Record<string, string> = {}

      proposalForm.questions.forEach((question: any, idx: number) => {
        const parsed = parseResponseValue(responsesMap.get(question.id), question)
        parsedResponses.push({
          question: question.id,
          value: parsed.value,
        })
        if (parsed.otherValue) {
          otherValues[`responses.${idx}.value-other-value`] = parsed.otherValue
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
        responses: parsedResponses,
        webPageUrl: proposal.webPageUrl || '',
        facebookUrl: proposal.facebookUrl || '',
        twitterUrl: proposal.twitterUrl || '',
        instagramUrl: proposal.instagramUrl || '',
        youtubeUrl: proposal.youtubeUrl || '',
        linkedInUrl: proposal.linkedInUrl || '',
        ...otherValues,
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
    resolver: yupResolver(createProposalSchema(proposalForm, intl)),
  })

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    formState: { isSubmitting },
  } = methods

  const watchedResponses = useWatch({ control, name: 'responses' })

  const availableQuestionIds = React.useMemo(
    () => getAvailableQuestionIds(proposalForm.questions, watchedResponses || []),
    [proposalForm.questions, watchedResponses],
  )

  const validateRequiredQuestions = (data: FormValues): boolean => {
    let isValid = true
    const errorMessage = intl.formatMessage({ id: 'fill-field' })

    proposalForm.questions.forEach((question: any, idx: number) => {
      if (!question.required) return
      if (!availableQuestionIds.has(question.id)) return

      const value = data.responses[idx]?.value

      const isEmpty =
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        isWYSIWYGContentEmpty(value as string)

      if (isEmpty) {
        const fieldName = `responses.${idx}.value` as any
        setValue(fieldName, value, { shouldTouch: true })
        setError(fieldName, { type: 'manual', message: errorMessage })
        isValid = false
      }
    })

    return isValid
  }

  const touchErrorFields = () => {
    const errors = methods.formState.errors
    Object.entries(errors).forEach(([key, error]) => {
      if (key === 'responses') return
      setValue(key as any, getValues(key as any), { shouldTouch: true })
      if (error?.message) {
        setError(key as any, { type: 'manual', message: error.message as string })
      }
    })
  }

  const handleSaveAsDraft = (hide?: () => void) => {
    handleSubmit(
      data => {
        onSubmit(data, true, hide)
      },
      () => touchErrorFields(),
    )()
  }

  const validateCheckboxQuestions = (data: FormValues): boolean => {
    // Build responses with other values for validation
    const responsesWithOther = data.responses.map((response, idx) => ({
      ...response,
      'value-other-value': getValues(`responses.${idx}.value-other-value` as any) as string | undefined,
    }))

    const checkboxErrors = validateCheckboxRules(proposalForm.questions, responsesWithOther, availableQuestionIds, intl)

    checkboxErrors.forEach(error => {
      // Touch the field so the error is displayed (FormControl checks touched state in onChange mode)
      setValue(error.fieldName as any, getValues(error.fieldName as any), { shouldTouch: true })
      setError(error.fieldName as any, { type: 'manual', message: error.message })
    })

    return checkboxErrors.length === 0
  }

  const handlePublish = async (hide?: () => void) => {
    const isSchemaValid = await methods.trigger()
    if (!isSchemaValid) touchErrorFields()
    const data = getValues() as FormValues
    const areRequiredValid = validateRequiredQuestions(data)
    const areCheckboxRulesValid = validateCheckboxQuestions(data)
    if (!isSchemaValid || !areRequiredValid || !areCheckboxRulesValid) return
    handleSubmit(validData => onSubmit(validData, false, hide))()
  }

  const onSubmit = async (data: FormValues, isDraft = false, hide?: () => void) => {
    try {
      const formattedResponses = data.responses
        .filter(response => {
          if (!availableQuestionIds.has(response.question)) return false
          // For drafts, only send responses that have actual values
          // For publish, also include required questions (validation ensures they have values)
          if (isResponseValueEmpty(response.value)) {
            return false
          }
          return true
        })
        .map(response => {
          const question = proposalForm.questions.find((q: any) => q.id === response.question)

          if (question?.type === 'medias') {
            let medias: string[] = []
            if (Array.isArray(response.value)) {
              medias = response.value.map((media: any) => (typeof media === 'object' ? media.id : media))
            } else if (response.value && typeof response.value === 'object' && 'id' in response.value) {
              medias = [(response.value as any).id]
            }
            return {
              question: response.question,
              medias,
            }
          }

          let formattedValue = response.value

          // Handle select questions - need to convert ID to label
          if (question?.type === 'select' && typeof formattedValue === 'string') {
            const label = getChoiceLabelById(question, formattedValue)
            return {
              question: response.question,
              value: label || formattedValue,
            }
          }

          // Handle radio questions - single choice, format as { labels: [label], other: value }
          if (question?.type === 'radio' && typeof formattedValue === 'string') {
            const questionIdx = proposalForm.questions.findIndex((q: any) => q.id === question.id)
            const otherValue = getValues(`responses.${questionIdx}.value-other-value` as any) as string | undefined
            if (formattedValue === 'other') {
              return {
                question: response.question,
                value: JSON.stringify({ labels: [], other: otherValue || null }),
              }
            }
            const label = getChoiceLabelById(question, formattedValue)
            return {
              question: response.question,
              value: JSON.stringify({ labels: label ? [label] : [], other: null }),
            }
          }

          // Handle checkbox questions - multiple choices, format as { labels: [...], other: value }
          if (question?.type === 'checkbox' && Array.isArray(formattedValue)) {
            const questionIdx = proposalForm.questions.findIndex((q: any) => q.id === question.id)
            const otherValue = getValues(`responses.${questionIdx}.value-other-value` as any) as string | undefined
            const hasOther = formattedValue.includes('other')
            const labels = formattedValue
              .filter((id: string) => id !== 'other')
              .map((id: string) => getChoiceLabelById(question, id))
              .filter(Boolean) as string[]
            return {
              question: response.question,
              value: JSON.stringify({ labels, other: hasOther ? otherValue || null : null }),
            }
          }

          // Handle button questions - format as { labels: [label], other: null }
          if (question?.type === 'button' && typeof formattedValue === 'string') {
            const label = getChoiceLabelById(question, formattedValue)
            return {
              question: response.question,
              value: JSON.stringify({ labels: label ? [label] : [], other: null }),
            }
          }

          // Handle ranking questions - format as { labels: [...], other: null }
          if (question?.type === 'ranking' && Array.isArray(formattedValue)) {
            const labels = formattedValue
              .map((id: string) => getChoiceLabelById(question, id))
              .filter(Boolean) as string[]
            return {
              question: response.question,
              value: JSON.stringify({ labels, other: null }),
            }
          }

          if (typeof formattedValue === 'object' && formattedValue !== null && 'value' in formattedValue) {
            formattedValue = (formattedValue as { value: string }).value
          }

          return {
            question: response.question,
            value: formattedValue,
          }
        })

      const formattedAddress = addressJsonRef.current ? JSON.stringify([addressJsonRef.current]) : null

      const input = {
        draft: isDraft,
        title: data.title,
        ...(!isWYSIWYGContentEmpty(data.body) && { body: data.body }),
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

      if (mode === 'edit' && proposal) {
        const editModeInput = { id: proposal.id, ...input }

        const response = await ChangeProposalContentMutation.commit({ input: editModeInput })

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
        const createModeInput = { proposalFormId: proposalForm.id, ...input }

        const response = await CreateProposalMutation.commit({
          variables: {
            input: createModeInput,
            stepId: props.stepId,
            isAuthenticated: viewerSession != null,
          },
          stepId: props.stepId,
        })

        if (response.createProposal.userErrors?.length > 0) {
          return mutationErrorToast(intl)
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

  const renderFormContent = (hide?: () => void) => (
    <FormProvider {...methods}>
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: mode === 'edit' ? 'global.edit' : 'proposal.add' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Flex as="form" direction="column" gap={4}>
          <TitleInput
            control={control}
            objectType={proposalForm.objectType}
            titleHelpText={proposalForm.titleHelpText}
          />

          {proposalForm.usingSummary && (
            <SummaryInput control={control} summaryHelpText={proposalForm.summaryHelpText} />
          )}

          {/* Themes */}
          {themesEnabled && proposalForm.usingThemes && themes.length > 0 && (
            <ThemeInput
              control={control}
              themes={themes}
              themeHelpText={proposalForm.themeHelpText}
              themeMandatory={proposalForm.themeMandatory}
            />
          )}

          {proposalForm.usingCategories && proposalForm.categories.length > 0 && (
            <CategoryInput
              control={control}
              categories={proposalForm.categories}
              categoryHelpText={proposalForm.categoryHelpText}
            />
          )}

          {proposalForm.usingAddress && (
            <AddressInput
              control={control}
              addressHelpText={proposalForm.addressHelpText}
              showLocateButton={mode === 'create'}
              onAddressChange={address => {
                addressJsonRef.current = address
              }}
            />
          )}

          {proposalForm.usingDistrict && proposalForm.districts.length > 0 && (
            <DistrictInput
              control={control}
              districts={proposalForm.districts}
              districtHelpText={proposalForm.districtHelpText}
              districtMandatory={proposalForm.districtMandatory}
            />
          )}

          {proposalForm.usingDescription && (
            <DescriptionInput
              descriptionMandatory={proposalForm.descriptionMandatory}
              descriptionHelpText={proposalForm.descriptionHelpText}
              defaultLocale={defaultLocale}
            />
          )}

          {proposalForm.usingIllustration && (
            <IllustrationInput control={control} illustrationHelpText={proposalForm.illustrationHelpText} />
          )}

          {/* Questions */}
          {proposalForm.questions.map((question: any, idx: number) => {
            if (!availableQuestionIds.has(question.id)) {
              return null
            }

            return (
              <QuestionField key={question.id} question={question} name={`responses.${idx}.value`} control={control} />
            )
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
            handleSaveAsDraft(hide)
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
            handlePublish(hide)
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
