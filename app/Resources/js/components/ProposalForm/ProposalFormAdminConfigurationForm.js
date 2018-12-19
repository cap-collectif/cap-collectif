// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector, Field, FieldArray, type FormProps } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Panel, Col, Row, Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import { submitQuestion } from '../../utils/submitQuestion';
import select from '../Form/Select';
import ProposalFormAdminCategories from './ProposalFormAdminCategories';
import ProposalFormAdminQuestions from './ProposalFormAdminQuestions';
import ProposalFormAdminDistricts from './ProposalFormAdminDistricts';
import component from '../Form/Field';
import toggle from '../Form/Toggle';
import UpdateProposalFormMutation from '../../mutations/UpdateProposalFormMutation';
import AlertForm from '../Alert/AlertForm';
import type { ProposalFormAdminConfigurationForm_proposalForm } from './__generated__/ProposalFormAdminConfigurationForm_proposalForm.graphql';
import type { State, FeatureToggles } from '../../types';

type RelayProps = {| proposalForm: ProposalFormAdminConfigurationForm_proposalForm |};
type Props = {|
  ...RelayProps,
  ...FormProps,
  intl: IntlShape,
  usingAddress: boolean,
  usingCategories: boolean,
  usingThemes: boolean,
  usingDescription: boolean,
  usingIllustration: boolean,
  usingSummary: boolean,
  usingDistrict: boolean,
  features: FeatureToggles,
|};

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

const validate = (values: Object) => {
  const errors = {};

  if (!values.description || values.description.length <= 2) {
    errors.description = 'admin.fields.proposal_form.errors.introduction';
  }

  if (values.usingCategories && values.categories.length === 0) {
    errors.categories = 'admin.fields.proposal_form.errors.categories';
  }

  if (values.usingAddress) {
    if (!values.zoomMap || values.zoomMap.length === 0) {
      errors.zoomMap = 'admin.fields.proposal_form.errors.zoom';
    }

    if (!values.latMap || values.latMap.length === 0) {
      errors.latMap = 'admin.fields.proposal_form.errors.lat';
    }

    if (!values.lngMap || values.lngMap.length === 0) {
      errors.lngMap = 'admin.fields.proposal_form.errors.lng';
    }
  }

  if (values.usingDistrict) {
    if (values.districts.length === 0) {
      errors.districts = 'admin.fields.proposal_form.errors.districts';
    }
    if (values.districts.length) {
      const districtsArrayErrors = [];
      values.districts.forEach((district: Object, districtIndex: number) => {
        const districtErrors = {};
        if (!district.name || district.name.length === 0) {
          districtErrors.title = 'admin.fields.proposal_form.errors.district.name';
          districtsArrayErrors[districtIndex] = districtErrors;
        }

        if (!district.geojson || district.geojson.length === 0) {
          districtErrors.title = 'admin.fields.proposal_form.errors.district.geojson';
          districtsArrayErrors[districtIndex] = districtErrors;
        }
      });

      if (districtsArrayErrors.length) {
        errors.districts = districtsArrayErrors;
      }
    }
  }

  if (values.questions.length) {
    const questionsArrayErrors = [];
    values.questions.forEach((question: Object, questionIndex: number) => {
      const questionErrors = {};
      if (!question.title || question.title.length === 0) {
        questionErrors.title = 'admin.fields.proposal_form.errors.question.title';
        questionsArrayErrors[questionIndex] = questionErrors;
      }

      if (!question.type || question.type.length === 0) {
        questionErrors.type = 'admin.fields.proposal_form.errors.question.type';
        questionsArrayErrors[questionIndex] = questionErrors;
      }
    });

    if (questionsArrayErrors.length) {
      errors.questions = questionsArrayErrors;
    }
  }

  return errors;
};

const headerPanelUsingCategories = (
  <div id="proposal_form_admin_category_panel">
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
  <div id="address">
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

const headerPanelUsingDescription = (
  <div id="description">
    <h4 className="pull-left">
      <FormattedMessage id="proposal_form.description" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_description_field"
        name="usingDescription"
        component={toggle}
        normalize={val => !!val}
      />
    </div>
    <div className="clearfix" />
  </div>
);

const headerPanelUsingSummary = (
  <div id="summary">
    <h4 className="pull-left">
      <FormattedMessage id="proposal_form.summary" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_summary_field"
        name="usingSummary"
        component={toggle}
        normalize={val => !!val}
      />
    </div>
    <div className="clearfix" />
  </div>
);

const headerPanelUsingIllustration = (
  <div id="illustration">
    <h4 className="pull-left">
      <FormattedMessage id="proposal_form.illustration" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_illustration_field"
        name="usingIllustration"
        component={toggle}
        normalize={val => !!val}
      />
    </div>
    <div className="clearfix" />
  </div>
);
const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const input = {
    ...values,
    id: undefined,
    proposalFormId: props.proposalForm.id,
    districts: values.districts.map(district => ({ ...district })),
    categories: values.categories.map(category => ({ ...category })),
    questions: submitQuestion(values.questions),
  };

  return UpdateProposalFormMutation.commit({ input });
};

