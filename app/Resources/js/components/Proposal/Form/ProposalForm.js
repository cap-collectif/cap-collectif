// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray } from 'redux-form';
// import { createFragmentContainer, graphql } from 'react-relay';
import { debounce } from 'lodash';
import { Collapse, Panel, Glyphicon, Button } from 'react-bootstrap';
// import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';
import ProposalPrivateField from '../ProposalPrivateField';
import component from '../../Form/Field';
import ProposalMediaResponse from '../Page/ProposalMediaResponse';
// import type { ProposalForm_proposal } from './__generated__/ProposalForm_proposal.graphql';
import type { GlobalState, Dispatch, FeatureToggles } from '../../../types';
import {
  submitProposal,
  updateProposal,
  cancelSubmitProposal,
} from '../../../redux/modules/proposal';
import { loadSuggestions } from '../../../actions/ProposalActions';

type LatLng = {
  lat: Number,
  lng: Number,
};

const query = `
          query availableDistrictsForLocalisation(
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

type Props = {
  intl: IntlShape,
  currentStepId: string,
  form: Object,
  themes: Array<Object>,
  categories: Array<Object>,
  isSubmitting: boolean,
  isSubmittingDraft: boolean,
  dispatch: Dispatch,
  features: FeatureToggles,
  proposal: ?Object,
}

const onSubmit = () => {
//   const form = this.state.form;
//   const responses = [];
//   const custom = this.state.custom;
//   Object.keys(custom).map(key => {
//     const question = key.split('-')[1];
//     if (typeof custom[key] !== 'undefined' && custom[key].length > 0) {
//       responses.push({
//         question,
//         value: custom[key],
//       });
//     }
//   });
//   form.responses = responses;
//   if (responses.length === 0) {
//     delete form.responses;
//   }
//   if (!features.themes || !this.props.form.usingThemes || !form.theme) {
//     delete form.theme;
//   }
//   if (!form.usingAddress && form.address.length === 0) {
//     delete form.address;
//   }
//   if (!features.districts || !form.district || !this.props.form.usingDistrict) {
//     delete form.district;
//   }
//   if (categories.length === 0 || !this.props.form.usingCategories) {
//     delete form.category;
//   }
//   if (form.summary !== null && form.summary.length === 0) {
//     form.summary = null;
//   }
//
//   form.draft = nextProps.isSubmittingDraft;
//   if (mode === 'edit') {
//     updateProposal(dispatch, this.props.form.id, proposal.id, form, currentStepId);
//   } else {
//     submitProposal(dispatch, this.props.form.id, form, currentStepId).catch(e => {
//       if (
//         e.response &&
//         e.response.errors &&
//         e.response.errors.errors.includes('global.address_not_in_zone')
//       ) {
//         const errors = this.state.errors;
//         this.setState({
//           errors: { ...errors, address: ['proposal.constraints.address_in_zone'] },
//         });
//         return;
//       }
//       throw e;
//     });
//   }
// } else {
//   dispatch(cancelSubmitProposal());
// }
}

const validate = () => {
  // notBlank: { message: 'proposal.constraints.field_mandatory' },
    // min: { value: 2, message: 'proposal.constraints.title_min_value_for_draft' },
    // notBlank: { message: 'proposal.constraints.title_for_draft' },
    // minValue: { value: 0, message: 'proposal.constraints.theme' },
    // form.usingAddress notBlank: { message: 'proposal.constraints.address' },

    // if (features.districts && form.usingDistrict && form.districtMandatory) {
    //   this.formValidationRules.district = {
    //     notBlank: { message: 'proposal.constraints.district' },
    //   };
    //   return;
    // }

    // if (categories.length && form.usingCategories && form.categoryMandatory) {
    //   this.formValidationRules.category = {
    //     notBlank: { message: 'proposal.constraints.category' },
    //   };
    //   return;
    // }

    // title: {
    //   min: { value: 2, message: 'proposal.constraints.title' },
    //   notBlank: { message: 'proposal.constraints.title' },
    // },
    // summary: {
    //   min: { value: 2, message: 'proposal.constraints.summary' },
    //   max: { value: 140, message: 'proposal.constraints.summary' },
    // },
    // body: {
    //   min: { value: 2, message: 'proposal.constraints.body' },
    //   notBlankHtml: { message: 'proposal.constraints.body' },
    // },
    // address: {
    //   notBlank: { message: 'proposal.constraints.address' },
    // },
};

const autocompleteItem = ({ formattedSuggestion }: { formattedSuggestion: Object }) => (
  <div className="places-autocomplete">
    <strong>{formattedSuggestion.mainText}</strong> {formattedSuggestion.secondaryText}
  </div>
);

export class ProposalForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      titleSuggestions: [],
      isLoadingTitleSuggestions: false,
      districtsFilteredByAddress: props.form.districts.map(district => district.id),
      address: props.proposal && props.proposal.address ? JSON.parse(props.proposal.address)[0].formatted_address : '',
    };
  };

  componentWillMount() {
    this.handleTitleChangeDebounced = debounce(this.handleTitleChangeDebounced, 500);
  }

  // if (this.state.form.address !== '') {
  //   const address = JSON.parse(this.state.form.address);
  //   const location = address[0].geometry.location;
  //   if (location !== null) {
  //     this.retrieveDistrictForLocation(location, true);
  //   }
  // }

  // handleTitleChange(e) {
  //   e.persist();
  //   const title = e.target.value;
  //   this.setState(prevState => ({
  //     form: { ...prevState.form, title },
  //   }));
  //   this.handleTitleChangeDebounced(title);
  // },
  //
  // handleAddressChange(address) {
  //   const { form } = this.props;
  //   geocodeByAddress(address)
  //     .then(results => {
  //       this.setState(prevState => ({
  //         form: { ...prevState.form, address: JSON.stringify(results) },
  //       }));
  //       this.setState(prevState => ({
  //         ...prevState,
  //         address: results[0].formatted_address,
  //         errors: { ...prevState.errors, address: [] },
  //       }));
  //       if (form.proposalInAZoneRequired) {
  //         this.retrieveDistrictForLocation(results[0].geometry.location);
  //       }
  //     })
  //     .catch(error => {
  //       this.resetAddressField();
  //       console.error('Google places error!', error); // eslint-disable-line
  //     });
  // },

  // handleTitleChangeDebounced(title) {
  //   this.setState({
  //     suggestions: [],
  //   });
  //   if (title.length > 3) {
  //     this.setState({ isLoadingSuggestions: true });
  //     loadSuggestions(this.props.currentStepId, title).then(res => {
  //       if (this.state.form.title === title) {
  //         // last request only
  //         this.setState({
  //           suggestions: res.proposals,
  //           isLoadingSuggestions: false,
  //         });
  //       }
  //     });
  //   }
  // },

  // retrieveDistrictForLocation(location: LatLng, isEditMode: ?Boolean = false): void {
  //   this.setState({
  //     loadingDistricts: true,
  //   });
  //   if (typeof location.lat === 'function' || typeof location.lng === 'function') {
  //     // Google API return the lat and lng as a function, whereas when editing, I get those values directly from the
  //     // component as a value so I have to convert the function to a value to have the same output in edit and creation
  //     [location.lat, location.lng] = [location.lat(), location.lng()];
  //   }
  //   Fetcher.graphql({
  //     operationName: 'availableDistrictsForLocalisation',
  //     query,
  //     variables: {
  //       proposalFormId: this.props.form.id,
  //       latitude: location.lat,
  //       longitude: location.lng,
  //     },
  //   }).then(response => {
  //     const form = { ...this.state.form };
  //     const districtsFilteredByAddress = response.data.availableDistrictsForLocalisation.map(
  //       district => district.id,
  //     );
  //     if (!isEditMode) {
  //       form.district = districtsFilteredByAddress.length === 0 ? null : districtsFilteredByAddress[0];
  //     }
  //     this.setState({
  //       districtsFilteredByAddress,
  //       form,
  //       loadingDistricts: false,
  //     });
  //   });
  // },

  render() {
    const { form, intl, features, themes, categories, proposal } = this.props;

    const title = '';
    const optional = (
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.form.optional" />
      </span>
    );
    return (
      <form id="proposal-form">
        {proposal.isSubmittingDraft ? (
          <div className="mt-20">
            <div dangerouslySetInnerHTML={{ __html: form.description }} />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: form.description }} />
        )}
        <Field
          name="title"
          component={component}
          type="text"
          id="proposal_title"
          autoComplete="off"
          help={form.titleHelpText}
          // onChange={this.handleTitleChange}
          label={<FormattedMessage id="proposal.title" />}
          addonAfter={
            this.state.isLoadingTitleSuggestions ? (
              <Glyphicon glyph="refresh" className="glyphicon-spin" />
            ) : (
              <Glyphicon glyph="refresh" />
            )
          }
        />
        <Collapse in={this.state.titleSuggestions.length > 0}>
          <Panel
            header={
              <FormattedMessage
                id="proposal.suggest_header"
                values={{
                  matches: this.state.titleSuggestions.length,
                  terms: title.split(' ').length,
                }}
              />
            }>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {this.state.titleSuggestions.slice(0, 5).map(suggest => (
                <li>
                  <a href={suggest._links.show} className="external-link">
                    {suggest.title}
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
          help={form.summaryHelpText}
          label={
            <span>
              <FormattedMessage id="proposal.summary" />
              {optional}
            </span>
          }
        />
        {features.themes &&
          form.usingThemes && (
            <Field
              name="theme"
              id="proposal_theme"
              type="select"
              component={component}
              help={form.themeHelpText}
              label={
                <span>
                  <FormattedMessage id="proposal.theme" />
                  {!form.themeMandatory && optional}
                </span>
              }>
              <FormattedMessage id="proposal.select.theme">
                {message => (
                  <option value={-1} disabled>
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
        {categories.length > 0 &&
          form.usingCategories && (
            <Field
              id="proposal_category"
              type="select"
              name="category"
              component={component}
              help={form.categoryHelpText}
              label={
                <span>
                  <FormattedMessage id="proposal.category" />
                  {!form.categoryMandatory && optional}
                </span>
              }>
              <FormattedMessage id="proposal.select.category">
                {message => (
                  <option value={-1} disabled>
                    {message}
                  </option>
                )}
              </FormattedMessage>
              {categories.map(category => {
                return (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                );
              })}
            </Field>
          )}
          {/* {form.usingAddress && (
            <div
              className={`form-group${this.state.errors.address.length > 0 ? ' has-warning' : ''}`}>
              <label className="control-label h5" htmlFor="proposal_address">
                <FormattedMessage id="proposal.map.form.field" />
              </label>
              {form.addressHelpText && <span className="help-block">{form.addressHelpText}</span>}
              <div className="places-autocomplete__field">
                <div className="places-autocomplete__icon">
                  <i className="cap cap-magnifier" />
                </div>
                <PlacesAutocomplete
                  inputProps={{
                    onChange: address => {
                      this.setState(prevState => ({ ...prevState, address }));
                    },
                    placeholder: intl.formatMessage({
                      id: 'proposal.map.form.placeholder',
                    }),
                    value: this.state.address,
                    type: 'text',
                    id: 'proposal_address',
                  }}
                  autocompleteItem={autocompleteItem}
                  onEnterKeyDown={this.handleAddressChange}
                  onSelect={this.handleAddressChange}
                  onError={() => {
                    this.resetAddressField();
                  }}
                  classNames={{
                    root: `${this.state.errors.address.length > 0 ? 'form-control-warning' : ''}`,
                    input: 'form-control',
                    autocompleteContainer: {
                      zIndex: 9999,
                      position: 'absolute',
                      top: '100%',
                      backgroundColor: 'white',
                      border: '1px solid #555555',
                      width: '100%',
                    },
                    autocompleteItem: {
                      zIndex: 9999,
                      backgroundColor: '#ffffff',
                      padding: '10px',
                      color: '#555555',
                      cursor: 'pointer',
                    },
                    autocompleteItemActive: {
                      zIndex: 9999,
                      backgroundColor: '#fafafa',
                    },
                  }}
                />
              </div>

              {this.state.errors.address.length > 0 && this.renderFormErrors('address')}
            </div>
          )} */}
          {form.usingAddress && (
            <Field
              id="proposal_address"
              component={component}
              type="address"
              name="addressText"
              formName={formName}
              label={<FormattedMessage id="proposal.map.form.field" />}
              placeholder="proposal.map.form.placeholder"
            />
          )}
        {features.districts &&
          form.usingDistrict &&
          form.districts.length > 0 && (
            <Field
              id="proposal_district"
              type="select"
              name="district"
              component={component}
              help={form.districtHelpText}
              label={
                <span>
                  <FormattedMessage id="proposal.district" />
                  {!form.districtMandatory && optional}
                </span>
              }>
              <FormattedMessage id="proposal.select.district">
                {message => <option value="">{message}</option>}
              </FormattedMessage>
              {this.state.districtsFilteredByAddress.map(districtId => (
                <option key={districtId} value={districtId}>
                  {form.districts.filter(district => district.id === districtId)[0].name}
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
          help={form.descriptionHelpText}
        />
        <FieldArray
          name="responses"
          component={({ fields }) => (
            <div>
              {fields.map((field, index) => {
                const response = proposal.responses.filter(
                  res => res && res.question.id === field.id,
                )[0];
                return (
                  <ProposalPrivateField show={field.private} key={index}>
                    <Field
                      id={field.id}
                      name={`responses.${index}.${field.type !== 'medias'
                        ? 'value'
                        : 'medias'}`}
                      type={field.type}
                      component={component}
                      help={field.helpText}
                      label={
                        <span>
                          {field.question}
                          {!field.required && optional}
                        </span>
                      }
                    />
                    {response &&
                      response.medias &&
                      response.medias.length && (
                        <ProposalMediaResponse medias={response.medias} />
                      )}
                  </ProposalPrivateField>
                );
              })}
            </div>
          )}
          fields={form.questions}
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
          help={form.illustrationHelpText}
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

const mapStateToProps = (state: GlobalState, { proposal }: Props) => ({
  initialValues: {
    title: proposal ? proposal.title : null,
    summary: proposal ? proposal.summary : null,
    body: proposal ? proposal.body : null,
    theme: proposal && proposal.theme ? proposal.theme.id : null,
    district: proposal && proposal.district ? proposal.district.id : null,
    category: proposal && proposal.category ? proposal.category.id : null,
    media: proposal ? proposal.media : null,
    address: proposal.address ? proposal.address : '',
    responses: proposal.responses ? proposal.responses : [],
  },
  // addressJson: proposal.address ? JSON.parse(proposal.address)[0].formatted_address : '',
  features: state.default.features,
  themes: state.default.themes,
  currentStepId: state.project.currentProjectStepById,
  isSubmittingDraft: state.proposal.isDraft || false,
});

const container = connect(mapStateToProps)(injectIntl(ProposalForm));

export default container;

// export default createFragmentContainer(
//   container,
//   {
//     proposal: graphql`
//       fragment ProposalForm_proposal on Proposal {
//         id
//         title
//         body
//         summary
//         responses {
//           question {
//             id
//           }
//           ... on ValueResponse {
//             value
//           }
//           ... on MediaResponse {
//             medias {
//               id
//               name
//               size
//               url
//             }
//           }
//         }
//         media {
//           id
//           url
//         }
//         form
//     `,
//     form: graphql`
//       fragment ProposalForm_form on ProposalForm {
//         id
//         districts {
//           id
//           name
//         }
//         categories {
//           id
//           name
//         }
//         questions {
//           id
//           title
//           type
//           position
//           private
//           required
//         }
//         usingDistrict
//         districtMandatory
//         districtHelpText
//         usingThemes
//         themeMandatory
//         usingCategories
//         categoryMandatory
//         categoryHelpText
//         usingAddress
//         titleHelpText
//         descriptionHelpText
//     }`
//   }
// );
