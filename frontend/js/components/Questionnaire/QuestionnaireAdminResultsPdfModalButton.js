// @flow
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Loader from '~ui/FeedbacksIndicators/Loader';
import { RETRY_LIMIT } from '~/components/Questionnaire/QuestionnaireAdminResultsPdfModal';

type Props = {|
  +loading: boolean,
  +onClose: () => void,
  +error: boolean,
  +setLoading: ((boolean => boolean) | boolean) => void,
  +retryCount: number,
  +setRetryCount: ((number => number) | number) => void,
|};

const QuestionnaireAdminResultsPdfModalButton = ({
  loading,
  onClose,
  error,
  setLoading,
  retryCount,
  setRetryCount,
}: Props) => {
  useEffect(() => {
    if (error && retryCount >= RETRY_LIMIT) {
      setLoading(false);
    }
  }, [error, retryCount, setLoading]);

  if (error && retryCount < RETRY_LIMIT) {
    return (
      <Button
        variant="primary"
        variantSize="medium"
        disabled={false}
        width="265px"
        onClick={() => {
          setRetryCount(c => c + 1);
        }}>
        <Flex align="center" justify="center" width="100%">
          <FormattedMessage id="retry" />
        </Flex>
      </Button>
    );
  }

  const renderButtonText = () => {
    if (error && retryCount >= RETRY_LIMIT) {
      return <FormattedMessage id="global.close" />;
    }
    if (loading) {
      return (
        <>
          <Flex alignItems="center" mr={4}>
            <Loader size={25} inline />
          </Flex>
          <FormattedMessage id="pdf.file.creation" />
        </>
      );
    }
    return <FormattedMessage id="global.close" />;
  };

  return (
    <Button
      variant="primary"
      variantSize="medium"
      disabled={loading}
      width="265px"
      onClick={onClose}>
      <Flex align="center" justify="center" width="100%">
        {renderButtonText()}
      </Flex>
    </Button>
  );
};

export default QuestionnaireAdminResultsPdfModalButton;
