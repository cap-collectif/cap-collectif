import type { FC, Dispatch, SetStateAction } from 'react'
import React, { useEffect } from 'react'
import { Button, MultiStepModal, Text, Heading, useMultiStepModal, CapUIIcon, Flex, Modal } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ExportProps } from './ExportModal'
import ChooseExportTypeCheckboxOption from './ChooseExportTypeCheckboxOption'
import { ChooseExportTypeModal_project$key } from '@relay/ChooseExportTypeModal_project.graphql'
import { graphql, useFragment } from 'react-relay'

type ChooseExportTypeModalProps = {
  readonly project: ChooseExportTypeModal_project$key
  readonly exportParams: ExportProps
  readonly setExportParams: Dispatch<SetStateAction<ExportProps>>
  readonly enforcedChoice: boolean
  readonly votesEnabled: boolean
}

const PROJECT_FRAGMENT = graphql`
  fragment ChooseExportTypeModal_project on Project {
    title
  }
`

const ChooseExportTypeModal: FC<ChooseExportTypeModalProps> = ({
  project: projectRef,
  exportParams,
  setExportParams,
  enforcedChoice,
  votesEnabled,
}) => {
  const intl = useIntl()
  const project = useFragment(PROJECT_FRAGMENT, projectRef)
  const { goToNextStep, goToPreviousStep } = useMultiStepModal()
  const onlyParticipantsAllowed = enforcedChoice

  useEffect(() => {
    if (!onlyParticipantsAllowed) {
      return
    }

    setExportParams(previous => {
      const hasOnlyParticipants =
        previous.selectedData.length === 1 && previous.selectedData[0] === 'participants'
      if (hasOnlyParticipants) {
        return previous
      }
      return { ...previous, selectedData: ['participants'] }
    })
  }, [onlyParticipantsAllowed, setExportParams])

  const onPrevious = () => {
    goToPreviousStep()
    setExportParams({ ...exportParams, selectedData: [] })
  }

  return (
    <>
      <MultiStepModal.Header>
        <Heading color="text.tertiary">
          <Modal.Header.Label>{project.title}</Modal.Header.Label>
          {intl.formatMessage({
            id: 'global.export',
          })}
        </Heading>
      </MultiStepModal.Header>

      <MultiStepModal.Body>
        <Text marginBottom={4} color="#3D454C !important">
          {intl.formatMessage({
            id: 'export.select_type',
          })}
        </Text>

        <Flex direction="column" spacing={4}>
          <ChooseExportTypeCheckboxOption
            option={'contribution'}
            exportParams={exportParams}
            setExportParams={setExportParams}
            disabled={onlyParticipantsAllowed}
          />
          {votesEnabled && (
            <ChooseExportTypeCheckboxOption
              option={'votes'}
              exportParams={exportParams}
              setExportParams={setExportParams}
              disabled={onlyParticipantsAllowed}
            />
          )}
          <ChooseExportTypeCheckboxOption
            option={'participants'}
            exportParams={exportParams}
            setExportParams={setExportParams}
          />
          <ChooseExportTypeCheckboxOption
            option={'grouped-data'}
            exportParams={exportParams}
            setExportParams={setExportParams}
            disabled={onlyParticipantsAllowed}
          />
        </Flex>
      </MultiStepModal.Body>

      <MultiStepModal.Footer
        info={{
          url: 'https://aide.cap-collectif.com/article/394-les-exports',
          label: intl.formatMessage({
            id: 'information',
          }),
        }}
      >
        <Button onClick={onPrevious} variant="secondary" variantColor="hierarchy" variantSize="big">
          {intl.formatMessage({
            id: 'global.previous',
          })}
        </Button>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          rightIcon={CapUIIcon.LongArrowRight}
          onClick={goToNextStep}
          disabled={exportParams.selectedData.length < 1}
        >
          {intl.formatMessage({
            id: 'global.next',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default ChooseExportTypeModal
