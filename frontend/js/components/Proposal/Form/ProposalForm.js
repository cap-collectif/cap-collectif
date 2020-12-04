// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import memoize from 'lodash/memoize';
import debounce from 'lodash/debounce';
import {
  change,
  SubmissionError,
  reduxForm,
  Field,
  FieldArray,
  formValueSelector,
} from 'redux-form';
import { createFragmentContainer, fetchQuery, graphql } from 'react-relay';
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
import component from '../../Form/Field';
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
import type { GlobalState, Dispatch, FeatureToggles } from '~/types';
import CreateProposalMutation from '~/mutations/CreateProposalMutation';
import { closeCreateModal, closeEditProposalModal } from '~/redux/modules/proposal';
import ChangeProposalContentMutation from '~/mutations/ChangeProposalContentMutation';
import environment from '~/createRelayEnvironment';
import { validateProposalContent } from '../Admin/ProposalAdminContentForm';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import type { ResponsesInReduxForm } from '~/components/Form/Form.type';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import {
  isInterpellationContextFromProposal,
  isInterpellationContextFromStep,
} from '~/utils/interpellationLabelHelper';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import renderResponses from '~/components/Form/RenderResponses';
import {
  handleVisibilityAccordingToType,
  TRIGGER_FOR,
} from '~/plugin/APIEnterprise/APIEnterpriseFunctions';
import type { AddressComplete } from '~/components/Form/Address/Address.type';
import { EDIT_MODAL_ANCHOR } from '~/components/Proposal/Page/Header/ProposalPageHeaderButtons';
import config from '~/config';

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

type RelayProps = {|
  +proposalForm: ProposalForm_proposalForm,
  +proposal: ?ProposalForm_proposal,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  +intl: IntlShape,
  +themes: Array<Object>,
  +instanceName: string,
  +dispatch: Dispatch,
  +features: FeatureToggles,
  +titleValue: ?string,
  +tipsmeeeIdDisabled: boolean,
  +addressValue: ?string,
  +responses: ResponsesInReduxForm,
  +user: { id: string, username: string },
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
|};

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

