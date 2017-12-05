// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  type FormProps,
  change,
  SubmissionError,
  reduxForm,
  Field,
  FieldArray,
  formValueSelector,
} from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { debounce } from 'lodash';
import { Collapse, Panel, Glyphicon, Button } from 'react-bootstrap';
import component from '../../Form/Field';
import query, {
  type ProposalFormAvailableDistrictsForLocalisationQueryResponse,
} from './__generated__/ProposalFormAvailableDistrictsForLocalisationQuery.graphql';
import type { ProposalForm_proposal } from './__generated__/ProposalForm_proposal.graphql';
import type { ProposalForm_proposalForm } from './__generated__/ProposalForm_proposalForm.graphql';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import { submitProposal, updateProposal } from '../../../redux/modules/proposal';
import { loadSuggestions } from '../../../actions/ProposalActions';
import Fetcher from '../../../services/Fetcher';
import { formatInitialResponsesValues, renderResponses } from '../Admin/ProposalAdminNotationForm';

// eslint-disable-next-line
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

type LatLng = {
  lat: number,
  lng: number,
};

export const formName = 'proposal-form';

type RelayProps = {|
  +proposalForm: ProposalForm_proposalForm,
  +proposal: ?ProposalForm_proposal,
|};

type Props = RelayProps &
  FormProps & {
    intl: IntlShape,
    themes: Array<Object>,
    isSubmittingDraft: boolean,
    dispatch: Dispatch,
    features: FeatureToggles,
    titleValue: ?string,
    addressValue: ?string,
  };

type FormValues = {
  title: ?string,
  summary: ?string,
  body: ?string,
  address: ?string,
  addresstext: ?string,
  theme: ?string,
  district: ?string,
  responses: Array<Object>,
  draft?: boolean,
};

const catchServerSubmitErrors = (e: Object) => {
  if (
    e.response &&
    e.response.errors &&
    e.response.errors.errors.includes('global.address_not_in_zone')
  ) {
    throw new SubmissionError({
      address: 'proposal.constraints.address_in_zone',
    });
  }
  throw e;
};

const onSubmit = (
  values: FormValues,
  dispatch: Dispatch,
  { proposalForm, proposal, isSubmittingDraft }: Props,
) => {
  // Only used for the user view
  if (typeof values.addressText !== 'undefined') {
    delete values.addressText;
  }
  if (isSubmittingDraft) {
    values.draft = true;
  }

  if (proposalForm.step) {
    if (proposal) {
      return updateProposal(
        dispatch,
        proposalForm.id,
        proposal.id,
        values,
        proposalForm.step.id,
      ).catch(catchServerSubmitErrors);
    }

    return submitProposal(dispatch, proposalForm.id, values, proposalForm.step.id).catch(
      catchServerSubmitErrors,
    );
  }
};

const validate = (values: FormValues, { proposalForm, features, isSubmittingDraft }: Props) => {
  const errors = {};

  if (isSubmittingDraft) {
    if (!values.title) {
      errors.title = 'proposal.constraints.title_for_draft';
    } else if (values.title.length <= 2) {
      errors.title = 'proposal.constraints.title_min_value_for_draft';
    }
    return errors;
  }

  if (!values.title || values.title.length <= 2) {
    errors.title = 'proposal.constraints.title';
  }
  if (values.summary && (values.summary.length > 140 || values.summary.length < 2)) {
    errors.summary = 'proposal.constraints.summary';
  }
  if (!values.body || values.body.length <= 2) {
    errors.body = 'proposal.constraints.body';
  }
  if (proposalForm.usingAddress && !values.address) {
    errors.addressText = 'proposal.constraints.address';
  }
  if (
    proposalForm.categories.length &&
    proposalForm.usingCategories &&
    proposalForm.categoryMandatory &&
    !values.category
  ) {
    errors.category = 'proposal.constraints.category';
  }
  if (
    features.districts &&
    proposalForm.usingDistrict &&
    proposalForm.districtMandatory &&
    !values.district
  ) {
    errors.district = 'proposal.constraints.district';
  }
  if (features.themes && proposalForm.usingThemes && proposalForm.themeMandatory && !values.theme) {
    errors.theme = 'proposal.constraints.theme';
  }
  const responsesError = [];
  proposalForm.questions.map((field, index) => {
    if (field.required) {
      const response = values.responses.filter(res => res && res.question === field.id)[0];
      if (field.type === 'medias') {
        if (!response || response.value.length === 0) {
          responsesError[index] = { value: 'proposal.constraints.field_mandatory' };
        }
      } else if (!response || !response.value) {
        responsesError[index] = { value: 'proposal.constraints.field_mandatory' };
      }
    }
  });
  if (responsesError.length) {
    errors.responses = responsesError;
  }
  return errors;
};