export class ProposalFormAdminConfigurationForm extends React.Component<Props> {
  render() {
    const {
      intl,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      pristine,
      handleSubmit,
      submitting,
      usingAddress,
      usingThemes,
      usingCategories,
      usingDescription,
      usingSummary,
      usingIllustration,
      usingDistrict,
      features,
    } = this.props;
    const optional = (
      <span className="excerpt">
        {' '}
        <FormattedMessage id="global.form.optional" />
      </span>
    );

    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal_form.admin.configuration.form" />
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.form.configuration' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>

        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <Field
              name="isProposalForm"
              component={select}
              id="proposal_form_isProposal"
              label={<FormattedMessage id="object-deposited" />}
              options={[
                { value: true, label: intl.formatMessage({ id: 'opinion.header.opinion' }) },
                {
                  value: false,
                  label: intl.formatMessage({ id: 'admin.fields.response.question' }),
                },
              ]}
            />
            <Field
              name="description"
              component={component}
              type="editor"
              id="proposal_form_description"
              label={<FormattedMessage id="proposal_form.introduction" />}
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="proposal_form.admin.configuration.permanent_field" />
              </h3>
            </div>
            <div className="panel panel-default">
              <h4 className="panel-heading m-0">
                <FormattedMessage id="proposal_form.title" />
              </h4>
              <div className="panel-body">
                <Field
                  name="titleHelpText"
                  component={component}
                  type="text"
                  id="proposal_form_title_help_text"
                  label={
                    <span>
                      <FormattedMessage id="proposal_form.help_text" />
                      {optional}
                    </span>
                  }
                />
              </div>
            </div>
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="proposal_form.admin.configuration.optional_field" />
              </h3>
            </div>
            <Panel
              id="proposal_form_admin_description_panel_body"
              expanded={usingDescription}
              onToggle={() => {}}>
              <Panel.Heading>{headerPanelUsingDescription}</Panel.Heading>
              <Panel.Collapse>
                <Panel.Body>
                  <Field
                    name="descriptionMandatory"
                    component={component}
                    type="checkbox"
                    id="proposal_form_description_mandatory">
                    <FormattedMessage id="proposal_form.required" />
                  </Field>
                  <Field
                    name="descriptionHelpText"
                    component={component}
                    type="text"
                    id="proposal_form_description_help_text"
                    label={
                      <span>
                        <FormattedMessage id="proposal_form.help_text" />
                        {optional}
                      </span>
                    }
                  />
                </Panel.Body>
              </Panel.Collapse>
            </Panel>
            <Panel
              id="proposal_form_admin_summary_panel_body"
              expanded={usingSummary}
              onToggle={() => {}}>
              <Panel.Heading>{headerPanelUsingSummary}</Panel.Heading>
              <Panel.Collapse>
                <Panel.Body>
                  <Field
                    name="summaryHelpText"
                    component={component}
                    type="text"
                    id="proposal_form_summary_help_text"
                    label={
                      <span>
                        <FormattedMessage id="proposal_form.help_text" />
                        {optional}
                      </span>
                    }
                  />
                </Panel.Body>
              </Panel.Collapse>
            </Panel>
            <Panel
              id="proposal_form_admin_illustration_panel_body"
              expanded={usingIllustration}
              onToggle={() => {}}>
              <Panel.Heading>{headerPanelUsingIllustration}</Panel.Heading>
              <Panel.Collapse>
                <Panel.Body>
                  <Field
                    name="illustrationHelpText"
                    component={component}
                    type="text"
                    id="proposal_form_illustration_help_text"
                    label={
                      <span>
                        <FormattedMessage id="proposal_form.help_text" />
                        {optional}
                      </span>
                    }
                  />
                </Panel.Body>
              </Panel.Collapse>
            </Panel>
            {features.themes && (
              <Panel expanded={usingThemes} onToggle={() => {}}>
                <Panel.Heading>{headerPanelUsingThemes}</Panel.Heading>
                <Panel.Collapse>
                  <Panel.Body>
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
                      label={
                        <span>
                          <FormattedMessage id="proposal_form.help_text" />
                          {optional}
                        </span>
                      }
                    />
                  </Panel.Body>
                </Panel.Collapse>
              </Panel>
            )}
            <Panel
              id="proposal_form_admin_category_panel_body"
              expanded={usingCategories}
              onToggle={() => {}}>
              <Panel.Heading>{headerPanelUsingCategories}</Panel.Heading>
              <Panel.Collapse>
                <Panel.Body>
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
                    label={
                      <span>
                        <FormattedMessage id="proposal_form.help_text" />
                        {optional}
                      </span>
                    }
                  />
                  <FieldArray name="categories" component={ProposalFormAdminCategories} />
                </Panel.Body>
              </Panel.Collapse>
            </Panel>
            <Panel id="address-body" expanded={usingAddress} onToggle={() => {}}>
              <Panel.Heading>{headerPanelUsingAddress}</Panel.Heading>
              <Panel.Collapse>
                <Panel.Body>
                  <Field
                    name="addressHelpText"
                    component={component}
                    type="text"
                    id="proposal_form_address_help_text"
                    label={
                      <span>
                        <FormattedMessage id="proposal_form.help_text" />
                        {optional}
                      </span>
                    }
                  />
                  <p className="link">
                    <Glyphicon glyph="info-sign" />{' '}
                    <FormattedMessage id="the-proposals-will-be-posted-on-a-map" />
                  </p>
                  <Field
                    name="proposalInAZoneRequired"
                    component={component}
                    type="checkbox"
                    id="proposal_form_district_proposalInAZoneRequired">
                    <FormattedMessage id="proposal_form.proposalInAZoneRequired" />
                  </Field>
                  <h5 className="mt-20 font-weight-bold">
                    <FormattedMessage id="initial-position-of-the-map" />
                  </h5>
                  <Row>
                    <Col xs={12} md={4}>
                      <Field
                        name="latMap"
                        component={component}
                        type="number"
                        id="proposal_form_lat_map"
                        normalize={val => val && parseFloat(val)}
                        lang="us"
                        step="any"
                        label={<FormattedMessage id="proposal_form.lat_map" />}
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <Field
                        name="lngMap"
                        component={component}
                        type="number"
                        id="proposal_form_lng_map"
                        normalize={val => val && parseFloat(val)}
                        lang="us"
                        step="any"
                        label={<FormattedMessage id="proposal_form.lng_map" />}
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <Field
                        name="zoomMap"
                        component={component}
                        type="select"
                        id="proposal_form_zoom_map"
                        normalize={val => (val ? parseInt(val, 10) : null)}
                        label={<FormattedMessage id="proposal_form.zoom" />}>
                        <FormattedMessage id="proposal_form.select.zoom">
                          {(message: string) => <option value="">{message}</option>}
                        </FormattedMessage>
                        {zoomLevels.map(level => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </Field>
                    </Col>
                  </Row>
                </Panel.Body>
              </Panel.Collapse>
            </Panel>
            {features.districts && (
              <Panel expanded={usingDistrict} onToggle={() => {}}>
                <Panel.Heading>{headerPanelUsingDistrict}</Panel.Heading>
                <Panel.Collapse>
                  <Panel.Body>
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
                      label={
                        <span>
                          <FormattedMessage id="proposal_form.help_text" />
                          {optional}
                        </span>
                      }
                    />
                    <FieldArray name="districts" component={ProposalFormAdminDistricts} />
                  </Panel.Body>
                </Panel.Collapse>
              </Panel>
            )}
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="proposal_form.admin.configuration.custom_field" />
              </h3>
            </div>
            <FieldArray
              name="questions"
              component={ProposalFormAdminQuestions}
              formName={formName}
            />
            <Field
              name="allowAknowledge"
              component={component}
              type="checkbox"
              id="proposal_form_allow_aknowledge">
              <FormattedMessage id="automatically-send-an-acknowledgement-of-receipt-by-email-to-the-contributor" />
            </Field>
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={invalid || pristine || submitting}
                type="submit"
                bsStyle="primary"
                id="proposal-form-admin-content-save">
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              <Button bsStyle="danger" disabled>
                <FormattedMessage id="global.delete" />
              </Button>
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            </ButtonToolbar>
          </form>
        </div>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,

  enableReinitialize: true,
  form: formName,
})(ProposalFormAdminConfigurationForm);

const selector = formValueSelector(formName);

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: props.proposalForm,
  usingAddress: selector(state, 'usingAddress'),
  usingCategories: selector(state, 'usingCategories'),
  usingThemes: selector(state, 'usingThemes'),
  usingDistrict: selector(state, 'usingDistrict'),
  usingDescription: selector(state, 'usingDescription'),
  usingSummary: selector(state, 'usingSummary'),
  usingIllustration: selector(state, 'usingIllustration'),
  isProposalForm: selector(state, 'isProposalForm'),
  features: state.default.features,
});

const container = connect(mapStateToProps)(form);
const intlContainer = injectIntl(container);

export default createFragmentContainer(
  intlContainer,
  graphql`
    fragment ProposalFormAdminConfigurationForm_proposalForm on ProposalForm {
      id
      description
      usingThemes
      themeMandatory
      usingCategories
      categoryMandatory
      usingAddress
      usingDescription
      usingSummary
      usingIllustration
      descriptionMandatory
      latMap
      lngMap
      zoomMap
      proposalInAZoneRequired
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
      allowAknowledge
      isProposalForm
      districts {
        id
        name
        displayedOnMap
        geojson
        border {
          enabled
          size
          color
          opacity
        }
        background {
          enabled
          color
          opacity
        }
      }
      categories {
        id
        name
      }
      questions {
        id
        ...responsesHelper_adminQuestion @relay(mask: false)
      }
    }
  `,
);