const memoizeAvailableQuestions: any = memoize(() => {});

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

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposalForm, proposal, features, intl } = props;
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
        dispatch(closeEditProposalModal());
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
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      });
  }

  return CreateProposalMutation.commit({
    input: { ...data, proposalFormId: proposalForm.id },
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
      dispatch(closeCreateModal());
      FluxDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: {
          bsStyle: 'success',
          content:
            createdProposal && isInterpellationContextFromProposal(createdProposal)
              ? 'interpellation.create.redirecting'
              : 'proposal.create.redirecting',
        },
      });

      const TIMEOUT_BEFORE_REDIRECTION = 5000; // 5s
      // We may have some MySQL replication latency
      // That's why it's better to wait a bit
      // before redirecting, to avoid 404s…
      setTimeout(() => {
        window.location.href = createdProposal.url;
      }, TIMEOUT_BEFORE_REDIRECTION);
    })
    .catch(e => {
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

const validate = (values: FormValues, { proposalForm, features, intl }: Props) => {
  const availableQuestions = memoizeAvailableQuestions.cache.get('availableQuestions');

  return validateProposalContent(
    values,
    proposalForm,
    features,
    intl,
    values.draft,
    availableQuestions,
  );
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
    fetchQuery(
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
      districtIdsFilteredByAddress: props.proposalForm.districts.map(district => district.id),
    };
  }

  componentDidMount() {
    window.addEventListener('beforeunload', onUnload);
    const { responses, proposalForm, dispatch, instanceName, intl } = this.props;
    if (TRIGGER_FOR.includes(instanceName)) {
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
    fetchQuery(
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
    const { error, proposalForm } = this.props;

    return error === 'publication-limit-reached' ? (
      <Alert bsStyle="warning">
        <div>
          <h4>
            <strong>
              <FormattedMessage id="publication-limit-reached" />
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
      user,
      change: changeProps,
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
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.optional" />
      </span>
    );
    const mandatory = (
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.mandatory" />
      </span>
    );
    return (
      <form id="proposal-form">
        <WYSIWYGRender className="mb-15" value={proposalForm.description} />
        {error && this.renderError()}
        <Field
          name="title"
          component={component}
          type="text"
          id="proposal_title"
          autoComplete="off"
          help={proposalForm.titleHelpText}
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
                    <FormattedMessage id="global.close" />
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
            name="summary"
            component={component}
            type="textarea"
            id="global.summary"
            maxLength="140"
            minLength="2"
            autoComplete="off"
            help={proposalForm.summaryHelpText}
            label={
              <span>
                <FormattedMessage id="global.summary" />
                {optional}
              </span>
            }
          />
        )}
        {features.themes && proposalForm.usingThemes && (
          <Field
            name="theme"
            type="select"
            id="global.theme"
            component={component}
            help={proposalForm.themeHelpText}
            label={
              <span>
                <FormattedMessage id="global.theme" />
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
            component={component}
            help={proposalForm.categoryHelpText}
            label={
              <span>
                <FormattedMessage id="global.category" />
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
            {proposalForm.categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Field>
        )}
        {proposalForm.usingAddress && (
          <Field
            id="proposal_address"
            component={component}
            type="address"
            help={proposalForm.addressHelpText}
            name="addressText"
            formName={formName}
            label={<FormattedMessage id="proposal_form.address" />}
            placeholder="proposal.map.form.placeholder"
            addressProps={{
              getAddress: (addressComplete: AddressComplete) =>
                changeProps('address', JSON.stringify([addressComplete])),
            }}
          />
        )}
        {features.districts && proposalForm.usingDistrict && proposalForm.districts.length > 0 && (
          <Field
            id="proposal_district"
            type="select"
            name="district"
            component={component}
            help={proposalForm.districtHelpText}
            label={
              <span>
                <FormattedMessage id="proposal.district" />
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
            label={
              <span>
                <FormattedMessage id="proposal.body" />
                {!proposalForm.descriptionMandatory && optional}
              </span>
            }
            help={proposalForm.descriptionHelpText}
          />
        )}

        <FieldArray
          name="responses"
          component={renderResponses}
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
            id="proposal_media"
            name="media"
            component={component}
            type="image"
            label={
              <span>
                <FormattedMessage id="proposal.media" />
                {optional}
              </span>
            }
            help={proposalForm.illustrationHelpText}
          />
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
                  <FormattedMessage id="create-tipsmeee" />
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
                    <FormattedMessage id="proposal.tipsMeee" />
                    {mandatory}
                  </span>
                }
              />
              <FormattedMessage id="tipsmeee-code-help" tagName="p" />
            </TipsmeeeFormContainer>
          </>
        )}
      </form>
    );
  }
}

const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState, { proposal, proposalForm }: Props) => {
  const defaultResponses = formatInitialResponsesValues(
    proposalForm.questions,
    proposal ? proposal.responses : [],
  );

  return {
    initialValues: {
      draft: proposal ? proposal.publicationStatus === 'DRAFT' : true,
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
    },
    titleValue: selector(state, 'title'),
    tipsmeeeIdDisabled: proposal && proposal.tipsmeeeId,
    addressValue: selector(state, 'address'),
    features: state.default.features,
    themes: state.default.themes,
    user: state.user.user,
    instanceName: state.default.instanceName,
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
})(ProposalForm);

const container = connect(mapStateToProps)(injectIntl(form));

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
    }
  `,
  proposalForm: graphql`
    fragment ProposalForm_proposalForm on ProposalForm {
      id
      description
      suggestingSimilarProposals
      step {
        id
        ...interpellationLabelHelper_step @relay(mask: false)
      }
      districts(order: ALPHABETICAL) {
        id
        name
      }
      categories(order: ALPHABETICAL) {
        id
        name
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
    }
  `,
});
