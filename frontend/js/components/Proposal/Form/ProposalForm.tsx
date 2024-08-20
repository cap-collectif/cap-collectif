import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'
import { change, reset, SubmissionError, reduxForm, Field, FieldArray, formValueSelector } from 'redux-form'
import { createFragmentContainer, fetchQuery_DEPRECATED, graphql } from 'react-relay'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Alert, Collapse, ListGroup, ListGroupItem, Panel, Glyphicon, Button } from 'react-bootstrap'

import styled from 'styled-components'
import { toast, Button as DsButton, Text, Icon, CapUIIcon, CapUIIconSize } from '@cap-collectif/ui'
import { styleGuideColors } from '~/utils/colors'
import component from '~/components/Form/Field'
import type {
  ProposalFormSearchProposalsQuery$data,
  ProposalFormSearchProposalsQuery$variables,
} from '~relay/ProposalFormSearchProposalsQuery.graphql'
import type {
  ProposalFormAvailableDistrictsForLocalisationQuery$data,
  ProposalFormAvailableDistrictsForLocalisationQuery$variables,
} from '~relay/ProposalFormAvailableDistrictsForLocalisationQuery.graphql'
import type { ProposalForm_proposal$data } from '~relay/ProposalForm_proposal.graphql'
import type { ProposalForm_proposalForm$data } from '~relay/ProposalForm_proposalForm.graphql'
import type { GlobalState, Dispatch, FeatureToggles, Uuid } from '~/types'
import CreateProposalMutation from '~/mutations/CreateProposalMutation'
import type { CreateProposalMutation$data } from '~relay/CreateProposalMutation.graphql'
import ChangeProposalContentMutation from '~/mutations/ChangeProposalContentMutation'
import environment from '~/createRelayEnvironment'
import { validateProposalContent } from '../Admin/ProposalAdminContentForm'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import type { ResponsesInReduxForm } from '~/components/Form/Form.type'
import { isInterpellationContextFromProposal, isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper'
import formatSubmitResponses from '~/utils/form/formatSubmitResponses'
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues'
import renderResponses from '~/components/Form/RenderResponses'
import type { AddressComplete } from '~/components/Form/Address/Address.type'
import type { GeoJson } from '~/utils/geojson'
import { formatGeoJsons, geoContains } from '~/utils/geojson'
import { ProposalFormMapPreview } from './ProposalFormMapPreview'
import UserListField from '~/components/Admin/Field/UserListField'
import { mapOpenPopup } from '~/components/Proposal/Map/Map.events'
import type { CreateProposalInput } from '~relay/CreateProposalMutation.graphql'
import type { ChangeProposalContentInput } from '~relay/ChangeProposalContentMutation.graphql'
import { getAvailabeQuestionsCacheKey } from '~/utils/questionsCacheKey'
import scrollToFormError from '~/components/Proposal/Form/ProposalForm.utils'

const SELECT_DISTRICT = '-1'

const getAvailableDistrictsQuery = graphql`
  query ProposalFormAvailableDistrictsForLocalisationQuery(
    $proposalFormId: ID!
    $latitude: Float!
    $longitude: Float!
  ) {
    availableDistrictsForLocalisation(proposalFormId: $proposalFormId, latitude: $latitude, longitude: $longitude) {
      id
      name
    }
  }
`
const searchProposalsQuery = graphql`
  query ProposalFormSearchProposalsQuery($proposalFormId: ID!, $term: String!) {
    form: node(id: $proposalFormId) {
      ... on ProposalForm {
        proposals(term: $term, first: 5) {
          edges {
            node {
              id
              title
              url
            }
          }
        }
      }
    }
  }
`
type LatLng = {
  readonly lat: number
  readonly lng: number
}
export const formName = 'proposal-form'
export const EDIT_MODAL_ANCHOR = '#edit-proposal'
type RelayProps = {
  readonly proposalForm: ProposalForm_proposalForm$data
  readonly proposal: ProposalForm_proposal$data | null | undefined
}
export type Props = ReduxFormFormProps &
  RelayProps & {
    readonly intl: IntlShape
    readonly themes: Array<Record<string, any>>
    readonly dispatch: Dispatch
    readonly features: FeatureToggles
    readonly titleValue: string | null | undefined
    readonly addressValue: string | null | undefined
    readonly category: string | null | undefined
    readonly responses: ResponsesInReduxForm
    readonly user: {
      id: string
      username: string
    }
    readonly geoJsons: Array<GeoJson>
    readonly onSubmitSuccess: () => void
    readonly onSubmitFailed: () => void
    readonly onSubmit?: () => void
    readonly isBackOfficeInput?: boolean
    readonly errorCount?: number
    readonly onAddressEdit?: () => void
    readonly setValuesSaved?: (values: CreateProposalInput | ChangeProposalContentInput) => void
  }
export type FormValues = {
  title: string | null | undefined
  summary?: string | null | undefined
  body: string | null | undefined
  bodyUsingJoditWysiwyg: boolean | null | undefined
  address?: string | null | undefined
  addresstext?: string | null | undefined
  theme?: string | null | undefined
  category?: string | null | undefined
  district?: string | null | undefined
  responses: ResponsesInReduxForm
  media?: any | null | undefined
  draft: boolean
  likers: [
    {
      value: Uuid
      label: string
    },
  ]
  estimation: number | null | undefined
  twitterUrl?: string | null | undefined
  facebookUrl?: string | null | undefined
  youtubeUrl?: string | null | undefined
  webPageUrl?: string | null | undefined
  instagramUrl?: string | null | undefined
  linkedInUrl?: string | null | undefined
}

const onUnload = e => {
  e.returnValue = true
}

export const ILLUSTRATION_MAX_SIZE = '4000000'
export const memoizeAvailableQuestions: any = memoize(() => {})
export const ExternalLinks = styled.div<{ paddingY?: string }>`
  .form-group {
    max-width: 400px;
    margin-bottom: 24px;
    .control-label.label-container {
      font-weight: 400;
    }
  }

  label {
    span {
      font-weight: 400;
      font-size: 14px;
      color: ${styleGuideColors.gray900};
    }
  }
`

const onSubmit = (
  values: FormValues,
  dispatch: Dispatch,
  { proposalForm, proposal, features, intl, onSubmitSuccess, onSubmitFailed, setValuesSaved }: Props,
) => {
  const data = {
    title: values.title,
    summary: values.summary,
    body: values.body,
    bodyUsingJoditWysiwyg: values.bodyUsingJoditWysiwyg,
    address: values.address,
    theme: values.theme,
    category: values.category,
    district: values.district === SELECT_DISTRICT ? null : values.district,
    draft: values.draft,
    responses: formatSubmitResponses(values.responses, proposalForm.questions),
    media: typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null,
    twitterUrl: values.twitterUrl,
    facebookUrl: values.facebookUrl,
    youtubeUrl: values.youtubeUrl,
    webPageUrl: values.webPageUrl,
    instagramUrl: values.instagramUrl,
    linkedInUrl: values.linkedInUrl,
  }

  if (!proposalForm.step) {
    return
  }

  const availableQuestions = memoizeAvailableQuestions.cache.get(getAvailabeQuestionsCacheKey(proposalForm.id))
  const responsesError = validateProposalContent(
    values,
    proposalForm,
    features,
    intl,
    values.draft,
    availableQuestions,
    true,
  )
  const errors: any = {}
  const isEmptyArray = responsesError.responses ? responsesError.responses.filter(Boolean) : []

  if (isEmptyArray && isEmptyArray.length) {
    errors.responses = responsesError.responses
    throw new SubmissionError(errors)
  }

  if (proposal) {
    if (setValuesSaved) setValuesSaved({ ...data, id: proposal.id })
    return ChangeProposalContentMutation.commit({
      input: { ...data, id: proposal.id },
      proposalRevisionsEnabled: features.proposal_revisions ?? false,
    })
      .then(response => {
        if (!response.changeProposalContent || !response.changeProposalContent.proposal) {
          throw new Error('Mutation "changeProposalContent" failed.')
        }

        window.removeEventListener('beforeunload', onUnload)
        onSubmitSuccess()

        if (window.location.href.includes(EDIT_MODAL_ANCHOR)) {
          window.history.replaceState(null, '', window.location.href.replace(EDIT_MODAL_ANCHOR, ''))
        }

        window.location.reload()
      })
      .catch(() => {
        onSubmitFailed()
        throw new SubmissionError({
          _error: 'global.error.server.form',
        })
      })
  }

  if (setValuesSaved) setValuesSaved({ ...data, proposalFormId: proposalForm.id })
  return CreateProposalMutation.commit({
    input: { ...data, proposalFormId: proposalForm.id },
    stepId: proposalForm.step?.id || '',
  })
    .then((response: CreateProposalMutation$data) => {
      if (response.createProposal && response.createProposal.userErrors) {
        for (const error of response.createProposal.userErrors) {
          if (error.message === 'You contributed too many times.') {
            throw new SubmissionError({
              _error: 'publication-limit-reached',
            })
          }
        }
      }

      if (!response.createProposal || !response.createProposal.proposal) {
        throw new Error('Mutation "createProposal" failed.')
      }

      const createdProposal = response.createProposal.proposal
      window.removeEventListener('beforeunload', onUnload)
      const message =
        createdProposal && isInterpellationContextFromProposal(createdProposal)
          ? 'interpellation.create.redirecting'
          : proposalForm.objectType === 'OPINION'
          ? 'opinion.create.redirecting'
          : 'proposal.create.redirecting'
      toast({
        variant: 'success',
        content: intl.formatHTMLMessage({
          id: values.draft ? 'draft.create.registered' : message,
        }),
      })
      dispatch(reset(formName))

      if (values.draft) {
        const draftAnchor = document.getElementById('draftAnchor')
        if (draftAnchor)
          draftAnchor.scrollIntoView({
            behavior: 'smooth',
          })
      } else {
        const proposalsAnchor = document.getElementById('proposal-step-page-header')
        if (proposalsAnchor)
          proposalsAnchor.scrollIntoView({
            behavior: 'smooth',
          })

        if (values.address) {
          const address = JSON.parse(values.address.substring(1, values.address.length - 1))
          if (address?.geometry?.location) mapOpenPopup(address.geometry.location)
        }
      }
      onSubmitSuccess()
    })
    .catch(e => {
      onSubmitFailed()

      if (e instanceof SubmissionError) {
        throw e
      }

      throw new SubmissionError({
        _error: 'global.error.server.form',
      })
    })
}

const validate = (values: FormValues, { proposalForm, features, intl, geoJsons, isBackOfficeInput }: Props) => {
  const availableQuestions = memoizeAvailableQuestions.cache.get(getAvailabeQuestionsCacheKey(proposalForm.id))
  const errors = validateProposalContent(
    values,
    proposalForm,
    features,
    intl,
    values.draft,
    availableQuestions,
    false,
    isBackOfficeInput,
  )

  if (values.address && proposalForm.usingDistrict && proposalForm.proposalInAZoneRequired) {
    const address = JSON.parse(values.address.substring(1, values.address.length - 1))
    if (!geoContains(geoJsons, address?.geometry?.location))
      return { ...errors, addressText: 'constraints.address_in_zone' }
  }
  if (
    proposalForm.usingDistrict &&
    proposalForm.districtMandatory &&
    (!values.district || values.district === SELECT_DISTRICT)
  ) {
    return { ...errors, district: 'proposal.constraints.district' }
  }
  return errors
}

export const retrieveDistrictForLocation = (
  location: LatLng,
  proposalFormId: string,
  dispatch: Dispatch,
  updateDistrictsCallback?: (arg0: { districtIdsFilteredByAddress: Array<string> }) => void,
) => {
  fetchQuery_DEPRECATED(environment as any, getAvailableDistrictsQuery, {
    proposalFormId,
    latitude: location.lat,
    longitude: location.lng,
  } as ProposalFormAvailableDistrictsForLocalisationQuery$variables).then(
    (data: ProposalFormAvailableDistrictsForLocalisationQuery$data) => {
      const districtIdsFilteredByAddress = data.availableDistrictsForLocalisation.map(district => district.id)
      dispatch(
        change(
          formName,
          'district',
          districtIdsFilteredByAddress.length === 0 ? null : districtIdsFilteredByAddress[0],
        ),
      )
      if (updateDistrictsCallback)
        updateDistrictsCallback({
          districtIdsFilteredByAddress,
        })
    },
  )
}
type State = {
  titleSuggestions: Array<{
    readonly id: string
    readonly title: string
    readonly url: any
  }>
  isLoadingTitleSuggestions: boolean
  districtIdsFilteredByAddress: Array<string>
}
export class ProposalForm extends React.Component<Props, State> {
  loadTitleSuggestions = debounce((title: string) => {
    const { proposal: currentProposal, proposalForm } = this.props
    this.setState({
      isLoadingTitleSuggestions: true,
    })
    fetchQuery_DEPRECATED(environment as any, searchProposalsQuery, {
      proposalFormId: proposalForm.id,
      term: title,
    } as ProposalFormSearchProposalsQuery$variables).then((data: ProposalFormSearchProposalsQuery$data) => {
      let titleSuggestions = []

      if (data.form && data.form.proposals && data.form.proposals.edges) {
        titleSuggestions = data.form.proposals.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(node => !currentProposal || currentProposal.id !== node.id)
      }

      this.setState({
        titleSuggestions,
        isLoadingTitleSuggestions: false,
      })
    })
  }, 500)

  constructor(props: Props) {
    super(props)
    this.state = {
      titleSuggestions: [],
      isLoadingTitleSuggestions: false,
      districtIdsFilteredByAddress: props.proposalForm.districts?.map(district => district.id),
    }
  }

  componentDidMount() {
    const { isBackOfficeInput } = this.props

    if (isBackOfficeInput) {
      window.removeEventListener('beforeunload', onUnload)
    } else {
      window.addEventListener('beforeunload', onUnload)
    }
  }

  UNSAFE_componentWillReceiveProps({ titleValue, addressValue, proposalForm }: Props) {
    const { titleValue: titleValueProps, addressValue: addressValueProps, dispatch } = this.props

    if (titleValueProps !== titleValue) {
      this.setState({
        titleSuggestions: [],
      })

      if (titleValue && titleValue.length > 3) {
        this.loadTitleSuggestions(titleValue)
      }
    }

    if (addressValueProps !== addressValue) {
      if (proposalForm.usingDistrict && proposalForm.proposalInAZoneRequired && addressValue) {
        retrieveDistrictForLocation(
          JSON.parse(addressValue)[0].geometry.location,
          proposalForm.id,
          dispatch,
          this.setState.bind(this),
        )
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', onUnload)
  }

  renderError() {
    const { error, proposalForm, intl } = this.props
    return error === 'publication-limit-reached' ? (
      <Alert bsStyle="warning">
        <div>
          <h4>
            <strong>
              {intl.formatMessage({
                id: 'publication-limit-reached',
              })}
            </strong>
          </h4>
          <FormattedMessage
            id={
              proposalForm.step && isInterpellationContextFromStep(proposalForm.step)
                ? 'publication.limit_reached.interpellation_content'
                : 'publication-limit-reached-proposal-content'
            }
          />
        </div>
      </Alert>
    ) : (
      <Alert bsStyle="danger">
        <i className="icon ion-ios-close-outline" /> <FormattedHTMLMessage id={error} />
      </Alert>
    )
  }

  render() {
    const {
      intl,
      titleValue,
      proposalForm,
      dispatch,
      features,
      themes,
      error,
      form,
      responses,
      addressValue,
      category,
      onAddressEdit,
      change: changeProps,
      isBackOfficeInput,
    } = this.props
    const availableQuestions = memoizeAvailableQuestions.cache.get(getAvailabeQuestionsCacheKey(proposalForm.id))
    const titleFieldTradKey =
      proposalForm.objectType === 'PROPOSAL'
        ? 'global.title'
        : proposalForm.objectType === 'ESTABLISHMENT'
        ? 'establishment-name'
        : proposalForm.objectType === 'OPINION'
        ? 'opinion-title'
        : 'title'
    const titleSuggestHeader =
      proposalForm.objectType === 'QUESTION'
        ? 'question.suggest_header'
        : proposalForm.objectType === 'ESTABLISHMENT'
        ? 'establishment-suggest_header'
        : proposalForm.objectType === 'OPINION'
        ? 'opinion.suggest_header'
        : proposalForm.step && isInterpellationContextFromStep(proposalForm.step)
        ? 'interpellation.suggest_header'
        : 'proposal.suggest_header'
    const { districtIdsFilteredByAddress, isLoadingTitleSuggestions, titleSuggestions } = this.state
    const optional = (
      <Text as="span" fontWeight="normal" color={!isBackOfficeInput ? '#707070' : 'gray.500'}>
        {' '}
        {intl.formatMessage({
          id: 'global.optional',
        })}
      </Text>
    )
    return (
      <form id="proposal-form">
        {!isBackOfficeInput && <WYSIWYGRender className="mb-15" value={proposalForm.description} />}
        {error && this.renderError()}
        <Field
          divClassName="bo_width_747 proposal_title_container"
          name="title"
          component={component}
          type="text"
          id="proposal_title"
          autoComplete="off"
          help={!isBackOfficeInput ? proposalForm.titleHelpText : null}
          placeholder={isBackOfficeInput ? 'untitled-proposal' : null}
          label={<FormattedMessage id={titleFieldTradKey} />}
          addonAfter={
            proposalForm.suggestingSimilarProposals ? (
              <Glyphicon glyph="refresh" className={isLoadingTitleSuggestions ? 'glyphicon-spin' : ''} />
            ) : null
          }
        />
        {proposalForm.suggestingSimilarProposals ? (
          <Collapse in={titleSuggestions.length > 0}>
            <Panel>
              <Panel.Heading>
                <Panel.Title>
                  <FormattedMessage
                    id={titleSuggestHeader}
                    values={{
                      matches: titleSuggestions.length,
                      terms: titleValue ? titleValue.split(' ').length : '',
                    }}
                  />
                  <Button
                    style={{
                      marginTop: -5,
                    }}
                    className="pull-right"
                    onClick={() => {
                      this.setState({
                        titleSuggestions: [],
                      })
                    }}
                  >
                    {intl.formatMessage({
                      id: 'global.close',
                    })}
                  </Button>
                </Panel.Title>
              </Panel.Heading>
              <ListGroup>
                {titleSuggestions.slice(0, 5).map(suggestion => (
                  <ListGroupItem>
                    <a href={suggestion.url} className="external-link">
                      {suggestion.title}
                    </a>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Panel>
          </Collapse>
        ) : null}
        {proposalForm.usingSummary && (
          <Field
            divClassName="bo_width_747 proposal_summary_container"
            name="summary"
            component={component}
            type="textarea"
            id="global.summary"
            maxLength="140"
            minLength="2"
            autoComplete="off"
            help={!isBackOfficeInput ? proposalForm.summaryHelpText : null}
            placeholder={isBackOfficeInput ? 'summarize-in-few-words' : null}
            label={
              <span>
                {intl.formatMessage({
                  id: 'global.summary',
                })}
                {optional}
              </span>
            }
          />
        )}
        {isBackOfficeInput && (
          <>
            <UserListField
              id="proposal-admin-author"
              divClassName="bo_width_560 proposal_author_container"
              name="author"
              ariaControls="ProposalAdminContentForm-filter-user-listbox"
              label={<FormattedMessage id="global.author" />}
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              placeholder={intl.formatMessage({
                id: 'global.author',
              })}
              selectFieldIsObject
              multi={false}
              autoload={false}
              clearable={false}
            />
            <Field
              label={intl.formatMessage({
                id: 'global.date.text',
              })}
              id="proposal-publishedAt"
              name="publishedAt"
              dateProps={{
                dateFormat: 'DD/MM/YYYY HH:mm:ss',
              }}
              type="datetime"
              divClassName="bo_width_200 proposal_publishedAt_container"
              formName={formName}
              component={component}
              placeholder="date.placeholder"
              addonAfter={<Icon name={CapUIIcon.Calendar} size={CapUIIconSize.Sm} />}
            />
          </>
        )}
        {features.themes && proposalForm.usingThemes && (
          <Field
            name="theme"
            type="select"
            id="global.theme"
            divClassName="bo_width_560 proposal_theme_container"
            component={component}
            help={!isBackOfficeInput ? proposalForm.themeHelpText : null}
            label={
              <span>
                {intl.formatMessage({
                  id: 'global.theme',
                })}
                {!proposalForm.themeMandatory && optional}
              </span>
            }
          >
            <FormattedMessage id="proposal.select.theme">
              {(message: string) => (
                <option value="" disabled>
                  {message}
                </option>
              )}
            </FormattedMessage>
            {themes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.title}
              </option>
            ))}
          </Field>
        )}
        {proposalForm.categories.length > 0 && proposalForm.usingCategories && (
          <Field
            id="global.category"
            type="select"
            name="category"
            divClassName="bo_width_560 proposal_category_container"
            component={component}
            help={!isBackOfficeInput ? proposalForm.categoryHelpText : null}
            label={
              <span>
                {intl.formatMessage({
                  id: 'global.category',
                })}
                {!proposalForm.categoryMandatory && optional}
              </span>
            }
          >
            <FormattedMessage id="proposal.select.category">
              {(message: string) => (
                <option value="" disabled>
                  {message}
                </option>
              )}
            </FormattedMessage>
            {proposalForm.categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Field>
        )}
        {proposalForm.usingAddress && (
          <Field
            id="proposal_address"
            component={component}
            type="address"
            help={!isBackOfficeInput ? proposalForm.addressHelpText : null}
            name="addressText"
            divClassName="bo_width_560 proposal_addressText_container"
            formName={formName}
            label={intl.formatMessage({
              id: 'proposal_form.address',
            })}
            placeholder="proposal.map.form.placeholder"
            addressProps={{
              getAddress: (addressComplete: AddressComplete | null | undefined) =>
                changeProps('address', addressComplete ? JSON.stringify([addressComplete]) : addressComplete),
            }}
          />
        )}
        <ProposalFormMapPreview category={category} categories={proposalForm.categories} address={addressValue} />
        {proposalForm.usingAddress && onAddressEdit && (
          <DsButton p={0} mb={3} onClick={onAddressEdit} variant="link" variantColor="primary">
            <FormattedMessage id={addressValue ? 'edit-on-card' : 'locate-on-card'} />
          </DsButton>
        )}
        {features.districts && proposalForm.usingDistrict && proposalForm.districts.length > 0 && (
          <Field
            id="proposal_district"
            type="select"
            name="district"
            divClassName="bo_width_560 proposal_district_container"
            component={component}
            help={!isBackOfficeInput ? proposalForm.districtHelpText : null}
            label={
              <span>
                {intl.formatMessage({
                  id: 'proposal.district',
                })}
                {!proposalForm.districtMandatory && optional}
              </span>
            }
          >
            <FormattedMessage id="proposal.select.district">
              {(message: string) => <option value={SELECT_DISTRICT}>{message}</option>}
            </FormattedMessage>
            {districtIdsFilteredByAddress.map(districtId => (
              <option key={districtId} value={districtId}>
                {proposalForm.districts.filter(district => district.id === districtId)[0].name}
              </option>
            ))}
          </Field>
        )}
        {proposalForm.usingDescription && (
          <Field
            id="proposal_body"
            type="editor-ds"
            name="body"
            divClassName="bo_width_560 proposal_body_container"
            component={component}
            placeholder={
              isBackOfficeInput
                ? intl.formatMessage({
                    id: 'describe-your-project-in-details',
                  })
                : null
            }
            label={
              <span>
                {intl.formatMessage({
                  id: 'proposal.body',
                })}
                {!proposalForm.descriptionMandatory && optional}
              </span>
            }
            help={!isBackOfficeInput ? proposalForm.descriptionHelpText : null}
          />
        )}
        <FieldArray
          name="responses"
          component={renderResponses}
          divClassName="bo_width_747_container"
          form={form}
          dispatch={dispatch}
          questions={proposalForm.questions}
          intl={intl}
          change={changeProps}
          responses={responses}
          availableQuestions={availableQuestions}
          memoize={memoizeAvailableQuestions}
          memoizeId={proposalForm.id}
          unstable__enableCapcoUiDs
        />
        {proposalForm.usingIllustration && (
          <Field
            divClassName="bo_width_747 proposal_media_container"
            maxSize={ILLUSTRATION_MAX_SIZE}
            id="proposal_media"
            name="media"
            component={component}
            type="image"
            label={
              <span>
                {intl.formatMessage({
                  id: 'proposal.media',
                })}
                {optional}
              </span>
            }
            help={
              <span>
                {proposalForm.illustrationHelpText}&nbsp;
                <FormattedHTMLMessage id="illustration-help-text" />
              </span>
            }
          />
        )}
        {proposalForm.isUsingAnySocialNetworks && (
          // @ts-ignore
          <ExternalLinks paddingY={8} backgroundColor={styleGuideColors.white} className="external-links">
            <Text
              as={isBackOfficeInput ? `span` : `h3`}
              fontWeight="600"
              fontSize="14px"
              lineHeight="24px"
              display="flex"
              mb={6}
              color={styleGuideColors.gray900}
            >
              {intl.formatMessage({
                id: 'your-external-links',
              })}
            </Text>
            {proposalForm.usingWebPage && (
              <Field
                id="proposal_wep_page"
                name="webPageUrl"
                placeholder={intl.formatMessage({
                  id: 'your-url',
                })}
                component={component}
                type="text"
                label={intl.formatMessage({
                  id: 'form.label_website',
                })}
              />
            )}
            {proposalForm.usingTwitter && (
              <Field
                id="proposal_twitter"
                name="twitterUrl"
                component={component}
                type="text"
                label={intl.formatMessage({
                  id: 'share.twitter',
                })}
                placeholder="https://x.com/pseudo"
              />
            )}
            {proposalForm.usingFacebook && (
              <Field
                id="proposal_facebook"
                name="facebookUrl"
                component={component}
                type="text"
                label={intl.formatMessage({
                  id: 'share.facebook',
                })}
                placeholder="https://facebook.com/pseudo"
              />
            )}
            {proposalForm.usingInstagram && (
              <Field
                id="proposal_instagram"
                name="instagramUrl"
                component={component}
                type="text"
                label={intl.formatMessage({
                  id: 'instagram',
                })}
                placeholder="https://instagram.com/pseudo"
              />
            )}
            {proposalForm.usingLinkedIn && (
              <Field
                id="proposal_linkedin"
                name="linkedInUrl"
                component={component}
                type="text"
                label={intl.formatMessage({
                  id: 'share.linkedin',
                })}
                placeholder="https://linkedin.com/in/pseudo"
              />
            )}
            {proposalForm.usingYoutube && (
              <Field
                id="proposal_youtube"
                name="youtubeUrl"
                component={component}
                type="text"
                label={intl.formatMessage({
                  id: 'youtube',
                })}
                placeholder="https://youtube.com/channel/pseudo"
              />
            )}
          </ExternalLinks>
        )}
      </form>
    )
  }
}
const selector = formValueSelector(formName)

const mapStateToProps = (state: GlobalState, { proposal, proposalForm, isBackOfficeInput }: Props) => {
  const defaultResponses = formatInitialResponsesValues(proposalForm.questions, proposal ? proposal.responses : [])
  let draft = !isBackOfficeInput

  if (proposal) {
    draft = proposal.publicationStatus === 'DRAFT'
  }

  return {
    initialValues: {
      draft,
      title: proposal ? proposal.title : null,
      summary: proposal ? proposal.summary : null,
      body: proposal ? proposal.body : null,
      theme: proposal && proposal.theme ? proposal.theme.id : undefined,
      district: proposal && proposal.district ? proposal.district.id : undefined,
      category: proposal && proposal.category ? proposal.category.id : undefined,
      media: proposal ? proposal.media : undefined,
      addressText: proposal && proposal.address ? proposal.address.formatted : '',
      address: (proposal && proposal.address && proposal.address.json) || undefined,
      responses: defaultResponses,
      twitterUrl: proposal ? proposal.twitterUrl : null,
      facebookUrl: proposal ? proposal.facebookUrl : null,
      youtubeUrl: proposal ? proposal.youtubeUrl : null,
      webPageUrl: proposal ? proposal.webPageUrl : null,
      instagramUrl: proposal ? proposal.instagramUrl : null,
      linkedInUrl: proposal ? proposal.linkedInUrl : null,
      bodyUsingJoditWysiwyg: proposal?.bodyUsingJoditWysiwyg ?? null,
    },
    geoJsons: formatGeoJsons(proposalForm.districts),
    titleValue: selector(state, 'title'),
    category: selector(state, 'category'),
    addressValue: selector(state, 'address'),
    features: state.default.features,
    themes: state.default.themes,
    user: state.user.user,
    isBackOfficeInput,
    currentStepId: state.project.currentProjectStepById,
    responses: formValueSelector(formName)(state, 'responses') || defaultResponses,
  }
}

const form = reduxForm({
  form: formName,
  validate,
  onSubmit,
  onSubmitFail: errors => {
    scrollToFormError(errors)
  },
})(ProposalForm)
// @ts-ignore
const container = connect(mapStateToProps)(injectIntl(form))
export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalForm_proposal on Proposal {
      id
      title
      body
      bodyUsingJoditWysiwyg
      summary
      address {
        json
        formatted
        lat
        lng
      }
      publicationStatus
      category {
        id
      }
      theme {
        id
      }
      district {
        id
      }
      responses {
        ...responsesHelper_response @relay(mask: false)
      }
      media {
        id
        name
        size
        url
      }
      twitterUrl
      facebookUrl
      youtubeUrl
      webPageUrl
      instagramUrl
      linkedInUrl
    }
  `,
  proposalForm: graphql`
    fragment ProposalForm_proposalForm on ProposalForm {
      id
      description
      suggestingSimilarProposals
      step {
        project {
          _id
        }
        id
        slug
        ...interpellationLabelHelper_step @relay(mask: false)
      }
      districts(order: ALPHABETICAL) {
        id
        name
        displayedOnMap
        geojson
        id
      }
      categories(order: ALPHABETICAL) {
        id
        name
        color
        icon
      }
      questions {
        id
        ... on SectionQuestion {
          level
        }
        ...responsesHelper_question @relay(mask: false)
      }
      usingDistrict
      districtMandatory
      districtHelpText
      usingThemes
      themeMandatory
      usingCategories
      categoryMandatory
      categoryHelpText
      usingAddress
      titleHelpText
      summaryHelpText
      themeHelpText
      illustrationHelpText
      descriptionHelpText
      addressHelpText
      proposalInAZoneRequired
      objectType
      usingDescription
      descriptionMandatory
      usingSummary
      usingIllustration
      usingFacebook
      usingWebPage
      usingTwitter
      usingInstagram
      usingYoutube
      usingLinkedIn
      isUsingAnySocialNetworks
    }
  `,
})
