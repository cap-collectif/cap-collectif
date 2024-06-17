import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from '~ds/Modal/Modal'
import Heading from '~ui/Primitives/Heading'
import Flex from '~ui/Primitives/Layout/Flex'
import { useQuestionnaireProps } from '~/components/Questionnaire/useQuestionnaireProps'
import QuestionnaireAdminResultsPdfModalButton from '~/components/Questionnaire/QuestionnaireAdminResultsPdfModalButton'
import type { QuestionnaireAdminResultsExportMenu_questionnaire } from '~relay/QuestionnaireAdminResultsExportMenu_questionnaire.graphql'
import QuestionnaireAdminResultsPdfInstance from '~/components/Questionnaire/QuestionnaireAdminResultsPdfInstance'
import QuestionnaireAdminResultsPdfModalBody from '~/components/Questionnaire/QuestionnaireAdminResultsPdfModalBody'
import type { ChartsRef } from '~/components/Questionnaire/QuestionnaireAdminResults'
type Props = {
  readonly show: boolean
  readonly onClose: () => void
  readonly questionnaire: QuestionnaireAdminResultsExportMenu_questionnaire
  readonly logoUrl: string
  readonly chartsRef: ChartsRef
}

const QuestionnaireAdminResultsPdfModal = ({ show, onClose, questionnaire, logoUrl, chartsRef }: Props) => {
  const { title, step } = questionnaire
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState(0)
  const { translations, questions } = useQuestionnaireProps(questionnaire, chartsRef)
  useEffect(() => {
    if (translations === null && questions === null) {
      setError(false)
      setLoading(true)
    }
  }, [translations, questions])
  return (
    <>
      <Modal
        ariaLabel="export pdf"
        show={show}
        hideOnEsc
        preventBodyScroll
        scrollBehavior="inside"
        width="313px"
        onClose={onClose}
      >
        <Modal.Header>
          <Heading>
            <FormattedMessage id="global.export" />
          </Heading>
        </Modal.Header>
        <Modal.Body>
          <QuestionnaireAdminResultsPdfModalBody loading={loading} error={error} retryCount={retryCount} />
        </Modal.Body>
        <Modal.Footer as="div">
          <Flex align="center" justify="center" width="100%">
            <QuestionnaireAdminResultsPdfModalButton
              loading={loading}
              onClose={onClose}
              error={error}
              setLoading={setLoading}
              retryCount={retryCount}
              setRetryCount={setRetryCount}
            />
          </Flex>
        </Modal.Footer>
      </Modal>
      {translations !== null && questions !== null && loading === true && (
        <QuestionnaireAdminResultsPdfInstance
          logoUrl={logoUrl}
          title={title}
          step={step}
          questions={questions}
          translations={translations}
          setLoading={setLoading}
          setError={setError}
        />
      )}
    </>
  )
}

export default QuestionnaireAdminResultsPdfModal
