// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, Field, FieldArray } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Panel, Col, Row, Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import ProposalFormAdminCategories from './ProposalFormAdminCategories';
import ProposalFormAdminQuestions from './ProposalFormAdminQuestions';
import ProposalFormAdminDistricts from './ProposalFormAdminDistricts';
import component from '../Form/Field';
import toggle from '../Form/Toggle';
import UpdateProposalFormMutation from '../../mutations/UpdateProposalFormMutation';
import type { ProposalFormAdminConfigurationForm_proposalForm } from './__generated__/ProposalFormAdminConfigurationForm_proposalForm.graphql';
import type { State, FeatureToggles } from '../../types';

type FormValues = ProposalFormAdminConfigurationForm_proposalForm;
type RelayProps = { proposalForm: ProposalFormAdminConfigurationForm_proposalForm };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  usingAddress: boolean,
  usingCategories: boolean,
  usingThemes: boolean,
  usingDistrict: boolean,
  features: FeatureToggles,
};

const zoomLevels = [
  { id: 1, name: '1 - Le monde' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
  { id: 4, name: '4' },
  { id: 5, name: '5 - La masse continentale/le continent' },
  { id: 6, name: '6' },
  { id: 7, name: '7' },
  { id: 8, name: '8' },
  { id: 9, name: '9' },
  { id: 10, name: '10 - Ville' },
  { id: 11, name: '11' },
  { id: 12, name: '12' },
  { id: 13, name: '13' },
  { id: 14, name: '14' },
  { id: 15, name: '15 - Rues' },
  { id: 16, name: '16' },
  { id: 17, name: '17' },
  { id: 18, name: '18' },
  { id: 19, name: '19' },
  { id: 20, name: '20 - Immeubles' },
];
const formName = 'proposal-form-admin-configuration';

const validate = () => {
  return {};
};

const headerPanelUsingCategories = (
  <div>
    <h4 className="pull-left">
      <FormattedMessage id="proposal_form.category" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_categories_field"
        name="usingCategories"
        component={toggle}
        normalize={val => !!val}
      />
    </div>
    <div className="clearfix" />
  </div>
);

const headerPanelUsingThemes = (
  <div>
    <h4 className="pull-left">
      <FormattedMessage id="proposal_form.theme" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_themes_field"
        name="usingThemes"
        component={toggle}
        normalize={val => !!val}
      />
    </div>
    <div className="clearfix" />
  </div>
);

const headerPanelUsingAddress = (
  <div>
    <h4 className="pull-left">
      <FormattedMessage id="proposal_form.address" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_address_field"
        name="usingAddress"
        component={toggle}
        normalize={val => !!val}
      />
    </div>
    <div className="clearfix" />
  </div>
);

const headerPanelUsingDistrict = (
  <div>
    <h4 className="pull-left">
      <FormattedMessage id="proposal_form.districts" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_district_field"
        name="usingDistrict"
        component={toggle}
        normalize={val => !!val}
      />
    </div>
    <div className="clearfix" />
  </div>
);

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const input = {
    ...values,
    id: undefined,
    proposalFormId: props.proposalForm.id,
    districts: values.districts.map(d => ({ ...d, id: undefined })),
    categories: values.categories.map(d => ({ ...d, id: undefined })),
  };
  delete input.customFields;
  return UpdateProposalFormMutation.commit({ input }).then(() => {
    location.reload();
  });
};