type State = {
  titleSuggestions: Array<Object>,
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

  loadTitleSuggestions = debounce((title: string) => {
    this.setState({ isLoadingTitleSuggestions: true });
    if (this.props.proposalForm.step && this.props.proposalForm.step.id) {
      loadSuggestions(this.props.proposalForm.step.id, title).then(res => {
        this.setState({
          titleSuggestions: res.proposals,
          isLoadingTitleSuggestions: false,
        });
      });
    }
  }, 500);

  retrieveDistrictForLocation(location: LatLng, isEditMode: ?boolean = false) {
    Fetcher.graphql({
      operationName: 'ProposalFormAvailableDistrictsForLocalisationQuery',
      query: query.text,
      variables: {
        proposalFormId: this.props.proposalForm.id,
        latitude: location.lat,
        longitude: location.lng,
      },
    }).then((response: { data: ProposalFormAvailableDistrictsForLocalisationQueryResponse }) => {
      const districtIdsFilteredByAddress = response.data.availableDistrictsForLocalisation.map(
        district => district.id,
      );
      if (!isEditMode) {
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
  }

  render() {
    const {
      intl,
      titleValue,
      proposalForm,
      features,
      themes,
      isSubmittingDraft,
      proposal,
    } = this.props;
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
        {isSubmittingDraft ? (
          <div className="mt-20">
            <div dangerouslySetInnerHTML={{ __html: proposalForm.description }} />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: proposalForm.description }} />
        )}
        <Field
          name="title"
          component={component}
          type="text"
          id="proposal_title"
          autoComplete="off"
          help={proposalForm.titleHelpText}
          label={<FormattedMessage id="proposal.title" />}
          addonAfter={
            <Glyphicon
              glyph="refresh"
              className={isLoadingTitleSuggestions ? 'glyphicon-spin' : ''}
            />
          }
        />
        <Collapse in={titleSuggestions.length > 0}>
          <Panel
            header={
              <FormattedMessage
                id="proposal.suggest_header"
                values={{
                  matches: titleSuggestions.length,
                  terms: titleValue ? titleValue.split(' ').length : '',
                }}
              />
            }>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {titleSuggestions.slice(0, 5).map(suggestion => (
                <li>
                  <a href={suggestion._links.show} className="external-link">
                    {suggestion.title}
                  </a>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => {
                this.setState({ titleSuggestions: [] });
              }}>
              <FormattedMessage id="global.close" />
            </Button>
          </Panel>
        </Collapse>
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
        {features.themes &&
          proposalForm.usingThemes && (
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
        {proposalForm.categories.length > 0 &&
          proposalForm.usingCategories && (
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
              {proposalForm.categories.map(category => {
                return (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                );
              })}
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
        {features.districts &&
          proposalForm.usingDistrict &&
          proposalForm.districts.length > 0 && (
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
        <Field
          id="proposal_body"
          type="editor"
          name="body"
          component={component}
          label={<FormattedMessage id="proposal.body" />}
          help={proposalForm.descriptionHelpText}
        />
        <FieldArray
          name="responses"
          component={renderResponses}
          questions={proposalForm.questions}
          intl={intl}
        />
        <Field
          id="proposal_media"
          name="media"
          component={component}
          type="image"
          image={proposal && proposal.media ? proposal.media.url : null}
          label={
            <span>
              <FormattedMessage id="proposal.media" />
              {optional}
            </span>
          }
          help={proposalForm.illustrationHelpText}
        />
      </form>
    );
  }
}

const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState, { proposal, proposalForm }: Props) => ({
  initialValues: {
    title: proposal ? proposal.title : null,
    summary: proposal ? proposal.summary : null,
    body: proposal ? proposal.body : null,
    theme: proposal && proposal.theme ? proposal.theme.id : null,
    district: proposal && proposal.district ? proposal.district.id : null,
    category: proposal && proposal.category ? proposal.category.id : null,
    media: proposal ? proposal.media : null,
    addressText:
      proposal && proposal.address ? JSON.parse(proposal.address)[0].formatted_address : '',
    address: (proposal && proposal.address) || null,
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
  isSubmittingDraft: state.proposal.isSubmittingDraft,
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
      responses {
        question {
          id
        }
        ... on ValueResponse {
          value
        }
        ... on MediaResponse {
          medias {
            id
            name
            size
            url
          }
        }
      }
      media {
        id
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
      districts {
        id
        name
      }
      categories {
        id
        name
      }
      questions {
        id
        title
        type
        position
        private
        required
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
    }
  `,
});
