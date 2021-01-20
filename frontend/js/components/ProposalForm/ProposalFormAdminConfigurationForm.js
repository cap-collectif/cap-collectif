// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { Panel, Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import { graphql, createRefetchContainer, type RelayRefetchProp } from 'react-relay';
import { reduxForm, formValueSelector, Field, FieldArray, SubmissionError } from 'redux-form';
import toggle from '../Form/Toggle';
import select from '../Form/Select';
import component from '../Form/Field';
import AlertForm from '../Alert/AlertForm';
import { submitQuestion } from '~/utils/submitQuestion';
import ProposalFormAdminCategories from './ProposalFormAdminCategories';
import ProposalFormAdminQuestions from './ProposalFormAdminQuestions';
import ProposalFormAdminDistricts from './ProposalFormAdminDistricts';
import type { GlobalState, FeatureToggles, Dispatch } from '~/types';
import UpdateProposalFormMutation from '~/mutations/UpdateProposalFormMutation';
import { getTranslationField, handleTranslationChange } from '~/services/Translation';
import type { ProposalFormAdminConfigurationForm_query } from '~relay/ProposalFormAdminConfigurationForm_query.graphql';
import type { ProposalFormAdminConfigurationForm_proposalForm } from '~relay/ProposalFormAdminConfigurationForm_proposalForm.graphql';
import { asyncValidate } from '~/components/Questionnaire/QuestionnaireAdminConfigurationForm';
import SectionDisplayMode from '~/components/ProposalForm/Section/SectionDisplayMode/SectionDisplayMode';

type RelayProps = {|
  +proposalForm: ProposalFormAdminConfigurationForm_proposalForm,
  +query: ProposalFormAdminConfigurationForm_query,
|};

type Props = {|
  ...RelayProps,
  ...ReduxFormFormProps,
  +defaultLanguage: string,
  +relay: RelayRefetchProp,
  +intl: IntlShape,
  +usingAddress: boolean,
  +usingCategories: boolean,
  +usingThemes: boolean,
  +usingDescription: boolean,
  +usingIllustration: boolean,
  +usingSummary: boolean,
  +usingDistrict: boolean,
  +usingTipsmeee: boolean,
  +isMapViewEnabled: boolean,
  +features: FeatureToggles,
|};

const TYPE_PROPOSAL_FORM = {
  PROPOSAL: 'PROPOSAL',
  QUESTION: 'QUESTION',
  ESTABLISHMENT: 'ESTABLISHMENT',
};

export const formName = 'proposal-form-admin-configuration';

export const validate = (values: Object) => {
  const errors = {};

  if (!values.description || values.description.length <= 2) {
    errors.description = 'admin.fields.proposal_form.errors.introduction';
  }

  if (values.usingCategories && values.categories.length === 0) {
    errors.categories = 'admin.fields.proposal_form.errors.categories';
  }

  if (values.viewEnabled && values.viewEnabled.isMapViewEnabled) {
    if (!values.zoomMap || values.zoomMap.length === 0) {
      errors.zoomMap = 'admin.fields.proposal_form.errors.zoom';
    }

    if (values.mapCenter && !values.mapCenter.lat) {
      errors.lat = 'admin.fields.proposal_form.errors.lat';
    }

    if (values.mapCenter && !values.mapCenter.lng) {
      errors.lng = 'admin.fields.proposal_form.errors.lng';
    }
  }

  if (Object.values(values.viewEnabled).filter(Boolean).length === 0) {
    errors.viewEnabled = 'select.display.mode';
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
          districtErrors.title = 'admin.fields.proposal_form.errors.question.title';
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
      if (question.isRangeBetween) {
        if (!question.rangeMin && !question.rangeMax) {
          questionErrors.rangeMin = 'error.define-value';
          questionErrors.rangeMax = 'error.define-value';
          questionsArrayErrors[questionIndex] = questionErrors;
        } else if (parseInt(question.rangeMin, 10) === 0 && parseInt(question.rangeMax, 10) === 0) {
          questionErrors.rangeMin = 'error.define-value';
          questionErrors.rangeMax = 'error.define-value';
          questionsArrayErrors[questionIndex] = questionErrors;
        } else if (parseInt(question.rangeMin, 10) > parseInt(question.rangeMax, 10)) {
          questionErrors.rangeMin = 'error.min-higher-maximum';
          questionsArrayErrors[questionIndex] = questionErrors;
        }
      }
    });

    if (questionsArrayErrors.length) {
      errors.questions = questionsArrayErrors;
    }
  }

  return errors;
};

