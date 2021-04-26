// @flow
import React, { useEffect } from 'react';
import { usePDF } from '@react-pdf/renderer';
import FileSaver from 'file-saver';
import moment from 'moment';
import { useIntl } from 'react-intl';
import QuestionnaireAdminResultsPdfDocument from '~/components/Questionnaire/QuestionnaireAdminResultsPdfDocument/QuestionnaireAdminResultsPdfDocument';
import type {
  QuestionsType,
  Translations,
} from '~/components/Questionnaire/QuestionnaireAdminResultsExportMenu';

type Props = {|
  +logoUrl: string,
  +title: string,
  +step: ?{|
    +timeRange: {|
      +startAt: ?string,
      +endAt: ?string,
      +hasEnded: boolean,
      +isTimeless: boolean,
    |},
    +url: string,
  |},
  +questions: ?QuestionsType,
  +translations: ?Translations,
  +setLoading: boolean => void,
  +setError: boolean => void,
|};

const QuestionnaireAdminResultsPdfInstance = ({
  logoUrl,
  title,
  step,
  questions,
  translations,
  setLoading,
  setError,
}: Props) => {
  const intl = useIntl();

  const resultsText = intl.formatMessage({ id: 'results' });
  const today = moment().format('DD_MM_YY');
  const filenameTitle = title
    .toLowerCase()
    .split(' ')
    .join('-');
  const filename = `${resultsText}_${filenameTitle}_${today}.pdf`;

  const [instance] = usePDF({
    document: (
      <QuestionnaireAdminResultsPdfDocument
        logoUrl={logoUrl}
        title={title}
        step={step}
        questions={questions}
        translations={translations}
      />
    ),
  });

  useEffect(() => {
    if (instance.blob !== null) {
      FileSaver.saveAs(instance.blob, filename);
      setLoading(false);
      setError(false);
    }
  }, [instance.blob, setLoading, setError, filename]);

  useEffect(() => {
    if (instance.error) {
      setError(true);
      setLoading(false);
    }
  }, [instance.error, setError, setLoading]);

  return null;
};

export default QuestionnaireAdminResultsPdfInstance;
