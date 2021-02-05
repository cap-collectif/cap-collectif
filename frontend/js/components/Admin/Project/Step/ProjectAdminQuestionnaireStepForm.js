// @flow

import React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import { Field } from 'redux-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import select from '~/components/Form/Select';
import renderComponent from '~/components/Form/Field';
import environment from '~/createRelayEnvironment';
import { renderSubSection } from './ProjectAdminStepForm.utils';
import {
  type ProjectAdminQuestionnaireStepFormQuestionnairesQueryResponse,
  type ProjectAdminQuestionnaireStepFormQuestionnairesQueryVariables,
} from '~relay/ProjectAdminQuestionnaireStepFormQuestionnairesQuery.graphql';

type Props = {|
  questionnaire?: {| label: string, value: string |},
|};

export const getAvailableQuestionnaires = graphql`
  query ProjectAdminQuestionnaireStepFormQuestionnairesQuery($term: String) {
    availableQuestionnaires(term: $term) {
      id
      title
    }
  }
`;

export const loadQuestionnaireOptions = (
  initialValue: ?{| label: string, value: string |},
  term: ?string,
): Promise<
  Array<{
    value: string,
    label: string,
  }>,
> => {
  return fetchQuery(
    environment,
    getAvailableQuestionnaires,
    ({
      term: term === '' ? null : term,
    }: ProjectAdminQuestionnaireStepFormQuestionnairesQueryVariables),
  ).then((data: ProjectAdminQuestionnaireStepFormQuestionnairesQueryResponse) => {
    const questionnaires = data.availableQuestionnaires.map(q => ({
      value: q.id,
      label: q.title,
    }));

    const isMatchingTerm = !term || (term && initialValue?.label?.includes(term));

    if (
      initialValue &&
      !questionnaires.some(q => q.value === initialValue.value) &&
      isMatchingTerm
    ) {
      questionnaires.push(initialValue);
    }
    return questionnaires;
  });
};

export const ProjectAdminQuestionnaireStepForm = ({ questionnaire }: Props) => {
  const intl = useIntl();
  return (
    <>
      <Field
        type="editor"
        name="footer"
        id="step-footer"
        label={renderLabel('global.footer', intl)}
        component={renderComponent}
      />
      {renderSubSection('global.questionnaire')}
      <Field
        selectFieldIsObject
        debounce
        autoload
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        component={select}
        name="questionnaire"
        id="step-questionnaire"
        placeholder=" "
        label={<FormattedMessage id="global.questionnaire" />}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        loadOptions={(term: ?string) => loadQuestionnaireOptions(questionnaire, term)}
        clearable
      />
    </>
  );
};

export default ProjectAdminQuestionnaireStepForm;
