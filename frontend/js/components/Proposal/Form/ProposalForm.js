// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import memoize from 'lodash/memoize';
import debounce from 'lodash/debounce';
import {
  change,
  reset,
  SubmissionError,
  reduxForm,
  Field,
  FieldArray,
  formValueSelector,
} from 'redux-form';
import { createFragmentContainer, fetchQuery_DEPRECATED, graphql } from 'react-relay';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import {
  Alert,
  Collapse,
  ListGroup,
  ListGroupItem,
  Panel,
  Glyphicon,
  Button,
} from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import { styleGuideColors } from '~/utils/colors';
import component from '~/components/Form/Field';
import type {
  ProposalFormSearchProposalsQueryResponse,
  ProposalFormSearchProposalsQueryVariables,
} from '~relay/ProposalFormSearchProposalsQuery.graphql';
import type {
  ProposalFormAvailableDistrictsForLocalisationQueryResponse,
  ProposalFormAvailableDistrictsForLocalisationQueryVariables,
} from '~relay/ProposalFormAvailableDistrictsForLocalisationQuery.graphql';
import type { ProposalForm_proposal } from '~relay/ProposalForm_proposal.graphql';
import type { ProposalForm_proposalForm } from '~relay/ProposalForm_proposalForm.graphql';
import type { GlobalState, Dispatch, FeatureToggles, Uuid } from '~/types';
import CreateProposalMutation from '~/mutations/CreateProposalMutation';
import ChangeProposalContentMutation from '~/mutations/ChangeProposalContentMutation';
import environment from '~/createRelayEnvironment';
import { validateProposalContent } from '../Admin/ProposalAdminContentForm';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import type { ResponsesInReduxForm } from '~/components/Form/Form.type';
import {
  isInterpellationContextFromProposal,
  isInterpellationContextFromStep,
} from '~/utils/interpellationLabelHelper';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import renderResponses from '~/components/Form/RenderResponses';
import {
  handleVisibilityAccordingToType,
  TRIGGER_FOR_IDS,
} from '~/plugin/APIEnterprise/APIEnterpriseFunctions';
import type { AddressComplete } from '~/components/Form/Address/Address.type';
import config from '~/config';
import Text from '~ui/Primitives/Text';
import { formatGeoJsons, geoContains, type GeoJson } from '~/utils/geojson';
import { ProposalFormMapPreview } from './ProposalFormMapPreview';
import UserListField from '~/components/Admin/Field/UserListField';
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon';
import DsButton from '~ds/Button/Button';
import { toast } from '~/components/DesignSystem/Toast';
import { mapOpenPopup } from '~/components/Proposal/Map/Map.events';

const getAvailableDistrictsQuery = graphql`
  query ProposalFormAvailableDistrictsForLocalisationQuery(
    $proposalFormId: ID!
    $latitude: Float!
    $longitude: Float!
  ) {
    availableDistrictsForLocalisation(
      proposalFormId: $proposalFormId
      latitude: $latitude
      longitude: $longitude
    ) {
      id
      name
    }
  }
`;

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
`;

type LatLng = {
  lat: number,
  lng: number,
};

export const formName = 'proposal-form';
export const EDIT_MODAL_ANCHOR = '#edit-proposal';

type RelayProps = {|
  +proposalForm: ProposalForm_proposalForm,
  +proposal: ?ProposalForm_proposal,
|};

export type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  +intl: IntlShape,
  +themes: Array<Object>,
  +dispatch: Dispatch,
  +features: FeatureToggles,
  +titleValue: ?string,
  +tipsmeeeIdDisabled: boolean,
  +addressValue: ?string,
  +category: ?string,
  +responses: ResponsesInReduxForm,
  +user: { id: string, username: string },
  +geoJsons: Array<GeoJson>,
  +onSubmitSuccess: () => void,
  +onSubmitFailed: () => void,
  +onSubmit?: () => void,
  +isBackOfficeInput?: boolean,
  +errorCount?: number,
  +onAddressEdit?: () => void,
|};

export type FormValues = {|
  title: ?string,
  summary?: ?string,
  body: ?string,
  address?: ?string,
  addresstext?: ?string,
  theme?: ?string,
  category?: ?string,
  district?: ?string,
  tipsmeeeId?: ?string,
  responses: ResponsesInReduxForm,
  media?: ?any,
  draft: boolean,
  likers: [{ value: Uuid, label: string }],
  estimation: ?number,
  twitterUrl?: ?string,
  facebookUrl?: ?string,
  youtubeUrl?: ?string,
  webPageUrl?: ?string,
  instagramUrl?: ?string,
  linkedInUrl?: ?string,
|};

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

export const ILLUSTRATION_MAX_SIZE = '4000000';

export const memoizeAvailableQuestions: any = memoize(() => {});

export const ExternalLinks: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
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
`;

const TipsmeeeFormContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 24px;
  background: ${styleGuideColors.blue100};
  border: 1px solid ${styleGuideColors.blue200};
  box-sizing: border-box;
  border-radius: 4px;
  figure {
    margin-bottom: 10px;
  }
`;

const onSubmit = (
  values: FormValues,
  dispatch: Dispatch,
  { proposalForm, proposal, features, intl, onSubmitSuccess, onSubmitFailed }: Props,
) => {
  const data = {
    title: values.title,
    summary: values.summary,
    body: values.body,
    address: values.address,
    theme: values.theme,
    category: values.category,
    district: values.district,
    tipsmeeeId: values.tipsmeeeId,
    draft: values.draft,
    responses: formatSubmitResponses(values.responses, proposalForm.questions),
    media: typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null,
    twitterUrl: values.twitterUrl,
    facebookUrl: values.facebookUrl,
    youtubeUrl: values.youtubeUrl,
    webPageUrl: values.webPageUrl,
    instagramUrl: values.instagramUrl,
    linkedInUrl: values.linkedInUrl,
  };

  if (!proposalForm.step) {
    return;
  }
  const availableQuestions = memoizeAvailableQuestions.cache.get('availableQuestions');
  const responsesError = validateProposalContent(
    values,
    proposalForm,
    features,
    intl,
    values.draft,
    availableQuestions,
    true,
  );

  const errors = {};
  const isEmptyArray = responsesError.responses ? responsesError.responses.filter(Boolean) : [];
  if (isEmptyArray && isEmptyArray.length) {
    errors.responses = responsesError.responses;
    throw new SubmissionError(errors);
  }

  if (proposal) {
    return ChangeProposalContentMutation.commit({
      input: { ...data, id: proposal.id },
      proposalRevisionsEnabled: features.proposal_revisions ?? false,
    })
      .then(response => {
        if (!response.changeProposalContent || !response.changeProposalContent.proposal) {
          throw new Error('Mutation "changeProposalContent" failed.');
        }
        window.removeEventListener('beforeunload', onUnload);
        onSubmitSuccess();
        if (window.location.href.includes(EDIT_MODAL_ANCHOR)) {
          window.history.replaceState(
            null,
            '',
            window.location.href.replace(EDIT_MODAL_ANCHOR, ''),
          );
        }
        window.location.reload();
      })
      .catch(() => {
        onSubmitFailed();
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      });
  }

  return CreateProposalMutation.commit({
    input: {
      ...data,
      proposalFormId: proposalForm.id,
    },
    stepId: proposalForm.step?.id || '',
  })
    .then(response => {
      if (response.createProposal && response.createProposal.userErrors) {
        for (const error of response.createProposal.userErrors) {
          if (error.message === 'You contributed too many times.') {
            throw new SubmissionError({ _error: 'publication-limit-reached' });
          }
        }
      }
      if (!response.createProposal || !response.createProposal.proposal) {
        throw new Error('Mutation "createProposal" failed.');
      }
      const createdProposal = response.createProposal.proposal;
      window.removeEventListener('beforeunload', onUnload);
      const message =
        createdProposal && isInterpellationContextFromProposal(createdProposal)
          ? 'interpellation.create.redirecting'
          : 'proposal.create.redirecting';
      toast({
        variant: 'success',
        content: intl.formatHTMLMessage({
          id: values.draft ? 'draft.create.registered' : message,
        }),
      });
      dispatch(reset(formName));
      if (values.draft) {
        const draftAnchor = document.getElementById('draftAnchor');
        if (draftAnchor) draftAnchor.scrollIntoView({ behavior: 'smooth' });
      } else {
        const proposalsAnchor = document.getElementById('proposal-step-page-header');
        if (proposalsAnchor) proposalsAnchor.scrollIntoView({ behavior: 'smooth' });
        if (values.address) {
          const address = JSON.parse(values.address.substring(1, values.address.length - 1));
          if (address?.geometry?.location) mapOpenPopup(address.geometry.location);
        }
      }
      onSubmitSuccess();
    })
    .catch(e => {
      onSubmitFailed();
      if (e instanceof SubmissionError) {
        throw e;
      }
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

export const asyncValidate = (values: FormValues) => {
  if (values.tipsmeeeId) {
    const tipsmeeeUrl = config.isDevOrTest
      ? `https://tipsmeee.fra1.digitaloceanspaces.com/datasStage/qrs/qr_${values.tipsmeeeId}.png`
      : `https://tipsmeee.fra1.digitaloceanspaces.com/datas/qrs/qr_${values.tipsmeeeId}.png`;
    // https://stackoverflow.com/questions/34116294/rejecting-promise-when-using-fetch
    return fetch(tipsmeeeUrl).then(function(res) {
      if (res.status === 200 && res.ok) {
        return res;
      }
      // eslint-disable-next-line no-throw-literal
      throw { tipsmeeeId: 'tipsmeee-id-error' };
    });
  }
  if (values.draft) {
    return new Promise<void>(resolve => {
      resolve();
    });
  }
  return new Promise<void>(() => {
    // eslint-disable-next-line no-throw-literal
    throw { tipsmeeeId: 'tipsmeee-id-mandatory' };
  });
};

