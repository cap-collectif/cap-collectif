// @flow

import React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import { Field } from 'redux-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import select from '~/components/Form/Select';
import renderComponent from '~/components/Form/Field';
import environment from '~/createRelayEnvironment';
import { renderSubSection } from './ProjectAdminStepForm';

type Props = {|
  questionnaire?: {| label: string, value: string |},
|};

export const getAvailableQuestionnaires = graphql`
  query ProjectAdminQuestionnaireStepFormQuestionnairesQuery {
    availableQuestionnaires {
      id
      title
    }
  }
`;

export const loadQuestionnaireOptions = (questionnaire: ?{| label: string, value: string |}) => {
  return fetchQuery(environment, getAvailableQuestionnaires, {}).then(data => {
    const questionnaires = data.availableQuestionnaires.map(q => ({
      value: q.id,
      label: q.title,
    }));
    if (questionnaire && !questionnaires.some(q => q.value === questionnaire.value))
      questionnaires.push(questionnaire);
    return questionnaires;
  });
};

const ProjectAdminQuestionnaireStepForm = ({ questionnaire }: Props) => {
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
        loadOptions={() => loadQuestionnaireOptions(questionnaire)}
        clearable
      />
    </>
  );
};

export default ProjectAdminQuestionnaireStepForm;
