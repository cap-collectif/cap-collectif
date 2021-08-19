// @flow
import * as React from 'react';
import { fetchQuery_DEPRECATED, graphql } from 'react-relay';
import { Field } from 'redux-form';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import select from '~/components/Form/Select';
import renderComponent from '~/components/Form/Field';
import environment from '~/createRelayEnvironment';
import { renderSubSection } from './ProjectAdminStepForm.utils';
import { type ProjectAdminQuestionnaireStepFormQuestionnairesQueryResponse } from '~relay/ProjectAdminQuestionnaireStepFormQuestionnairesQuery.graphql';
import type { GlobalState } from '~/types';

type Props = {|
  questionnaire?: {| label: string, value: string |},
|};

export const getAvailableQuestionnaires = graphql`
  query ProjectAdminQuestionnaireStepFormQuestionnairesQuery(
    $term: String
    $affiliations: [QuestionnaireAffiliation!]
  ) {
    viewer {
      questionnaires(query: $term, affiliations: $affiliations, availableOnly: true) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`;

export const loadQuestionnaireOptions = (
  initialValue: ?{| label: string, value: string |},
  term: ?string,
  isAdmin: boolean,
): Promise<
  Array<{
    value: string,
    label: string,
  }>,
> => {
  return fetchQuery_DEPRECATED(environment, getAvailableQuestionnaires, {
    term: term === '' ? null : term,
    affiliations: isAdmin ? null : ['OWNER'],
  }).then((data: ProjectAdminQuestionnaireStepFormQuestionnairesQueryResponse) => {
    const questionnaires =
      data.viewer.questionnaires.edges
        ?.filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(q => ({
          value: q.id,
          label: q.title,
        })) || [];

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
  const { user } = useSelector((state: GlobalState) => state.user);
  const intl = useIntl();
  const isAdmin = user?.isAdmin || false;

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
        label={intl.formatMessage({ id: 'global.questionnaire' })}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        loadOptions={(term: ?string) => loadQuestionnaireOptions(questionnaire, term, isAdmin)}
        clearable
      />
    </>
  );
};

export default ProjectAdminQuestionnaireStepForm;