const validate = (
  values: FormValues,
  { proposalForm, features, intl, geoJsons, isBackOfficeInput }: Props,
) => {
  const availableQuestions = memoizeAvailableQuestions.cache.get('availableQuestions');

  const errors = validateProposalContent(
    values,
    proposalForm,
    features,
    intl,
    values.draft,
    availableQuestions,
    false,
    isBackOfficeInput,
  );
  if (values.address && proposalForm.proposalInAZoneRequired) {
    const address = JSON.parse(values.address.substring(1, values.address.length - 1));
    if (!geoContains(geoJsons, address?.geometry?.location))
      return { ...errors, addressText: 'constraints.address_in_zone' };
  }
  return errors;
};

type State = {
  titleSuggestions: Array<{|
    +id: string,
    +title: string,
    +url: any,
  |}>,
  isLoadingTitleSuggestions: boolean,
  districtIdsFilteredByAddress: Array<string>,
};

export class ProposalForm extends React.Component<Props, State> {
  loadTitleSuggestions = debounce((title: string) => {
    const { proposal: currentProposal, proposalForm } = this.props;
    this.setState({ isLoadingTitleSuggestions: true });
    fetchQuery_DEPRECATED(
      environment,
      searchProposalsQuery,
      ({
        proposalFormId: proposalForm.id,
        term: title,
      }: ProposalFormSearchProposalsQueryVariables),
    ).then((data: ProposalFormSearchProposalsQueryResponse) => {
      let titleSuggestions = [];
      if (data.form && data.form.proposals && data.form.proposals.edges) {
        titleSuggestions = data.form.proposals.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(node => !currentProposal || currentProposal.id !== node.id);
      }
      this.setState({
        titleSuggestions,
        isLoadingTitleSuggestions: false,
      });
    });
  }, 500);

  constructor(props: Props) {
    super(props);

    this.state = {
      titleSuggestions: [],
      isLoadingTitleSuggestions: false,
      districtIdsFilteredByAddress: props.proposalForm.districts?.map(district => district.id),
    };
  }

  componentDidMount() {
    const { responses, proposalForm, dispatch, intl, isBackOfficeInput } = this.props;
    if (isBackOfficeInput) {
      window.removeEventListener('beforeunload', onUnload);
    } else {
      window.addEventListener('beforeunload', onUnload);
    }
    if (TRIGGER_FOR_IDS.includes(proposalForm.id)) {
      handleVisibilityAccordingToType(
        intl,
        dispatch,
        proposalForm.questions,
        responses,
        proposalForm.id,
      );
    }
  }

