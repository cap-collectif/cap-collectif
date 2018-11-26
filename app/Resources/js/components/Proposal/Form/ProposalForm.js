// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import {
  type FormProps,
  change,
  SubmissionError,
  reduxForm,
  Field,
  FieldArray,
  formValueSelector,
} from 'redux-form';
import { createFragmentContainer, fetchQuery, graphql } from 'react-relay';
import { debounce } from 'lodash';
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
} from './__generated__/ProposalFormSearchProposalsQuery.graphql';
import type {
  ProposalFormAvailableDistrictsForLocalisationQueryResponse,
  ProposalFormAvailableDistrictsForLocalisationQueryVariables,
} from './__generated__/ProposalFormAvailableDistrictsForLocalisationQuery.graphql';
import type { ProposalForm_proposal } from './__generated__/ProposalForm_proposal.graphql';
import type { ProposalForm_proposalForm } from './__generated__/ProposalForm_proposalForm.graphql';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import CreateProposalMutation from '../../../mutations/CreateProposalMutation';
import {
  closeCreateModal,
  closeEditProposalModal,
  addProposalInRandomResultsByStep,
} from '../../../redux/modules/proposal';
import ChangeProposalContentMutation from '../../../mutations/ChangeProposalContentMutation';
import {
  formatInitialResponsesValues,
  formatSubmitResponses,
  renderResponses,
  type ResponsesInReduxForm,
} from '../../../utils/responsesHelper';
import environment from '../../../createRelayEnvironment';
import { validateProposalContent } from '../Admin/ProposalAdminContentForm';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

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
              show_url
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

type RelayProps = {
  +proposalForm: ProposalForm_proposalForm,
  +proposal: ?ProposalForm_proposal,
};

type Props = FormProps &
  RelayProps & {
    +intl: IntlShape,
    +themes: Array<Object>,
    +dispatch: Dispatch,
    +features: FeatureToggles,
    +titleValue: ?string,
    +addressValue: ?string,
    +responses: ResponsesInReduxForm,
  };

