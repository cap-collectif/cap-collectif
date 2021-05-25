// @flow
import { useIntl, type IntlShape } from 'react-intl';
import { useEffect, useState } from 'react';
import moment from 'moment';
import html2canvas from 'html2canvas';
import type { ChartsRef, ChartsUrl } from '~/components/Questionnaire/QuestionnaireAdminResults';
import type { QuestionnaireAdminResultsExportMenu_questionnaire } from '~relay/QuestionnaireAdminResultsExportMenu_questionnaire.graphql';
import type {
  QuestionsType,
  Translations,
} from '~/components/Questionnaire/QuestionnaireAdminResultsExportMenu';

const generateTranslations = (
  questionnaire: QuestionnaireAdminResultsExportMenu_questionnaire,
  intl: IntlShape,
): Translations => {
  const { anonymousAllowed, multipleRepliesAllowed, participants, step } = questionnaire;

  const isTimeless = step?.timeRange?.isTimeless;
  let resultsCollectedBetweenDatesMessage = '';
  if (!isTimeless) {
    const hasEnded = step?.timeRange?.hasEnded;
    const startAt = step?.timeRange?.startAt
      ? moment(step?.timeRange?.startAt).format('DD/MM/YY')
      : '';
    const endAt =
      hasEnded && step?.timeRange?.endAt
        ? moment(step?.timeRange?.endAt).format('DD/MM/YY')
        : moment().format('DD/MM/YY');
    resultsCollectedBetweenDatesMessage = intl.formatMessage(
      { id: 'results-collected-between-dates' },
      { start: startAt, end: endAt },
    );
  }

  let participationAllowedKey = '';
  if (anonymousAllowed && multipleRepliesAllowed) {
    participationAllowedKey = 'participation-anonymous-multiple-authorize';
  } else if (anonymousAllowed && !multipleRepliesAllowed) {
    participationAllowedKey = 'participation-anonymous-authorize';
  } else if (!anonymousAllowed && multipleRepliesAllowed) {
    participationAllowedKey = 'participation-multiple-authorize';
  }

  return {
    attendee: intl.formatMessage({ id: 'global.attendee' }, { num: participants.totalCount }),
    particpationAllowed:
      participationAllowedKey === '' ? '' : intl.formatMessage({ id: participationAllowedKey }),
    resultsCollectedBetweenDates: resultsCollectedBetweenDatesMessage,
    keyword: intl.formatMessage({ id: 'global.keyword' }),
    occurence: intl.formatMessage({ id: 'global.occurence' }),
    tableContent: intl.formatMessage({ id: 'table-content' }),
    optional: intl.formatMessage({ id: 'global.optional' }),
    noReply: intl.formatMessage({ id: 'global.no-reply' }),
  };
};

const generateChartUrls = async (chartsRef: ChartsRef) => {
  const getDomElement = (ref: any) => {
    if (ref instanceof Element) {
      return ref;
    }

    // when it's a responsive container (recharts)
    if (ref && ref.containerRef) {
      return ref.containerRef.current;
    }

    // when it is a recharts element
    return ref?.container;
  };

  const chartUrlsPromises = chartsRef.map(async ({ id, ref }) => {
    const element = getDomElement(ref);
    const canvas = await html2canvas(element, { logging: false });
    return {
      questionId: id,
      url: canvas.toDataURL(),
    };
  });

  return Promise.all(chartUrlsPromises);
};

const generateQuestions = (
  chartUrls: ChartsUrl,
  questionnaire: QuestionnaireAdminResultsExportMenu_questionnaire,
  intl: IntlShape,
): QuestionsType => {
  return questionnaire.questions.map(question => {
    const image = chartUrls?.find(img => img.questionId === question.id);
    if (image) {
      return {
        ...question,
        imageUrl: image.url,
        translations: {
          attendee: intl.formatMessage(
            { id: 'global.attendee' },
            { num: question.participants.totalCount },
          ),
          reply: intl.formatMessage(
            { id: 'shortcut.answer' },
            { num: question.allResponses.totalCount },
          ),
        },
      };
    }
    return question;
  });
};

export const useQuestionnaireProps = (
  questionnaire: QuestionnaireAdminResultsExportMenu_questionnaire,
  chartsRef: ChartsRef,
) => {
  const intl = useIntl();

  const [translations, setTranslations] = useState<?Translations>(null);
  const [questions, setQuestions] = useState<?QuestionsType>(null);

  useEffect(() => {
    // the timeout allows the modal to load before doing all the computing
    const timeoutId = setTimeout(() => {
      const generateData = async () => {
        const t = generateTranslations(questionnaire, intl);
        const chartsUrl = await generateChartUrls(chartsRef);
        const q = generateQuestions(chartsUrl, questionnaire, intl);
        setTranslations(t);
        setQuestions(q);
      };
      generateData();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [intl, questionnaire, chartsRef]);

  return { translations, questions };
};