  componentWillReceiveProps({ titleValue, addressValue, proposalForm }: Props) {
    const { titleValue: titleValueProps, addressValue: addressValueProps } = this.props;
    if (titleValueProps !== titleValue) {
      this.setState({ titleSuggestions: [] });
      if (titleValue && titleValue.length > 3) {
        this.loadTitleSuggestions(titleValue);
      }
    }
    if (addressValueProps !== addressValue) {
      if (proposalForm.proposalInAZoneRequired && addressValue) {
        this.retrieveDistrictForLocation(JSON.parse(addressValue)[0].geometry.location);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', onUnload);
  }

  retrieveDistrictForLocation = (location: LatLng) => {
    const { proposalForm, dispatch } = this.props;
    fetchQuery_DEPRECATED(
      environment,
      getAvailableDistrictsQuery,
      ({
        proposalFormId: proposalForm.id,
        latitude: location.lat,
        longitude: location.lng,
      }: ProposalFormAvailableDistrictsForLocalisationQueryVariables),
    ).then((data: ProposalFormAvailableDistrictsForLocalisationQueryResponse) => {
      const districtIdsFilteredByAddress = data.availableDistrictsForLocalisation.map(
        district => district.id,
      );
      dispatch(
        change(
          formName,
          'district',
          districtIdsFilteredByAddress.length === 0 ? null : districtIdsFilteredByAddress[0],
        ),
      );
      this.setState({
        districtIdsFilteredByAddress,
      });
    });
  };

  renderError() {
    const { error, proposalForm, intl } = this.props;

    return error === 'publication-limit-reached' ? (
      <Alert bsStyle="warning">
        <div>
          <h4>
            <strong>{intl.formatMessage({ id: 'publication-limit-reached' })}</strong>
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
    );
  }

  render() {
    const {
      intl,
      titleValue,
      tipsmeeeIdDisabled,
      proposalForm,
      dispatch,
      features,
      themes,
      error,
      form,
      responses,
      addressValue,
      user,
      category,
      onAddressEdit,
      change: changeProps,
      isBackOfficeInput,
    } = this.props;
    const availableQuestions = memoizeAvailableQuestions.cache.get('availableQuestions');
    const titleFieldTradKey =
      proposalForm.objectType === 'PROPOSAL'
        ? 'global.title'
        : proposalForm.objectType === 'ESTABLISHMENT'
        ? 'establishment-name'
        : 'title';

    const titleSuggestHeader =
      proposalForm.objectType === 'PROPOSAL'
        ? 'proposal.suggest_header'
        : proposalForm.objectType === 'ESTABLISHMENT'
        ? 'establishment-suggest_header'
        : proposalForm.step && isInterpellationContextFromStep(proposalForm.step)
        ? 'interpellation.suggest_header'
        : 'question.suggest_header';

    const {
      districtIdsFilteredByAddress,
      isLoadingTitleSuggestions,
      titleSuggestions,
    } = this.state;

    const optional = (
      <Text as="span" fontWeight="normal" color={!isBackOfficeInput ? '#707070' : 'gray.500'}>
        {' '}
        {intl.formatMessage({ id: 'global.optional' })}
      </Text>
    );
    const mandatory = (
      <span className="excerpt"> {intl.formatMessage({ id: 'global.mandatory' })}</span>
    );
    return (
      <form id="proposal-form">
        {!isBackOfficeInput && <WYSIWYGRender className="mb-15" value={proposalForm.description} />}
        {error && this.renderError()}
        <Field
          divClassName="bo_width_747"
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
              <Glyphicon
                glyph="refresh"
                className={isLoadingTitleSuggestions ? 'glyphicon-spin' : ''}
              />
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
                    style={{ marginTop: -5 }}
                    className="pull-right"
                    onClick={() => {
                      this.setState({ titleSuggestions: [] });
                    }}>
                    {intl.formatMessage({ id: 'global.close' })}
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
            divClassName="bo_width_747"
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
                {intl.formatMessage({ id: 'global.summary' })}
                {optional}
              </span>
            }
          />
        )}
        {isBackOfficeInput && (
          <>
            <UserListField
              id="proposal-admin-author"
              divClassName="bo_width_560"
              name="author"
              ariaControls="ProposalAdminContentForm-filter-user-listbox"
              label={<FormattedMessage id="global.author" />}
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              placeholder={intl.formatMessage({ id: 'global.author' })}
              selectFieldIsObject
              multi={false}
              autoload={false}
              clearable={false}
            />
            <Field
              label={intl.formatMessage({ id: 'global.date.text' })}
              id="proposal-publishedAt"
              name="publishedAt"
              dateProps={{ dateFormat: 'DD/MM/YYYY HH:mm:ss' }}
              type="datetime"
              divClassName="bo_width_200"
              formName={formName}
              component={component}
              placeholder="date.placeholder"
              addonAfter={<Icon name={ICON_NAME.CALENDAR} size={ICON_SIZE.SM} />}
            />
          </>
        )}
        {features.themes && proposalForm.usingThemes && (
          <Field
            name="theme"
            type="select"
            id="global.theme"
            divClassName="bo_width_560"
            component={component}
            help={!isBackOfficeInput ? proposalForm.themeHelpText : null}
            label={
              <span>
                {intl.formatMessage({ id: 'global.theme' })}
                {!proposalForm.themeMandatory && optional}
              </span>
            }>
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
            divClassName="bo_width_560"
            component={component}
            help={!isBackOfficeInput ? proposalForm.categoryHelpText : null}
            label={
              <span>
                {intl.formatMessage({ id: 'global.category' })}
                {!proposalForm.categoryMandatory && optional}
              </span>
            }>
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
            divClassName="bo_width_560"
            formName={formName}
            label={intl.formatMessage({ id: 'proposal_form.address' })}
            placeholder="proposal.map.form.placeholder"
            addressProps={{
              getAddress: (addressComplete: ?AddressComplete) =>
                changeProps(
                  'address',
                  addressComplete ? JSON.stringify([addressComplete]) : addressComplete,
                ),
            }}
          />
        )}
        <ProposalFormMapPreview
          category={category}
          categories={proposalForm.categories}
          address={addressValue}
        />
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
            divClassName="bo_width_560"
            component={component}
            help={!isBackOfficeInput ? proposalForm.districtHelpText : null}
            label={
              <span>
                {intl.formatMessage({ id: 'proposal.district' })}
                {!proposalForm.districtMandatory && optional}
              </span>
            }>
            <FormattedMessage id="proposal.select.district">
              {(message: string) => <option>{message}</option>}
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
            type="editor"
            name="body"
            component={component}
            placeholder={
              isBackOfficeInput
                ? intl.formatMessage({ id: 'describe-your-project-in-details' })
                : null
            }
            label={
              <span>
                {intl.formatMessage({ id: 'proposal.body' })}
                {!proposalForm.descriptionMandatory && optional}
              </span>
            }
            help={!isBackOfficeInput ? proposalForm.descriptionHelpText : null}
          />
        )}
        <FieldArray
          name="responses"
          component={renderResponses}
          divClassName="bo_width_747"
          form={form}
          dispatch={dispatch}
          questions={proposalForm.questions}
          intl={intl}
          change={changeProps}
          responses={responses}
          availableQuestions={availableQuestions}
          memoize={memoizeAvailableQuestions}
        />
        {proposalForm.usingIllustration && (
          <Field
            divClassName="bo_width_747"
            maxSize={ILLUSTRATION_MAX_SIZE}
            id="proposal_media"
            name="media"
            component={component}
            type="image"
            label={
              <span>
                {intl.formatMessage({ id: 'proposal.media' })}
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
          <ExternalLinks
            paddingY={8}
            backgroundColor={styleGuideColors.white}
            className="external-links">
            <Text
              as={isBackOfficeInput ? `span` : `h3`}
              fontWeight="600"
              fontSize="14px"
              lineHeight="24px"
              display="flex"
              mb={6}
              color={styleGuideColors.gray900}>
              {intl.formatMessage({ id: 'your-external-links' })}
            </Text>
            {proposalForm.usingWebPage && (
              <Field
                id="proposal_wep_page"
                name="webPageUrl"
                placeholder={intl.formatMessage({ id: 'your-url' })}
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'form.label_website' })}
              />
            )}
            {proposalForm.usingTwitter && (
              <Field
                id="proposal_twitter"
                name="twitterUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'share.twitter' })}
                placeholder="https://twitter.com/pseudo"
              />
            )}
            {proposalForm.usingFacebook && (
              <Field
                id="proposal_facebook"
                name="facebookUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'share.facebook' })}
                placeholder="https://facebook.com/pseudo"
              />
            )}
            {proposalForm.usingInstagram && (
              <Field
                id="proposal_instagram"
                name="instagramUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'instagram' })}
                placeholder="https://instagram.com/pseudo"
              />
            )}
            {proposalForm.usingLinkedIn && (
              <Field
                id="proposal_linkedin"
                name="linkedInUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'share.linkedin' })}
                placeholder="https://linkedin.com/in/pseudo"
              />
            )}
            {proposalForm.usingYoutube && (
              <Field
                id="proposal_youtube"
                name="youtubeUrl"
                component={component}
                type="text"
                label={intl.formatMessage({ id: 'youtube' })}
                placeholder="https://youtube.com/channel/pseudo"
              />
            )}
          </ExternalLinks>
        )}
        {features.unstable__tipsmeee && proposalForm.usingTipsmeee && (
          <>
            <FormattedHTMLMessage id="configure-my-tipsmeee" tagName="p" />
            <TipsmeeeFormContainer>
              <figure>
                <img src="/svg/tipsmeee.svg" alt="tipsmeee logo" />
              </figure>
              <FormattedHTMLMessage id="tipsmeee-body" tagName="p" />
              <p>
                <Button
                  target="_blank"
                  href={
                    config.isDevOrTest
                      ? `https://www-stage.tipsmeee.com/login/capco/${user.username}`
                      : `https://tipsmeee.com/login/capco/${user.username}`
                  }
                  type="button">
                  {intl.formatMessage({ id: 'create-tipsmeee' })}
                </Button>
              </p>
              <Field
                id="proposal_tipsmeee"
                name="tipsmeeeId"
                component={component}
                type="text"
                placeholder={proposalForm.tipsmeeeHelpText}
                disabled={tipsmeeeIdDisabled}
                label={
                  <span>
                    {intl.formatMessage({ id: 'proposal.tipsMeee' })}
                    {mandatory}
                  </span>
                }
              />
              {intl.formatMessage({ id: 'tipsmeee-code-help', tagName: 'p' })}
            </TipsmeeeFormContainer>
          </>
        )}
      </form>
    );
  }
}

