// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { type FormProps, change, SubmissionError, reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
// import { debounce } from 'lodash';
import { Collapse, Panel, Glyphicon, Button } from 'react-bootstrap';
import component from '../../Form/Field';
// import ProposalMediaResponse from '../Page/ProposalMediaResponse';
import query from './__generated__/ProposalFormAvailableDistrictsForLocalisationQuery.graphql';
import type { ProposalForm_proposal } from './__generated__/ProposalForm_proposal.graphql';
import type { ProposalForm_proposalForm } from './__generated__/ProposalForm_proposalForm.graphql';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import {
  submitProposal,
  updateProposal,
} from '../../../redux/modules/proposal';
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
    availableDistrictsForLocalisation(proposalFormId: $proposalFormId, latitude: $latitude, longitude: $longitude) {
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

type Props = FormProps & {
  intl: IntlShape,
  currentStepId: string,
  proposalForm: ProposalForm_proposalForm,
  themes: Array<Object>,
  isSubmittingDraft: boolean,
  dispatch: Dispatch,
  features: FeatureToggles,
  proposal: ?ProposalForm_proposal,
};

type FormValues = {
  title?: ?string,
  summary?: ?string,
  body?: ?string,
  address?: ?string,
  addresstext?: ?string,
  theme?: ?string,
  district?: ?string,
  responses?: ?Array<Object>
};

const onSubmit = (values: FormValues, dispatch: Dispatch, {proposalForm, proposal}: Props) => {
  // Only used for the user view
  delete values.addressText;

  // // We must remove Files to upload from variables and put them in uploadables
  // const uploadables = {};
  // if (values.media instanceof File) {
  //   // User wants to upload a new media
  //   uploadables.media = values.media;
  // }
  // delete values.media;
  //
  // values.responses = values.responses.filter(res => {
  //   if (!res.medias) {
  //     // We only send value responses
  //     return true;
  //   }
  //   for (const media of res.medias) {
  //     if (media instanceof File) {
  //       uploadables[`responses_${res.question}`] = media;
  //     }
  //   }
  //   return false;
  // });

  const catchErrors = (e: Object) => {
    if (e.response && e.response.errors && e.response.errors.errors.includes('global.address_not_in_zone')) {
      throw new SubmissionError({
        address: 'proposal.constraints.address_in_zone',
        _error: 'Creation failed!'
      });
    }
    throw e;
  }

  if (proposal) {
    return updateProposal(dispatch, proposalForm.id, proposal.id, values, proposalForm.step.id);
    // const variables = {
    //   input: { ...values, id: props.proposal.id },
    // };
    //
    // return ChangeProposalContentMutation.commit(variables, uploadables);
  }

  return submitProposal(
    dispatch,
    proposalForm.id,
    values,
    proposalForm.step.id
  ).catch(catchErrors);

  // return CreateProposalMutation.commit({
  //   input: {
  //     ...values,
  //     formId: props.proposalForm.id,
  //     //   proposalForm.draft = nextProps.isSubmittingDraft;
  //   },
  // }, uploadables).then();
}

const validate = (values: FormValues, { proposalForm, features, isSubmittingDraft }: Props) => {
  const errors = {};

  if (isSubmittingDraft) {
    if (!values.title) {
      errors.title = 'proposal.constraints.title_for_draft';
    }
    else if (values.title.length <= 2) {
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
  if (features.districts && proposalForm.usingDistrict && proposalForm.districtMandatory && !values.district) {
    errors.district = 'proposal.constraints.district';
  }
  if (features.themes && proposalForm.usingThemes && proposalForm.themeMandatory && !values.theme) {
    errors.theme = 'proposal.constraints.theme';
  }
  proposalForm.questions.map(field => {
    if (field.required) {
      const response = values.responses && values.responses.filter(res => res && res.question.id === field.id)[0];
      if (!response) {
        errors['responses[1].value'] = 'proposal.constraints.field_mandatory';
      }
    }
  });
  return errors;
};

type State = {
  titleSuggestions: Array<Object>,
  isLoadingTitleSuggestions: boolean,
  districtIdsFilteredByAddress: Array<string>,
  address: ?string,
};

export class ProposalForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      titleSuggestions: [],
      isLoadingTitleSuggestions: false,
      districtIdsFilteredByAddress: props.proposalForm.districts.map(district => district.id),
      address: props.proposal && props.proposal.address ? JSON.parse(props.proposal.address)[0].formatted_address : '',
    };
  }

  componentWillReceiveProps({titleValue, addressValue}: Props) {
    const { currentStepId, proposalForm } = this.props;
    if (this.props.titleValue !== titleValue) {
        this.setState({ titleSuggestions: [] });
        if (titleValue && titleValue.length > 3) {
          this.setState({ isLoadingTitleSuggestions: true });
          loadSuggestions(currentStepId, titleValue).then(res => {
              this.setState({
                titleSuggestions: res.proposals,
                isLoadingTitleSuggestions: false,
              });
          });
        }
    }
    if (this.props.addressValue !== addressValue) {
      if (proposalForm.proposalInAZoneRequired && addressValue) {
        this.retrieveDistrictForLocation(JSON.parse(addressValue)[0].geometry.location);
      }
    }
  }

  // componentWillMount() {
  //   this.handleTitleChangeDebounced = debounce(this.handleTitleChangeDebounced, 500);
  // }

  retrieveDistrictForLocation(location: LatLng, isEditMode: ?boolean = false) {
    this.setState({
      loadingDistricts: true,
    });
    Fetcher.graphql({
      operationName: 'ProposalFormAvailableDistrictsForLocalisationQuery',
      query: query.text,
      variables: {
        proposalFormId: this.props.proposalForm.id,
        latitude: location.lat,
        longitude: location.lng,
      },
    }).then((response: ProposalFormAvailableDistrictsForLocalisationQueryResponse) => {
      const districtIdsFilteredByAddress = response.data.availableDistrictsForLocalisation.map(
        district => district.id,
      );
      if (!isEditMode) {
        this.props.dispatch(change(formName, 'district', districtIdsFilteredByAddress.length === 0 ? null : districtIdsFilteredByAddress[0]))
      }
      this.setState({
        districtIdsFilteredByAddress,
        loadingDistricts: false,
      });
    });
  }

  render() {
    const { intl, titleValue, proposalForm, features, themes, isSubmittingDraft, proposal } = this.props;
    const { districtIdsFilteredByAddress, isLoadingTitleSuggestions, titleSuggestions } = this.state;

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
            <Glyphicon glyph="refresh" className={isLoadingTitleSuggestions ? "glyphicon-spin" : ""} />
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
          {proposalForm.usingAddress &&
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
        }
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
{/*
          const medias =
            field.type === 'medias' && proposal.responses.length > 0
              ? proposal.responses.filter(response => {
                  return response.field.id === field.id;
                })
              : [];
              medias={medias.length > 0 ? medias[0].medias : []}
 */}
      </form>
    );
  }
};

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
    addressText: proposal && proposal.address ? JSON.parse(proposal.address)[0].formatted_address : '',
    address: proposal && proposal.address || null,
    responses: formatInitialResponsesValues(proposalForm.questions, proposal ? proposal.responses : []),
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

export default createFragmentContainer(
  container,
  {
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
        proposalInAZoneRequired
    }`
  }
);
