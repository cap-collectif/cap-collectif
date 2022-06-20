// @flow
// All of this is temporary, once we use react router on all /projects we can remove it
import { getBaseUrl } from '~/config';

export const getBaseUrlFromProposalUrl = (proposalUrl: string) => {
  let url = proposalUrl.replace(getBaseUrl(), '');
  url = url.substring(url.indexOf('/') + 1);
  url = url.substring(url.indexOf('/') + 1);
  url = url.substring(url.indexOf('/') + 1);
  url = url.substring(0, url.lastIndexOf('/'));
  return url;
};

export const getBaseUrlFromStepUrl = (stepUrl: string) => {
  let url = stepUrl.substring(stepUrl.indexOf('/') + 1);
  url = url.substring(url.indexOf('/') + 1);
  url = url.substring(url.indexOf('/') + 1);
  return url;
};

export const convertTypenameToStepSlug = (typename: string): string => {
  switch (typename) {
    case 'CollectStep':
      return 'collect';
    case 'ConsultationStep':
      return 'consultation';
    case 'PresentationStep':
      return 'presentation';
    case 'QuestionnaireStep':
      return 'questionnaire';
    case 'RankingStep':
      return 'ranking';
    case 'SelectionStep':
      return 'selection';
    case 'DebateStep':
      return 'debate';
    case 'OtherStep':
    default:
      return 'step';
  }
};