const selector = formValueSelector(formName);

const mapStateToProps = (
  state: GlobalState,
  { proposal, proposalForm, isBackOfficeInput }: Props,
) => {
  const defaultResponses = formatInitialResponsesValues(
    proposalForm.questions,
    proposal ? proposal.responses : [],
  );
  let draft = !isBackOfficeInput;
  if (proposal) {
    draft = proposal.publicationStatus === 'DRAFT';
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
      tipsmeeeId: proposal && proposal.tipsmeeeId ? proposal.tipsmeeeId : undefined,
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
    },
    geoJsons: formatGeoJsons(proposalForm.districts),
    titleValue: selector(state, 'title'),
    tipsmeeeIdDisabled: proposal && proposal.tipsmeeeId,
    category: selector(state, 'category'),
    addressValue: selector(state, 'address'),
    features: state.default.features,
    themes: state.default.themes,
    user: state.user.user,
    isBackOfficeInput,
    currentStepId: state.project.currentProjectStepById,
    responses: formValueSelector(formName)(state, 'responses') || defaultResponses,
    asyncValidate:
      state.default.features.unstable__tipsmeee && proposalForm.usingTipsmeee
        ? asyncValidate
        : undefined,
    asyncChangeFields:
      state.default.features.unstable__tipsmeee && proposalForm.usingTipsmeee
        ? ['tipsmeeeId']
        : undefined,
  };
};

const form = reduxForm({
  form: formName,
  validate,
  onSubmit,
  destroyOnUnmount: false,
})(ProposalForm);

const container = connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalForm_proposal on Proposal
      @argumentDefinitions(isTipsMeeeEnabled: { type: "Boolean!" }) {
      id
      title
      body
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
      tipsmeeeId @include(if: $isTipsMeeeEnabled)
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
      usingTipsmeee
      tipsmeeeHelpText
      usingFacebook
      usingWebPage
      usingTwitter
      usingInstagram
      usingYoutube
      usingLinkedIn
      isUsingAnySocialNetworks
    }
  `,
});
