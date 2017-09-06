// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { Col, Row, Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import component from '../Form/Field';
import toggle from '../Form/Toggle';
import { baseUrl } from '../../config';
import type { ProposalFormAdminConfigurationForm_proposalForm } from './__generated__/ProposalFormAdminConfigurationForm_proposalForm.graphql';
import type { State } from '../../types';

type DefaultProps = void;
type RelayProps = { proposalForm: ProposalFormAdminConfigurationForm_proposalForm };
type Props = RelayProps & {
  handleSubmit: () => void,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
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

const onSubmit = () => {};

export class ProposalFormAdminConfigurationForm extends Component<Props, void> {
  static defaultProps: DefaultProps;
  render() {
    const { invalid, pristine, handleSubmit, submitting, proposalForm } = this.props;
    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h4 className="box-title">Formulaire</h4>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot">
            <i className="fa fa-info-circle" /> Aide
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <Field
              name="introduction"
              component={component}
              type="editor"
              id="proposal_form_introduction"
              label={<FormattedMessage id="proposal_form.introduction" />}
            />
            <div className="box-header">
              <h4 className="box-title">Champs permanents</h4>
            </div>
            <div className="panel panel-default">
              <h5 className="panel-heading">
                <FormattedMessage id="proposal_form.title" />
              </h5>
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
              <h5 className="panel-heading">
                <FormattedMessage id="proposal_form.summary" />
              </h5>
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
              <h5 className="panel-heading">
                <FormattedMessage id="proposal_form.description" />
              </h5>
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
              <h5 className="panel-heading">
                <FormattedMessage id="proposal_form.illustration" />
              </h5>
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
              <h4 className="box-title">Champs optionnels</h4>
            </div>
            <div className="panel panel-default">
              <h5 className="panel-heading">
                <FormattedMessage id="proposal_form.theme" />
              </h5>
              <div className="pull-right">
                <Field
                  label=""
                  id="proposal_form_using_theme_field"
                  name="usingThemes"
                  component={toggle}
                  normalize={val => !!val}
                />
              </div>
              <div className="panel-body">
                <Field
                  name="themeMandatory"
                  component={component}
                  type="checkbox"
                  id="proposal_form_theme_mandatory"
                  label={<FormattedMessage id="proposal_form.required" />}
                />
                <Field
                  name="themeHelpText"
                  component={component}
                  type="text"
                  id="proposal_form_theme_help_text"
                  label={<FormattedMessage id="proposal_form.help_text" />}
                />
              </div>
            </div>
            <div className="panel panel-default">
              <h5 className="panel-heading">
                <FormattedMessage id="proposal_form.category" />
              </h5>
              <div className="pull-right">
                <Field
                  label=""
                  id="proposal_form_using_categories_field"
                  name="usingCategories"
                  component={toggle}
                  normalize={val => !!val}
                />
              </div>
              <div className="panel-body">
                <Field
                  name="categoryMandatory"
                  component={component}
                  type="checkbox"
                  id="proposal_form_category_mandatory"
                  label={<FormattedMessage id="proposal_form.required" />}
                />
                <Field
                  name="categoryHelpText"
                  component={component}
                  type="text"
                  id="proposal_form_category_help_text"
                  label={<FormattedMessage id="proposal_form.help_text" />}
                />
                <h6>Liste des catégories</h6>
              </div>
            </div>
            <div className="panel panel-default">
              <h5 className="panel-heading">
                <FormattedMessage id="proposal_form.address" />
              </h5>
              <div className="pull-right">
                <Field
                  label=""
                  id="proposal_form_using_address_field"
                  name="usingAddress"
                  component={toggle}
                  normalize={val => !!val}
                />
              </div>
              <div className="panel-body">
                <Field
                  name="addressHelpText"
                  component={component}
                  type="text"
                  id="proposal_form_address_help_text"
                  label={<FormattedMessage id="proposal_form.help_text" />}
                />
                <p>
                  <Glyphicon glyph="info-sign" /> Les propositions seront affichées sur une carte
                </p>
                <h6>Position initiale de la carte</h6>
                <Row>
                  <Col xs={1} md={4}>
                    <Field
                      name="latMap"
                      component={component}
                      type="number"
                      id="proposal_form_lat_map"
                      label={<FormattedMessage id="proposal_form.lat_map" />}
                    />
                  </Col>
                  <Col xs={1} md={4}>
                    <Field
                      name="lngMap"
                      component={component}
                      type="number"
                      id="proposal_form_lng_map"
                      label={<FormattedMessage id="proposal_form.lng_map" />}
                    />
                  </Col>
                  <Col xs={1} md={4}>
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
              </div>
            </div>
            <div className="box-header">
              <h4 className="box-title">Champs personnalisés</h4>
            </div>
            <ButtonToolbar style={{ marginBottom: 10 }}>
              <Button disabled={invalid || pristine || submitting} type="submit" bsStyle="primary">
                <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
              </Button>
              <Button
                bsStyle="danger"
                href={`${baseUrl}/admin/capco/app/proposalfrom/${proposalForm.id}/delete`}>
                <FormattedMessage id="global.delete" />
              </Button>
            </ButtonToolbar>
          </div>
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

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: props.proposalForm,
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalFormAdminConfigurationForm_proposalForm on ProposalForm {
      id
      introduction
    }
  `,
);