export class ProposalFormAdminConfigurationForm extends Component<Props> {
  render() {
    const {
      invalid,
      pristine,
      handleSubmit,
      submitting,
      usingAddress,
      usingThemes,
      usingCategories,
      usingDistrict,
      features,
    } = this.props;
    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h3
            className="box-title"
            style={{ fontSize: 22, padding: 0, paddingTop: 10, paddingBottom: 30 }}>
            Formulaire
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          <Field
            name="description"
            component={component}
            type="editor"
            id="proposal_form_description"
            label={<FormattedMessage id="proposal_form.introduction" />}
          />
          <div className="box-header">
            <h3
              className="box-title"
              style={{ fontSize: 22, padding: 0, paddingTop: 10, paddingBottom: 30 }}>
              Champs permanents
            </h3>
          </div>
          <div className="panel panel-default">
            <h4 className="panel-heading" style={{ margin: 0 }}>
              <FormattedMessage id="proposal_form.title" />
            </h4>
            <div className="panel-body">
              <Field
                name="titleHelpText"
                component={component}
                type="text"
                id="proposal_form_title_help_text"
                label={<FormattedMessage id="proposal_form.help_text" />}
              />
            </div>
          </div>
          <div className="panel panel-default">
            <h4 className="panel-heading" style={{ margin: 0 }}>
              <FormattedMessage id="proposal_form.summary" />
            </h4>
            <div className="panel-body">
              <Field
                name="summaryHelpText"
                component={component}
                type="text"
                id="proposal_form_summary_help_text"
                label={<FormattedMessage id="proposal_form.help_text" />}
              />
            </div>
          </div>
          <div className="panel panel-default">
            <h4 className="panel-heading" style={{ margin: 0 }}>
              <FormattedMessage id="proposal_form.description" />
            </h4>
            <div className="panel-body">
              <Field
                name="descriptionHelpText"
                component={component}
                type="text"
                id="proposal_form_description_help_text"
                label={<FormattedMessage id="proposal_form.help_text" />}
              />
            </div>
          </div>
          <div className="panel panel-default">
            <h4 className="panel-heading" style={{ margin: 0 }}>
              <FormattedMessage id="proposal_form.illustration" />
            </h4>
            <div className="panel-body">
              <Field
                name="illustrationHelpText"
                component={component}
                type="text"
                id="proposal_form_illustration_help_text"
                label={<FormattedMessage id="proposal_form.help_text" />}
              />
            </div>
          </div>
          <div className="box-header">
            <h3
              className="box-title"
              style={{ fontSize: 22, padding: 0, paddingTop: 30, paddingBottom: 30 }}>
              Champs optionnels
            </h3>
          </div>
          {features.themes && (
            <Panel collapsible expanded={usingThemes} header={headerPanelUsingThemes}>
              <Field
                name="themeMandatory"
                component={component}
                type="checkbox"
                id="proposal_form_theme_mandatory">
                <FormattedMessage id="proposal_form.required" />
              </Field>
              <Field
                name="themeHelpText"
                component={component}
                type="text"
                id="proposal_form_theme_help_text"
                label={<FormattedMessage id="proposal_form.help_text" />}
              />
            </Panel>
          )}
          <Panel collapsible expanded={usingCategories} header={headerPanelUsingCategories}>
            <Field
              name="categoryMandatory"
              component={component}
              type="checkbox"
              id="proposal_form_category_mandatory">
              <FormattedMessage id="proposal_form.required" />
            </Field>
            <Field
              name="categoryHelpText"
              component={component}
              type="text"
              id="proposal_form_category_help_text"
              label={<FormattedMessage id="proposal_form.help_text" />}
            />
            <FieldArray name="categories" component={ProposalFormAdminCategories} />
          </Panel>
          <Panel collapsible expanded={usingAddress} header={headerPanelUsingAddress}>
            <Field
              name="addressHelpText"
              component={component}
              type="text"
              id="proposal_form_address_help_text"
              label={<FormattedMessage id="proposal_form.help_text" />}
            />
            <p className="link">
              <Glyphicon glyph="info-sign" /> Les propositions seront affichées sur une carte
            </p>
            <h5 style={{ fontWeight: 'bold', marginTop: 20 }}>Position initiale de la carte</h5>
            <Row>
              <Col xs={12} md={4}>
                <Field
                  name="latMap"
                  component={component}
                  type="number"
                  id="proposal_form_lat_map"
                  label={<FormattedMessage id="proposal_form.lat_map" />}
                />
              </Col>
              <Col xs={12} md={4}>
                <Field
                  name="lngMap"
                  component={component}
                  type="number"
                  id="proposal_form_lng_map"
                  label={<FormattedMessage id="proposal_form.lng_map" />}
                />
              </Col>
              <Col xs={12} md={4}>
                <Field
                  name="zoomMap"
                  component={component}
                  type="select"
                  id="proposal_form_lat_map"
                  label={<FormattedMessage id="proposal_form.zoom" />}>
                  <FormattedMessage id="proposal_form.select.zoom">
                    {message => <option value="">{message}</option>}
                  </FormattedMessage>
                  {zoomLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </Field>
              </Col>
            </Row>
          </Panel>
          {features.districts && (
            <Panel collapsible expanded={usingDistrict} header={headerPanelUsingDistrict}>
              <Field
                name="districtMandatory"
                component={component}
                type="checkbox"
                id="proposal_form_district_mandatory">
                <FormattedMessage id="proposal_form.required" />
              </Field>
              <Field
                name="districtHelpText"
                component={component}
                type="text"
                id="proposal_form_district_help_text"
                label={<FormattedMessage id="proposal_form.help_text" />}
              />
              <FieldArray name="districts" component={ProposalFormAdminDistricts} />
            </Panel>
          )}
          <div className="box-header">
            <h3
              style={{ fontSize: 22, padding: 0, paddingTop: 30, paddingBottom: 30 }}
              className="box-title">
              Champs personnalisés
            </h3>
            <FieldArray name="customFields" component={ProposalFormAdminQuestions} />
          </div>
          <ButtonToolbar style={{ marginBottom: 10 }}>
            <Button disabled={invalid || pristine || submitting} type="submit" bsStyle="primary">
              <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
            </Button>
            <Button bsStyle="danger" disabled>
              <FormattedMessage id="global.delete" />
            </Button>
          </ButtonToolbar>
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(ProposalFormAdminConfigurationForm);

const selector = formValueSelector(formName);

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: props.proposalForm,
  usingAddress: selector(state, 'usingAddress'),
  usingCategories: selector(state, 'usingCategories'),
  usingThemes: selector(state, 'usingThemes'),
  usingDistrict: selector(state, 'usingDistrict'),
  features: state.default.features,
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalFormAdminConfigurationForm_proposalForm on ProposalForm {
      id
      description
      usingThemes
      themeMandatory
      usingCategories
      categoryMandatory
      usingAddress
      latMap
      lngMap
      zoomMap
      illustrationHelpText
      addressHelpText
      themeHelpText
      categoryHelpText
      descriptionHelpText
      summaryHelpText
      titleHelpText
      usingDistrict
      districtHelpText
      districtMandatory
      districts {
        id
        name
        displayedOnMap
        geojson
      }
      categories {
        id
        name
      }
      customFields {
        id
        title
        helpText
        inputType
        private
        required
      }
    }
  `,
);
