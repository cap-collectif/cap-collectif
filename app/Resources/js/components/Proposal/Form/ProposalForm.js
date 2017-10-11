import React, { PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Collapse, Panel, Glyphicon } from 'react-bootstrap';
import { debounce } from 'lodash';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import FlashMessages from '../../Utils/FlashMessages';
import Fetcher from '../../../services/Fetcher';
import ArrayHelper from '../../../services/ArrayHelper';
import Input from '../../Form/Input';
import ProposalPrivateField from '../ProposalPrivateField';
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

export const ProposalForm = React.createClass({
  propTypes: {
    intl: intlShape.isRequired,
    currentStepId: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    themes: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    features: PropTypes.object.isRequired,
    mode: PropTypes.string,
    proposal: PropTypes.object,
  },

  mixins: [DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      mode: 'create',
      proposal: {
        title: '',
        body: '',
        summary: null,
        theme: {
          id: -1,
        },
        district: {
          id: -1,
        },
        category: {
          id: -1,
        },
        responses: [],
      },
    };
  },

  getInitialState() {
    const { proposal } = this.props;
    return {
      form: {
        title: proposal.title,
        body: proposal.body,
        summary: proposal.summary,
        theme: proposal.theme ? proposal.theme.id : null,
        district: proposal.district ? proposal.district.id : null,
        category: proposal.category ? proposal.category.id : null,
        media: null,
        address: proposal.address ? proposal.address : '',
      },
      custom: this.getInitialFormAnswers(),
      errors: {
        title: [],
        body: [],
        theme: [],
        district: [],
        category: [],
        media: [],
        address: [],
      },
      loadingDistricts: false,
      suggestions: [],
      visibleDistricts: this.props.form.districts.map(district => district.id),
      address: proposal.address ? JSON.parse(proposal.address)[0].formatted_address : '',
    };
  },

  componentWillMount() {
    this.handleTitleChangeDebounced = debounce(this.handleTitleChangeDebounced, 500);
  },

  componentDidMount() {
    const { form } = this.props;
    form.fields.map(field => {
      const ref = `custom-${field.id}`;
      if (field.required) {
        this.formValidationRules[ref] = {
          notBlank: { message: 'proposal.constraints.field_mandatory' },
        };
      }
    });
    this.updateThemeConstraint();
    this.updateDistrictConstraint();
    this.updateCategoryConstraint();
    this.updateAddressConstraint();
    if (this.state.form.address !== '') {
      const address = JSON.parse(this.state.form.address);
      const location = address[0].geometry.location;
      if (location !== null) {
        this.retrieveDistrictForLocation(location, true);
      }
    }
  },

  componentWillReceiveProps(nextProps) {
    const {
      categories,
      features,
      isSubmitting,
      mode,
      proposal,
      dispatch,
      currentStepId,
    } = this.props;
    this.updateThemeConstraint();
    this.updateDistrictConstraint();
    this.updateCategoryConstraint();
    this.updateAddressConstraint();
    if (!isSubmitting && nextProps.isSubmitting) {
      if (this.isValid()) {
        const form = this.state.form;
        const responses = [];
        const custom = this.state.custom;
        Object.keys(custom).map(key => {
          const question = key.split('-')[1];
          if (typeof custom[key] !== 'undefined' && custom[key].length > 0) {
            responses.push({
              question,
              value: custom[key],
            });
          }
        });
        form.responses = responses;
        if (responses.length === 0) {
          delete form.responses;
        }
        if (!features.themes || !this.props.form.usingThemes || !form.theme) {
          delete form.theme;
        }
        if (!form.usingAddress && form.address.length === 0) {
          delete form.address;
        }
        if (!features.districts || !form.district || !this.props.form.usingDistrict) {
          delete form.district;
        }
        if (categories.length === 0 || !this.props.form.usingCategories) {
          delete form.category;
        }
        if (form.summary !== null && form.summary.length === 0) {
          form.summary = null;
        }
        if (mode === 'edit') {
          updateProposal(dispatch, this.props.form.id, proposal.id, form);
        } else {
          submitProposal(dispatch, this.props.form.id, form, currentStepId).catch(e => {
            if (
              e.response &&
              e.response.errors &&
              e.response.errors.errors.includes('global.address_not_in_zone')
            ) {
              const errors = this.state.errors;
              this.setState({
                errors: { ...errors, address: ['proposal.constraints.address_in_zone'] },
              });
              return;
            }
            throw e;
          });
        }
      } else {
        dispatch(cancelSubmitProposal());
      }
    }
  },

  getInitialFormAnswers() {
    const { form } = this.props;
    const custom = {};
    form.fields.map(field => {
      custom[`custom-${field.id}`] = this.getResponseForField(field.id);
    });
    return custom;
  },

  getResponseForField(id) {
    const { proposal } = this.props;
    const index = ArrayHelper.getElementIndexFromArray(
      proposal.responses,
      { field: { id } },
      'field',
      'id',
    );
    if (index > -1 && typeof proposal.responses[index].value !== 'undefined') {
      return proposal.responses[index].value;
    }
    return '';
  },

  handleTitleChange(e) {
    e.persist();
    const title = e.target.value;
    this.setState(prevState => ({
      form: { ...prevState.form, title },
    }));
    this.handleTitleChangeDebounced(title);
  },

  handleAddressChange(address) {
    geocodeByAddress(address)
      .then(results => {
        this.setState(prevState => ({
          form: { ...prevState.form, address: JSON.stringify(results) },
        }));
        this.setState(prevState => ({
          ...prevState,
          address: results[0].formatted_address,
          errors: { ...prevState.errors, address: [] },
        }));
        this.retrieveDistrictForLocation(results[0].geometry.location);
      })
      .catch(error => {
        this.resetAddressField();
        console.error('Google places error!', error); // eslint-disable-line
      });
  },

  resetAddressField() {
    this.setState(prevState => ({
      form: { ...prevState.form, address: '' },
    }));
    this.setState(prevState => ({
      ...prevState,
      address: '',
      errors: {
        ...prevState.errors,
        address: [{ message: 'proposal.constraints.address' }],
      },
    }));
  },

  handleTitleChangeDebounced(title) {
    this.setState({
      suggestions: [],
    });
    if (title.length > 3) {
      this.setState({ isLoadingSuggestions: true });
      loadSuggestions(this.props.currentStepId, title).then(res => {
        if (this.state.form.title === title) {
          // last request only
          this.setState({
            suggestions: res.proposals,
            isLoadingSuggestions: false,
          });
        }
      });
    }
  },

  retrieveDistrictForLocation(location: LatLng, isEditMode: ?Boolean = false): void {
    this.setState({
      loadingDistricts: true,
    });
    if (typeof location.lat === 'function' || typeof location.lng === 'function') {
      // Google API return the lat and lng as a function, whereas when editing, I get those values directly from the
      // component as a value so I have to convert the function to a value to have the same output in edit and creation
      [location.lat, location.lng] = [location.lat(), location.lng()];
    }
    Fetcher.graphql({
      operationName: 'availableDistrictsForLocalisation',
      query,
      variables: {
        proposalFormId: this.props.form.id,
        latitude: location.lat,
        longitude: location.lng,
      },
    }).then(response => {
      const form = { ...this.state.form };
      const visibleDistricts = response.data.availableDistrictsForLocalisation.map(
        district => district.id,
      );
      if (!isEditMode) {
        form.district = visibleDistricts.length === 0 ? null : visibleDistricts[0];
      }
      this.setState({
        visibleDistricts,
        form,
        loadingDistricts: false,
      });
    });
  },

  updateThemeConstraint() {
    const { features, form } = this.props;
    if (features.themes && form.usingThemes && form.themeMandatory) {
      this.formValidationRules.theme = {
        minValue: { value: 0, message: 'proposal.constraints.theme' },
      };
      return;
    }
    this.formValidationRules.theme = {};
  },

  updateAddressConstraint() {
    const { form } = this.props;
    if (form.usingAddress) {
      this.formValidationRules.address = {
        notBlank: { message: 'proposal.constraints.address' },
      };
      return;
    }
    this.formValidationRules.address = {};
  },

  updateDistrictConstraint() {
    const { features, form } = this.props;
    if (features.districts && form.usingDistrict && form.districtMandatory) {
      this.formValidationRules.district = {
        notBlank: { message: 'proposal.constraints.district' },
      };
      return;
    }
    this.formValidationRules.district = {};
  },

  updateCategoryConstraint() {
    const { categories, form } = this.props;
    if (categories.length && form.usingCategories && form.categoryMandatory) {
      this.formValidationRules.category = {
        notBlank: { message: 'proposal.constraints.category' },
      };
      return;
    }
    this.formValidationRules.category = {};
  },

  formValidationRules: {
    title: {
      min: { value: 2, message: 'proposal.constraints.title' },
      notBlank: { message: 'proposal.constraints.title' },
    },
    summary: {
      min: { value: 2, message: 'proposal.constraints.summary' },
      max: { value: 140, message: 'proposal.constraints.summary' },
    },
    body: {
      min: { value: 2, message: 'proposal.constraints.body' },
      notBlankHtml: { message: 'proposal.constraints.body' },
    },
    address: {
      notBlank: { message: 'proposal.constraints.address' },
    },
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    const { form, intl, features, themes, categories, proposal } = this.props;
    const optional = (
      <span className="excerpt">
        <FormattedMessage id="global.form.optional" />
      </span>
    );
    const themeLabel = (
      <span>
        <FormattedMessage id="proposal.theme" />
        {!form.themeMandatory && optional}
      </span>
    );
    const categoryLabel = (
      <span>
        <FormattedMessage id="proposal.category" />
        {!form.categoryMandatory && optional}
      </span>
    );
    const districtLabel = (
      <span>
        <FormattedMessage id="proposal.district" />
        {!form.districtMandatory && optional}
      </span>
    );
    const illustration = (
      <span>
        <FormattedMessage id="proposal.media" />
        {optional}
      </span>
    );

    const autocompleteItem = ({ formattedSuggestion }: { formattedSuggestion: Object }) => (
      <div className="places-autocomplete">
        <strong>{formattedSuggestion.mainText}</strong> {formattedSuggestion.secondaryText}
      </div>
    );
    return (
      <form id="proposal-form">
        {form.description && <div dangerouslySetInnerHTML={{ __html: form.description }} />}
        <Input
          id="proposal_title"
          type="text"
          autoComplete="off"
          value={this.state.form.title}
          help={form.titleHelpText}
          onChange={this.handleTitleChange}
          label={<FormattedMessage id="proposal.title" />}
          groupClassName={this.getGroupStyle('title')}
          errors={this.renderFormErrors('title')}
          addonAfter={
            this.state.isLoadingSuggestions ? (
              <Glyphicon glyph="refresh" className="glyphicon-spin" />
            ) : (
              <Glyphicon glyph="refresh" />
            )
          }
        />
        <Collapse in={this.state.suggestions.length > 0}>
          <Panel
            header={
              <FormattedMessage
                id="proposal.suggest_header"
                values={{
                  matches: this.state.suggestions.length,
                  terms: this.state.form.title.split(' ').length,
                }}
              />
            }>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {this.state.suggestions.slice(0, 5).map(suggest => (
                <li>
                  <a href={suggest._links.show} className="external-link">
                    {suggest.title}
                  </a>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => {
                this.setState({ suggestions: [] });
              }}>
              <FormattedMessage id="global.close" />
            </Button>
          </Panel>
        </Collapse>
        <Input
          id="proposal_summary"
          type="textarea"
          autoComplete="off"
          valueLink={this.linkState('form.summary')}
          label={
            <span>
              <FormattedMessage id="proposal.summary" />
              {optional}
            </span>
          }
          groupClassName={this.getGroupStyle('summary')}
          errors={this.renderFormErrors('summary')}
        />
        {features.themes &&
          form.usingThemes && (
            <Input
              id="proposal_theme"
              type="select"
              valueLink={this.linkState('form.theme')}
              label={themeLabel}
              groupClassName={this.getGroupStyle('theme')}
              errors={this.renderFormErrors('theme')}
              help={form.themeHelpText}>
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
            </Input>
          )}
        {categories.length > 0 &&
          form.usingCategories && (
            <Input
              id="proposal_category"
              type="select"
              valueLink={this.linkState('form.category')}
              label={categoryLabel}
              groupClassName={this.getGroupStyle('category')}
              errors={this.renderFormErrors('category')}
              help={form.categoryHelpText}>
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
            </Input>
          )}
        {form.usingAddress && (
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
        )}
        {features.districts &&
          form.usingDistrict &&
          form.districts.length > 0 && (
            <Input
              disabled={this.state.loadingDistricts}
              id="proposal_district"
              type="select"
              valueLink={this.linkState('form.district')}
              label={districtLabel}
              groupClassName={this.getGroupStyle('district')}
              errors={this.renderFormErrors('district')}
              help={form.districtHelpText}>
              <FormattedMessage id="proposal.select.district">
                {message => <option value="">{message}</option>}
              </FormattedMessage>
              {this.state.visibleDistricts.map(districtId => (
                <option key={districtId} value={districtId}>
                  {form.districts.filter(district => district.id === districtId)[0].name}
                </option>
              ))}
            </Input>
          )}
        <Input
          id="proposal_body"
          type="editor"
          name="body"
          label={<FormattedMessage id="proposal.body" />}
          help={form.descriptionHelpText}
          groupClassName={this.getGroupStyle('body')}
          errors={this.renderFormErrors('body')}
          valueLink={this.linkState('form.body')}
        />
        {form.fields.map(field => {
          const key = `custom-${field.id}`;
          const label = (
            <span>
              {field.question}
              {!field.required && optional}
            </span>
          );
          const input = (
            <Input
              key={key}
              id={`proposal_${key}`}
              type={field.type}
              label={label}
              groupClassName={this.getGroupStyle(key)}
              valueLink={this.linkState(`custom.${key}`)}
              help={field.helpText}
              errors={this.renderFormErrors(key)}
            />
          );
          return <ProposalPrivateField show={field.private} children={input} />;
        })}
        <Input
          id="proposal_media"
          type="image"
          image={proposal && proposal.media ? proposal.media.url : null}
          label={illustration}
          groupClassName={this.getGroupStyle('media')}
          errors={this.renderFormErrors('media')}
          valueLink={this.linkState('form.media')}
          help={form.descriptionHelpText}
        />
      </form>
    );
  },
});

const mapStateToProps = state => ({
  features: state.default.features,
  themes: state.default.themes,
  currentStepId: state.project.currentProjectStepById,
});

export default connect(mapStateToProps)(injectIntl(ProposalForm));
