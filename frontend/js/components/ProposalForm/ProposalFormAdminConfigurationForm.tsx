import * as React from 'react';
import { connect } from 'react-redux';
import type { IntlShape } from 'react-intl';
import { FormattedMessage, injectIntl } from 'react-intl';

import styled from 'styled-components';
import { Panel, Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import type { RelayRefetchProp } from 'react-relay';
import { graphql, createRefetchContainer } from 'react-relay';
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
import type {
  ProposalFormAdminConfigurationForm_query$data,
} from '~relay/ProposalFormAdminConfigurationForm_query.graphql';
import type {
  ProposalFormAdminConfigurationForm_proposalForm$data,
} from '~relay/ProposalFormAdminConfigurationForm_proposalForm.graphql';
import { asyncValidate } from '~/components/Questionnaire/QuestionnaireAdminConfigurationForm';
import SectionDisplayMode from '~/components/ProposalForm/Section/SectionDisplayMode/SectionDisplayMode';
import type {
  ProposalFormAdminConfigurationFormRefetchQuery$variables,
} from '~relay/ProposalFormAdminConfigurationFormRefetchQuery.graphql';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import { styleGuideColors } from '~/utils/colors';
import Heading from '~ui/Primitives/Heading';

type RelayProps = {
  readonly proposalForm: ProposalFormAdminConfigurationForm_proposalForm$data
  readonly query: ProposalFormAdminConfigurationForm_query$data
}
type Props = RelayProps &
  ReduxFormFormProps & {
  readonly defaultLanguage: string
  readonly relay: RelayRefetchProp
  readonly intl: IntlShape
  readonly usingAddress: boolean
  readonly usingCategories: boolean
  readonly usingThemes: boolean
  readonly usingDescription: boolean
  readonly usingIllustration: boolean
  readonly usingSummary: boolean
  readonly usingDistrict: boolean
  readonly isMapViewEnabled: boolean
  readonly features: FeatureToggles
  readonly descriptionUsingJoditWysiwyg?: boolean | null | undefined
}
const TYPE_PROPOSAL_FORM = {
  PROPOSAL: 'PROPOSAL',
  QUESTION: 'QUESTION',
  OPINION: 'OPINION',
};
export const formName = 'proposal-form-admin-configuration';
// TODO type `FormValues`
export const validate = (values: Record<string, any>) => {
  const errors: any = {};

  if (Object.keys(values).length === 0) {
    return {};
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

  if (values.viewEnabled && Object.values(values.viewEnabled).filter(Boolean).length === 0) {
    errors.viewEnabled = 'select.display.mode';
  }

  if (values.usingDistrict) {
    if (values.districts.length === 0) {
      errors.districts = 'admin.fields.proposal_form.errors.districts';
    }

    if (values.districts && values.districts.length) {
      const districtsArrayErrors = [];
      values.districts.forEach((district: Record<string, any>, districtIndex: number) => {
        const districtErrors: any = {};

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

  if (values.questions && values.questions.length) {
    const questionsArrayErrors = [];
    values.questions.forEach((question: Record<string, any>, questionIndex: number) => {
      const questionErrors: any = {};

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
      <Field id="proposal_form_using_themes_field" name="usingThemes" component={toggle} normalize={val => !!val} />
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
      <Field id="proposal_form_using_district_field" name="usingDistrict" component={toggle} normalize={val => !!val} />
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
      <Field id="proposal_form_using_summary_field" name="usingSummary" component={toggle} normalize={val => !!val} />
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
const ExternaLinksFlex = styled(Flex)`
  .form-group {
    max-width: 400px;
    margin-top: 4px;
    margin-bottom: 0;
  }
`;

const getCategoryImage = (
  category: {
    name: string
    newCategoryImage:
      | {
      id: string
    }
      | null
      | undefined
    customCategoryImage?: {
      id: string
      image: any
    }
    categoryImage?: {
      id: string
      image: any
    }
  },
  isUploaded: boolean,
): string | null | undefined => {
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
      translations: handleTranslationChange(district.translations || [], translation, defaultLanguage),
    };
  });

const isJsonString = str => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
};

const onSubmit = (values: Record<string, any>, dispatch: Dispatch, props: Props) => {
  const { intl, defaultLanguage } = props;
  values.questions.map((question, index) => {
    if (question.importedResponses || question.importedResponses === null) {
      delete question.importedResponses;
    }

    values.questions[index].title = values.questions[index].title.trim();

    if (question.choices) {
      question.choices.map((choice, key) => {
        question.choices[key].title = question.choices[key].title.trim();
      });
    }
  });
  const { id, __id, __fragmentOwner, __fragments, viewEnabled, address, __isWithinUnmatchedTypeRefinement, ...rest } =
    values;
  let mapCenter = null;

  if (values.mapCenter && values.viewEnabled.isMapViewEnabled) {
    if (!isJsonString(values.mapCenter.json)) {
      mapCenter = JSON.stringify([values.mapCenter.json]);
    } else if (isJsonString(values.mapCenter.json)) {
      mapCenter = values.mapCenter.json;
    }
  }

  const input = {
    ...rest,
    proposalFormId: props.proposalForm.id,
    isLogged: true,
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
    mapCenter,
  };
  const nbChoices = input.questions.reduce((acc, array) => {
    if (array && array.question && array.question.choices && array.question.choices.length) {
      acc += array.question.choices.length;
    }

    return acc;
  }, 0);
  return UpdateProposalFormMutation.commit({
    // @ts-ignore
    input,
  })
    .then(response => {
      if (nbChoices > 1500) {
        window.location.reload();
      }

      if (!response.updateProposalForm || !response.updateProposalForm.proposalForm) {
        throw new Error('Mutation "updateProposalForm" failed.');
      }

      if (response.updateProposalForm) {
        props.relay.refetch({} as ProposalFormAdminConfigurationFormRefetchQuery$variables, null, () => {
        }, {
          force: true,
        });
      }
    })
    .catch(response => {
      if (response.response && response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({
            id: 'global.error.server.form',
          }),
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
            href={intl.formatMessage({
              id: 'admin.help.link.form.configuration',
            })}
          >
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
                label: intl.formatMessage({
                  id: 'global.proposal',
                }),
              },
              {
                value: TYPE_PROPOSAL_FORM.QUESTION,
                label: intl.formatMessage({
                  id: 'admin.fields.response.question',
                }),
              },
              {
                value: TYPE_PROPOSAL_FORM.OPINION,
                label: intl.formatMessage({
                  id: 'global.review',
                }),
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
      {/** @ts-ignore */}
      <SectionDisplayMode proposalForm={proposalForm} dispatch={dispatch} formName={formName} />

      <div className="box box-primary container-fluid mt-10">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal_form.admin.configuration.optional_field" />
          </h3>
        </div>
        <Panel id="proposal_form_admin_description_panel_body" expanded={usingDescription} onToggle={() => {
        }}>
          <Panel.Heading>{headerPanelUsingDescription}</Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              <Field
                name="descriptionMandatory"
                component={component}
                type="checkbox"
                id="proposal_form_description_mandatory"
              >
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
        <Panel id="proposal_form_admin_summary_panel_body" expanded={usingSummary} onToggle={() => {
        }}>
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
        <Panel id="proposal_form_admin_illustration_panel_body" expanded={usingIllustration} onToggle={() => {
        }}>
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
          <Panel expanded={usingThemes} onToggle={() => {
          }}>
            <Panel.Heading>{headerPanelUsingThemes}</Panel.Heading>
            <Panel.Collapse>
              <Panel.Body>
                <Field name="themeMandatory" component={component} type="checkbox" id="proposal_form_theme_mandatory">
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
        <Panel id="proposal_form_admin_category_panel_body" expanded={usingCategories} onToggle={() => {
        }}>
          <Panel.Heading>{headerPanelUsingCategories}</Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              <Field
                name="categoryMandatory"
                component={component}
                type="checkbox"
                id="proposal_form_category_mandatory"
              >
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
                props={{
                  query,
                  proposalForm,
                }}
              />
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
        <Panel id="address-body" expanded={usingAddress} onToggle={() => {
        }}>
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
                <Glyphicon glyph="info-sign" /> <FormattedMessage id="the-proposals-will-be-posted-on-a-map" />
              </p>
            </Panel.Body>
          </Panel.Collapse>
        </Panel>

        {features.districts && (
          <Panel expanded={usingDistrict} onToggle={() => {
          }}>
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
      </div>

      <Flex backgroundColor={styleGuideColors.white} mt={4} direction="column" paddingY={8} paddingX={7}>
        <AppBox>
          <Heading as="h3" fontWeight="600" fontSize="18px" lineHeight="24px" color={styleGuideColors.blue800}>
            <FormattedMessage id="external-links" />
          </Heading>
          <Text mt={2} color={styleGuideColors.gray500} fontSize="13px" lineHeight="16px" mb={8}>
            <FormattedMessage id="authorize-external-links" />
          </Text>
        </AppBox>
        <ExternaLinksFlex direction="column" alignContent="baseline" justifyItems="baseline">
          <Field
            name="usingWebPage"
            component={component}
            type="checkbox"
            id="proposal_form_web_page"
            className="mb-0 mt-0"
          >
            <Text>
              <FormattedMessage id="form.label_website" />
            </Text>
          </Field>
          <Field name="usingTwitter" component={component} type="checkbox" id="proposal_form_twitter">
            <Text>
              <FormattedMessage id="share.twitter" />
            </Text>
          </Field>
          <Field name="usingFacebook" component={component} type="checkbox" id="proposal_form_facebook">
            <Text>
              <FormattedMessage id="share.facebook" />
            </Text>
          </Field>
          <Field name="usingInstagram" component={component} type="checkbox" id="proposal_form_instagram">
            <Text>
              <FormattedMessage id="instagram" />
            </Text>
          </Field>
          <Field name="usingLinkedIn" component={component} type="checkbox" id="proposal_form_linkedin">
            <Text>
              <FormattedMessage id="share.linkedin" />
            </Text>
          </Field>
          <Field name="usingYoutube" component={component} type="checkbox" id="proposal_form_youtubr">
            <Text>
              <FormattedMessage id="youtube" />
            </Text>
          </Field>
        </ExternaLinksFlex>
      </Flex>

      <AppBox mt={6}>
        <div className="box box-primary container-fluid">
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="proposal_form.admin.configuration.custom_field" />
            </h3>
          </div>
          <FieldArray name="questions" component={ProposalFormAdminQuestions} formName={formName} />
          <Field name="allowAknowledge" component={component} type="checkbox" id="proposal_form_allow_aknowledge">
            <FormattedMessage id="automatically-send-an-acknowledgement-of-receipt-by-email-to-the-contributor" />
          </Field>
          <ButtonToolbar className="box-content__toolbar">
            <Button
              disabled={invalid || pristine || submitting}
              type="submit"
              bsStyle="primary"
              id="proposal-form-admin-content-save"
            >
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
      </AppBox>
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
    if (question.__typename !== 'MultipleChoiceQuestion')
      return { ...question, descriptionUsingJoditWysiwyg: question.descriptionUsingJoditWysiwyg !== false };
    const choices =
      question.choices && question.choices.edges
        ? question.choices.edges
          .filter(Boolean)
          .map(edge => ({
            ...edge.node,
            descriptionUsingJoditWysiwyg: edge.node?.descriptionUsingJoditWysiwyg !== false,
          }))
          .filter(Boolean)
        : [];
    return { ...question, choices, descriptionUsingJoditWysiwyg: question.descriptionUsingJoditWysiwyg !== false };
  });
  return {
    initialValues: {
      ...props.proposalForm,
      descriptionUsingJoditWysiwyg: props.proposalForm.descriptionUsingJoditWysiwyg !== false,
      step: undefined,
      categories: props.proposalForm.categories.filter(Boolean).map(category => {
        const categoryImage = category.categoryImage && category.categoryImage.isDefault ? category.categoryImage : null;
        const customCategoryImage =
          category.categoryImage && !category.categoryImage.isDefault ? category.categoryImage : null;
        return { ...category, categoryImage, customCategoryImage };
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
      usingFacebook: props.proposalForm ? props.proposalForm.usingFacebook : null,
      usingWebPage: props.proposalForm ? props.proposalForm.usingWebPage : null,
      usingTwitter: props.proposalForm ? props.proposalForm.usingTwitter : null,
      usingInstagram: props.proposalForm ? props.proposalForm.usingInstagram : null,
      usingYoutube: props.proposalForm ? props.proposalForm.usingYoutube : null,
      usingLinkedIn: props.proposalForm ? props.proposalForm.usingLinkedIn : null,
    },
    usingAddress: selector(state, 'usingAddress'),
    usingCategories: selector(state, 'usingCategories'),
    usingThemes: selector(state, 'usingThemes'),
    usingDistrict: selector(state, 'usingDistrict'),
    usingDescription: selector(state, 'usingDescription'),
    usingSummary: selector(state, 'usingSummary'),
    usingIllustration: selector(state, 'usingIllustration'),
    objectType: selector(state, 'objectType'),
    usingFacebook: selector(state, 'usingFacebook'),
    usingWebPage: selector(state, 'usingWebPage'),
    usingTwitter: selector(state, 'usingTwitter'),
    usingInstagram: selector(state, 'usingInstagram'),
    usingYoutube: selector(state, 'usingYoutube'),
    usingLinkedIn: selector(state, 'usingLinkedIn'),
    features: state.default.features,
    defaultLanguage: state.language.currentLanguage,
    isMapViewEnabled: selector(state, 'viewEnabled')?.isMapViewEnabled,
  };
};

// @ts-ignore
const container = connect(mapStateToProps)(form);
const intlContainer = injectIntl(container);
export default createRefetchContainer(
  intlContainer,
  {
    proposalForm: graphql`
      fragment ProposalFormAdminConfigurationForm_proposalForm on ProposalForm {
        id
        description
        descriptionUsingJoditWysiwyg
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
        allowAknowledge
        objectType
        usingFacebook
        usingWebPage
        usingTwitter
        usingInstagram
        usingYoutube
        usingLinkedIn
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
