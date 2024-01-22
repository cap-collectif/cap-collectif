import React, { useEffect, useRef } from 'react'
import { MultiStepModal, CapUIModalSize } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import SectionSettingsModal from '@components/Steps/ConsultationStep/SectionSettingsModal'
import SectionAdditionalSettingsModal from '@components/Steps/ConsultationStep/SectionAdditionalSettingsModal'
import { useFormContext } from 'react-hook-form'
import { OpinionTypeInput } from '@relay/CreateOrUpdateConsultationMutation.graphql'

type Props = {
  sectionFormKey: `consultations.${number}.sections.${number}`
  disclosure: React.ReactNode
}

const ConsultationSectionModal: React.FC<Props> = ({ sectionFormKey, disclosure }) => {
  const intl = useIntl()

  const { resetField, watch } = useFormContext()

  const closeAndReset = () => {
    resetField(sectionFormKey)
  }

  const section = watch(sectionFormKey)
  const initalValueRef = useRef<OpinionTypeInput>(null)

  useEffect(() => {
    // we save initialValue, so we can reset it when modal is cancelled
    if (section) {
      initalValueRef.current = { ...section }
    }
  }, [])

  const onSuccess = (updatedSection: OpinionTypeInput) => {
    initalValueRef.current = updatedSection
  }

  return (
    <MultiStepModal
      resetStepOnClose
      ariaLabel={intl.formatMessage({ id: 'import-list' })}
      size={CapUIModalSize.Xl}
      hideOnClickOutside={false}
      disclosure={disclosure}
    >
      <SectionSettingsModal sectionFormKey={sectionFormKey} onClose={closeAndReset} initialValue={initalValueRef} />
      <SectionAdditionalSettingsModal sectionFormKey={sectionFormKey} onSuccess={onSuccess} />
    </MultiStepModal>
  )
}

export default ConsultationSectionModal