type FormValues = {|
  title: ?string,
  summary?: ?string,
  author?: ?string,
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
    addressText: undefined,
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
        const updatedProposal = response.changeProposalContent.proposal;
        if (updatedProposal.publicationStatus !== 'DRAFT' && proposalForm.step) {
          addProposalInRandomResultsByStep(updatedProposal, proposalForm.step.id);
        }
        window.removeEventListener('beforeunload', onUnload);
        dispatch(closeEditProposalModal());
        location.reload();
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
      if (!response.createProposal || !response.createProposal.proposal) {
        throw new Error('Mutation "createProposal" failed.');
      }
      const createdProposal = response.createProposal.proposal;
      if (createdProposal.publicationStatus !== 'DRAFT' && proposalForm.step) {
        addProposalInRandomResultsByStep(createdProposal, proposalForm.step.id);
      }
      window.removeEventListener('beforeunload', onUnload);
      window.location.href = createdProposal.show_url;
      dispatch(closeCreateModal());
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = (values: FormValues, { proposalForm, features, intl }: Props) => {
  const errors = {};

  if (values.draft) {
    if (!values.title) {
      errors.title = 'proposal.constraints.title_for_draft';
    } else if (values.title.length <= 2) {
      errors.title = 'proposal.constraints.title';
    }
    if (values.summary && values.summary.length > 140) {
      errors.summary = 'proposal.constraints.summary';
    }
    return errors;
  }

  return validateProposalContent(values, proposalForm, features, intl);
};

type State = {
  titleSuggestions: Array<{|
    +id: string,
    +title: string,
    +show_url: any,
  |}>,
  isLoadingTitleSuggestions: boolean,
  districtIdsFilteredByAddress: Array<string>,
};

export class ProposalForm extends React.Component<Props, State> {
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
    if (this.props.titleValue !== titleValue) {
      this.setState({ titleSuggestions: [] });
      if (titleValue && titleValue.length > 3) {
        this.loadTitleSuggestions(titleValue);
      }
    }
    if (this.props.addressValue !== addressValue) {
      if (proposalForm.proposalInAZoneRequired && addressValue) {
        this.retrieveDistrictForLocation(JSON.parse(addressValue)[0].geometry.location);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', onUnload);
  }

  loadTitleSuggestions = debounce((title: string) => {
    const currentProposal = this.props.proposal;
    this.setState({ isLoadingTitleSuggestions: true });
    fetchQuery(
      environment,
      searchProposalsQuery,
      ({
        proposalFormId: this.props.proposalForm.id,
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

  retrieveDistrictForLocation = (location: LatLng) => {
    fetchQuery(
      environment,
      getAvailableDistrictsQuery,
      ({
        proposalFormId: this.props.proposalForm.id,
        latitude: location.lat,
        longitude: location.lng,
      }: ProposalFormAvailableDistrictsForLocalisationQueryVariables),
    ).then((data: ProposalFormAvailableDistrictsForLocalisationQueryResponse) => {
      const districtIdsFilteredByAddress = data.availableDistrictsForLocalisation.map(
        district => district.id,
      );
      // Select a district if not editing
      if (!this.props.proposal) {
        this.props.dispatch(
          change(
            formName,
            'district',
            districtIdsFilteredByAddress.length === 0 ? null : districtIdsFilteredByAddress[0],
          ),
        );
      }
      this.setState({
        districtIdsFilteredByAddress,
      });
    });
  };

  render() {
    const { intl, titleValue, proposalForm, features, themes, error, form, responses } = this.props;
    const titleFieldTradKey = proposalForm.isProposalForm ? 'proposal.title' : 'title';

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
        {error && (
          <Alert bsStyle="danger">
            <i className="icon ion-ios-close-outline" />{' '}
            <FormattedHTMLMessage id="global.error.server.form" />
          </Alert>
        )}
        <Field
          name="title"
          component={component}
          type="text"
          id="proposal_title"
          autoComplete="off"
          help={proposalForm.titleHelpText}
          label={<FormattedMessage id={titleFieldTradKey} />}
          addonAfter={
            <Glyphicon
              glyph="refresh"
              className={isLoadingTitleSuggestions ? 'glyphicon-spin' : ''}
            />
          }
        />
        <Collapse in={titleSuggestions.length > 0}>
          <Panel>
            <Panel.Heading>
              <Panel.Title>
                <FormattedMessage
                  id="proposal.suggest_header"
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
                  <a href={suggestion.show_url} className="external-link">
                    {suggestion.title}
                  </a>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Panel>
        </Collapse>
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
              {message => (
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
              {message => (
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
              {message => <option value="">{message}</option>}
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
          change={this.props.change}
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

const mapStateToProps: MapStateToProps<*, *, *> = (
  state: GlobalState,
  { proposal, proposalForm }: Props,
) => ({
  initialValues: {
    draft: proposal ? proposal.publicationStatus === 'DRAFT' : true,
    title: proposal ? proposal.title : null,
    summary: proposal ? proposal.summary : null,
    body: proposal ? proposal.body : null,
    theme: proposal && proposal.theme ? proposal.theme.id : undefined,
    district: proposal && proposal.district ? proposal.district.id : undefined,
    category: proposal && proposal.category ? proposal.category.id : undefined,
    media: proposal ? proposal.media : undefined,
    addressText:
      proposal && proposal.address ? JSON.parse(proposal.address)[0].formatted_address : '',
    address: (proposal && proposal.address) || undefined,
    responses: formatInitialResponsesValues(
      proposalForm.questions,
      proposal ? proposal.responses : [],
    ),
  },
  titleValue: selector(state, 'title'),
  addressValue: selector(state, 'address'),
  features: state.default.features,
  themes: state.default.themes,
  currentStepId: state.project.currentProjectStepById,
  responses: formValueSelector(formName)(state, 'responses'),
});

const form = reduxForm({
  form: formName,
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
      address
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