const headerPanelUsingTipsmeee = (
  <div id="proposal_form_admin_tipsmee_panel">
    <h4 className="pull-left">
      <FormattedMessage id="tipsmeee-link" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_tipsmeee_field"
        name="usingTipsmeee"
        component={toggle}
        normalize={val => !!val}
      />
    </div>
    <div className="clearfix" />
  </div>
);

const headerPanelUsingCategories = (
  <div id="proposal_form_admin_category_panel">
    <h4 className="pull-left">
      <FormattedMessage id="global.category" />
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
      <FormattedMessage id="global.theme" />
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

const headerPanelUsingAddress = isMapViewEnabled => (
  <div id="address">
    <h4 className="pull-left">
      <FormattedMessage id="proposal_form.address" />
    </h4>
    <div className="pull-right">
      <Field
        id="proposal_form_using_address_field"
        name="usingAddress"
        component={toggle}
        disabled={isMapViewEnabled}
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
      <FormattedMessage id="global.summary" />
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
      <FormattedMessage id="global.illustration" />
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

const getCategoryImage = (
  category: {
    name: string,
    newCategoryImage: ?{ id: string },
    customCategoryImage?: { id: string, image: any },
    categoryImage?: { id: string, image: any },
  },
  isUploaded: boolean,
): ?string => {
  if (category.newCategoryImage && isUploaded) {
    return category.newCategoryImage.id;
  }

  if (!isUploaded) {
    if (category.categoryImage && category.customCategoryImage) {
      return category.customCategoryImage.id;
    }
    if (!category.categoryImage && category.customCategoryImage) {
      return category.customCategoryImage.id;
    }
    if (category.categoryImage && !category.customCategoryImage) {
      return category.categoryImage.id;
    }
  }

  return null;
};

const getDistrictsTranslated = (districts, defaultLanguage: string) =>
  districts.map(district => {
    const translation = {
      name: district.name,
      locale: defaultLanguage,
    };

    return {
      ...district,
      name: undefined,
      translations: handleTranslationChange(
        district.translations || [],
        translation,
        defaultLanguage,
      ),
    };
  });

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { intl, defaultLanguage, features } = props;

  values.questions.map(question => {
    if (question.importedResponses || question.importedResponses === null) {
      delete question.importedResponses;
    }
  });
  const input = {
    ...values,
    id: undefined,
    __id: undefined,
    __fragmentOwner: undefined,
    __fragments: undefined,
    viewEnabled: undefined,
    address: undefined,
    usingTipsmeee: features.unstable__tipsmeee ? values.usingTipsmeee : undefined,
    tipsmeeeHelpText: features.unstable__tipsmeee ? values.tipsmeeeHelpText : undefined,
    proposalFormId: props.proposalForm.id,
    districts: getDistrictsTranslated(values.districts, defaultLanguage),
    categories: values.categories.map(category => ({
      id: category.id || null,
      name: category.name,
      color: category.color.replace('#', 'COLOR_').toUpperCase(),
      icon: category.icon ? category.icon.toUpperCase().replace(/-/g, '_') : null,
      categoryImage: getCategoryImage(category, false),
      newCategoryImage: getCategoryImage(category, true),
    })),
    questions: submitQuestion(values.questions),
    isGridViewEnabled: values.viewEnabled.isGridViewEnabled,
    isListViewEnabled: values.viewEnabled.isListViewEnabled,
    isMapViewEnabled: values.viewEnabled.isMapViewEnabled,
    objectType: values.objectType,
    mapCenter:
      values.mapCenter && values.viewEnabled.isMapViewEnabled
        ? JSON.stringify([values.mapCenter.json])
        : null,
  };

  const nbChoices = input.questions.reduce((acc, array) => {
    if (array && array.question && array.question.choices && array.question.choices.length) {
      acc += array.question.choices.length;
    }
    return acc;
  }, 0);

  return UpdateProposalFormMutation.commit({ input })
    .then(response => {
      if (nbChoices > 1500) {
        window.location.reload();
      }

      if (!response.updateProposalForm || !response.updateProposalForm.proposalForm) {
        throw new Error('Mutation "updateProposalForm" failed.');
      }
      if (response.updateProposalForm) {
        const refetchVariables = () => ({});
        props.relay.refetch(refetchVariables, null, () => {}, { force: true });
      }
    })
    .catch(response => {
      if (response.response && response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};

export const ProposalFormAdminConfigurationForm = ({
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
  usingTipsmeee,
  features,
  query,
  isMapViewEnabled,
  proposalForm,
  dispatch,
}: Props) => {
  const optional = (
    <span className="excerpt">
      <FormattedMessage id="global.optional" />
    </span>
  );

  return (
    <form onSubmit={handleSubmit} id="proposalFormVote">
      <div className="box box-primary container-fluid mt-10">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="global.formulaire" />
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.form.configuration' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>

        <div className="box-content">
          <Field
            name="objectType"
            component={select}
            id="proposal_form_objectType"
            label={<FormattedMessage id="object-deposited" />}
            options={[
              {
                value: TYPE_PROPOSAL_FORM.PROPOSAL,
                label: intl.formatMessage({ id: 'global.proposal' }),
              },
              {
                value: TYPE_PROPOSAL_FORM.QUESTION,
                label: intl.formatMessage({ id: 'admin.fields.response.question' }),
              },
              {
                value: TYPE_PROPOSAL_FORM.ESTABLISHMENT,
                label: intl.formatMessage({ id: 'global.establishment' }),
              },
            ]}
          />
          <Field
            name="description"
            component={component}
            type="admin-editor"
            id="proposal_form_description"
            label={<FormattedMessage id="global.intro" />}
          />
        </div>
      </div>
      <div className="box box-primary container-fluid mt-10">
        <div className="box-header">
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="proposal_form.admin.configuration.permanent_field" />
            </h3>
          </div>
          <div className="panel panel-default">
            <h4 className="panel-heading m-0">
              <FormattedMessage id="global.title" />
            </h4>
            <div className="panel-body">
              <Field
                name="titleHelpText"
                component={component}
                type="text"
                id="proposal_form_title_help_text"
                label={
                  <span>
                    <FormattedMessage id="global.help.text" />
                    {optional}
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <SectionDisplayMode proposalForm={proposalForm} dispatch={dispatch} formName={formName} />

      <div className="box box-primary container-fluid mt-10">
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
                <FormattedMessage id="global.mandatory" />
              </Field>
              <Field
                name="descriptionHelpText"
                component={component}
                type="text"
                id="proposal_form_description_help_text"
                label={
                  <span>
                    <FormattedMessage id="global.help.text" />
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
                    <FormattedMessage id="global.help.text" />
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
                    <FormattedMessage id="global.help.text" />
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
                  <FormattedMessage id="global.mandatory" />
                </Field>
                <Field
                  name="themeHelpText"
                  component={component}
                  type="text"
                  id="proposal_form_theme_help_text"
                  label={
                    <span>
                      <FormattedMessage id="global.help.text" />
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
                <FormattedMessage id="make.input.mandatory" />
              </Field>
              <Field
                name="categoryHelpText"
                component={component}
                type="text"
                id="proposal_form_category_help_text"
                label={
                  <span>
                    <FormattedMessage id="global.help.text" />
                    {optional}
                  </span>
                }
              />
              <FieldArray
                name="categories"
                component={ProposalFormAdminCategories}
                props={{ query, proposalForm }}
              />
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
        <Panel id="address-body" expanded={usingAddress} onToggle={() => {}}>
          <Panel.Heading>{headerPanelUsingAddress(isMapViewEnabled)}</Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              <Field
                name="addressHelpText"
                component={component}
                type="text"
                id="proposal_form_address_help_text"
                label={
                  <span>
                    <FormattedMessage id="global.help.text" />
                    {optional}
                  </span>
                }
              />
              <p className="link">
                <Glyphicon glyph="info-sign" />{' '}
                <FormattedMessage id="the-proposals-will-be-posted-on-a-map" />
              </p>
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
                  component={toggle}
                  id="proposal_form_district_mandatory"
                  label={<FormattedMessage id="make.input.mandatory" />}
                />

                <Field
                  name="proposalInAZoneRequired"
                  component={toggle}
                  id="proposal_form_district_proposalInAZoneRequired"
                  label={<FormattedMessage id="proposal_form.proposalInAZoneRequired" />}
                />
                <Field
                  name="districtHelpText"
                  component={component}
                  type="text"
                  id="proposal_form_district_help_text"
                  label={
                    <span>
                      <FormattedMessage id="global.help.text" />
                      {optional}
                    </span>
                  }
                />
                <FieldArray name="districts" component={ProposalFormAdminDistricts} />
              </Panel.Body>
            </Panel.Collapse>
          </Panel>
        )}

        {features.unstable__tipsmeee && (
          <Panel expanded={usingTipsmeee} onToggle={() => {}}>
            <Panel.Heading>{headerPanelUsingTipsmeee}</Panel.Heading>
            <Panel.Collapse>
              <Panel.Body>
                <Field
                  name="tipsmeeeHelpText"
                  component={component}
                  type="text"
                  id="proposal_form_tipsmeee_help_text"
                  label={
                    <span>
                      <FormattedMessage id="global.help.text" />
                      {optional}
                    </span>
                  }
                />
              </Panel.Body>
            </Panel.Collapse>
          </Panel>
        )}

        {query.viewer.isSuperAdmin && (
          <Field
            id="proposal_form_canContact_field"
            name="canContact"
            component={toggle}
            normalize={val => !!val}
            label={<FormattedMessage id="allow-author-contact" />}
          />
        )}
      </div>
      <div className="box box-primary container-fluid mt-10">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal_form.admin.configuration.custom_field" />
          </h3>
        </div>
        <FieldArray name="questions" component={ProposalFormAdminQuestions} formName={formName} />
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
      </div>
    </form>
  );
};

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
  asyncValidate,
})(ProposalFormAdminConfigurationForm);

export const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState, props: RelayProps) => {
  const questions = props.proposalForm.questions.map(question => {
    if (question.__typename !== 'MultipleChoiceQuestion') return question;
    const choices =
      question.choices && question.choices.edges
        ? question.choices.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
        : [];
    return { ...question, choices };
  });

  return {
    initialValues: {
      ...props.proposalForm,
      step: undefined,
      categories: props.proposalForm.categories.filter(Boolean).map(category => {
        const categoryImage =
          category.categoryImage && category.categoryImage.isDefault
            ? category.categoryImage
            : null;
        const customCategoryImage =
          category.categoryImage && !category.categoryImage.isDefault
            ? category.categoryImage
            : null;
        return {
          ...category,
          categoryImage,
          customCategoryImage,
        };
      }),
      questions,
      districts: props.proposalForm.districts
        .filter(Boolean)
        .map(({ translations, id, displayedOnMap, geojson, border, background }) => ({
          id,
          name: getTranslationField(translations, state.language.currentLanguage, 'name'),
          border,
          geojson,
          background,
          displayedOnMap,
        })),
      objectType: props.proposalForm.objectType,
      viewEnabled: {
        isMapViewEnabled: props.proposalForm.isMapViewEnabled,
        isGridViewEnabled: props.proposalForm.isGridViewEnabled,
        isListViewEnabled: props.proposalForm.isListViewEnabled,
      },
    },
    usingAddress: selector(state, 'usingAddress'),
    usingCategories: selector(state, 'usingCategories'),
    usingThemes: selector(state, 'usingThemes'),
    usingDistrict: selector(state, 'usingDistrict'),
    usingTipsmeee: selector(state, 'usingTipsmeee'),
    usingDescription: selector(state, 'usingDescription'),
    usingSummary: selector(state, 'usingSummary'),
    usingIllustration: selector(state, 'usingIllustration'),
    objectType: selector(state, 'objectType'),
    features: state.default.features,
    defaultLanguage: state.language.currentLanguage,
    isMapViewEnabled: selector(state, 'viewEnabled')?.isMapViewEnabled,
  };
};

const container = connect(mapStateToProps)(form);
const intlContainer = injectIntl(container);

export default createRefetchContainer(
  intlContainer,
  {
    proposalForm: graphql`
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
        canContact
        mapCenter {
          lat
          lng
          json
        }
        zoomMap
        isGridViewEnabled
        isMapViewEnabled
        isListViewEnabled
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
        usingTipsmeee
        tipsmeeeHelpText
        allowAknowledge
        objectType
        districts {
          id
          translations {
            name
            locale
          }
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
          color
          icon
          categoryImage {
            id
            isDefault
            image {
              url
              id
              name
            }
          }
        }
        questions {
          id
          ...responsesHelper_adminQuestion @relay(mask: false)
        }
        ...SectionDisplayMode_proposalForm
      }
    `,
    query: graphql`
      fragment ProposalFormAdminConfigurationForm_query on Query {
        ...ProposalFormAdminCategories_query
        viewer {
          isSuperAdmin
        }
      }
    `,
  },
  graphql`
    query ProposalFormAdminConfigurationFormRefetchQuery {
      ...ProposalFormAdminConfigurationForm_query
      viewer {
        isSuperAdmin
      }
    }
  `,
);
