// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  change,
  SubmissionError,
  reduxForm,
  Field,
  FieldArray,
  formValueSelector,
} from 'redux-form';
import { createFragmentContainer, fetchQuery, graphql } from 'react-relay';
import { debounce } from 'lodash';
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
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import CreateProposalMutation from '../../../mutations/CreateProposalMutation';
import { closeCreateModal, closeEditProposalModal } from '../../../redux/modules/proposal';
import ChangeProposalContentMutation from '../../../mutations/ChangeProposalContentMutation';
import {
  formatInitialResponsesValues,
  formatSubmitResponses,
  renderResponses,
  type ResponsesInReduxForm,
} from '../../../utils/responsesHelper';
import environment from '../../../createRelayEnvironment';
import { validateProposalContent, warnProposalContent } from '../Admin/ProposalAdminContentForm';
import WYSIWYGRender from '../../Form/WYSIWYGRender';
import FluxDispatcher from '../../../dispatchers/AppDispatcher';

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
  +dispatch: Dispatch,
  +features: FeatureToggles,
  +titleValue: ?string,
  +addressValue: ?string,
  +responses: ResponsesInReduxForm,
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
  responses: ResponsesInReduxForm,
  media?: ?any,
  draft: boolean,
|};

// const catchServerSubmitErrors = (reason: Object) => {
//   if (
//     reason &&
//     reason.response &&
//     reason.response.errors &&
//     reason.response.errors.errors &&
//     reason.response.errors.errors.length &&
//     reason.response.errors.errors.includes('global.address_not_in_zone')
//   ) {
//     throw new SubmissionError({
//       addressText: 'proposal.constraints.address_in_zone',
//     });
//   }
//   throw new SubmissionError({
//     _error: 'global.error.server.form',
//   });
// };

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposalForm, proposal } = props;
  const data = {
    title: values.title,
    summary: values.summary,
    body: values.body,
    address: values.address,
    theme: values.theme,
    category: values.category,
    district: values.district,
    draft: values.draft,
    responses: formatSubmitResponses(values.responses, proposalForm.questions),
    media: typeof values.media !== 'undefined' && values.media !== null ? values.media.id : null,
  };

  if (!proposalForm.step) {
    return;
  }
  if (proposal) {
    return ChangeProposalContentMutation.commit({
      input: { ...data, id: proposal.id },
    })
      .then(response => {
        if (!response.changeProposalContent || !response.changeProposalContent.proposal) {
          throw new Error('Mutation "changeProposalContent" failed.');
        }
        window.removeEventListener('beforeunload', onUnload);
        dispatch(closeEditProposalModal());
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
        alert: { bsStyle: 'success', content: 'proposal.create.redirecting' },
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

const validate = (values: FormValues, { proposalForm, features, intl }: Props) => {
  return validateProposalContent(values, proposalForm, features, intl, values.draft);
};

const warn = (values: FormValues, { proposalForm, features, intl }: Props) => {
  return warnProposalContent(values, proposalForm, features, intl, values.draft);
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
    const { error } = this.props;

    return error === 'publication-limit-reached' ? (
      <Alert bsStyle="warning">
        <div>
          <h4>
            <strong>
              <FormattedMessage id="publication-limit-reached" />
            </strong>
          </h4>
          <FormattedMessage id="publication-limit-reached-proposal-content" />
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
      proposalForm,
      features,
      themes,
      error,
      form,
      responses,
      change: changeProps,
    } = this.props;
    const titleFieldTradKey = proposalForm.isProposalForm ? 'proposal.title' : 'title';
    const titleSuggestHeader = proposalForm.isProposalForm
      ? 'proposal.suggest_header'
      : 'question.suggest_header';

    const {
      districtIdsFilteredByAddress,
      isLoadingTitleSuggestions,
      titleSuggestions,
    } = this.state;

    const optional = (
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.form.optional" />
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
            id="proposal_summary"
            maxLength="140"
            autoComplete="off"
            help={proposalForm.summaryHelpText}
            label={
              <span>
                <FormattedMessage id="proposal.summary" />
                {optional}
              </span>
            }
          />
        )}
        {features.themes && proposalForm.usingThemes && (
          <Field
            name="theme"
            type="select"
            id="proposal_theme"
            component={component}
            help={proposalForm.themeHelpText}
            label={
              <span>
                <FormattedMessage id="proposal.theme" />
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
            id="proposal_category"
            type="select"
            name="category"
            component={component}
            help={proposalForm.categoryHelpText}
            label={
              <span>
                <FormattedMessage id="proposal.category" />
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
            label={<FormattedMessage id="proposal.map.form.field" />}
            placeholder="proposal.map.form.placeholder"
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
          questions={proposalForm.questions}
          intl={intl}
          change={changeProps}
          responses={responses}
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
      media: proposal ? proposal.media : undefined,
      addressText: proposal && proposal.address ? proposal.address.formatted : '',
      address: (proposal && proposal.address && proposal.address.json) || undefined,
      responses: defaultResponses,
    },
    titleValue: selector(state, 'title'),
    addressValue: selector(state, 'address'),
    features: state.default.features,
    themes: state.default.themes,
    currentStepId: state.project.currentProjectStepById,
    responses: formValueSelector(formName)(state, 'responses') || defaultResponses,
  };
};

const form = reduxForm({
  form: formName,
  warn,
  validate,
  onSubmit,
})(ProposalForm);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalForm_proposal on Proposal {
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
    }
  `,
  proposalForm: graphql`
    fragment ProposalForm_proposalForm on ProposalForm {
      id
      description
      suggestingSimilarProposals
      step {
        id
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
      isProposalForm
      usingDescription
      descriptionMandatory
      usingSummary
      usingIllustration
    }
  `,
});
