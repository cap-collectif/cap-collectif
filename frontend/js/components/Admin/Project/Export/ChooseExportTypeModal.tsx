import type { FC } from 'react'
import React, { useEffect } from 'react'
import {
  Button,
  MultiStepModal,
  Text,
  Heading,
  useMultiStepModal,
  CapUIIcon,
  Flex,
  CapUIFontSize,
  CapUILineHeight,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ExportProps } from './ExportModal'
import ChooseExportTypeCheckboxOption from './ChooseExportTypeCheckboxOption'
import { graphql, useFragment } from 'react-relay'
import { ChooseExportTypeModal_project$key } from '~relay/ChooseExportTypeModal_project.graphql'


type ChooseExportTypeModalProps = {
  readonly project: ChooseExportTypeModal_project$key
  readonly exportParams: ExportProps
  readonly setExportParams: (exportParam: ExportProps) => void
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
  const project = useFragment(PROJECT_FRAGMENT, projectRef);
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
        <Flex direction="column" width="100%">
          <Text
            color="text.tertiary"
            fontSize={CapUIFontSize.Caption}
            lineHeight={CapUILineHeight.S}
            fontWeight={700}
            uppercase={true}
            mb={1}
          >
            {project.title}
          </Text>
          <Heading color="#3D454C !important" fontSize={CapUIFontSize.Headline} lineHeight={CapUILineHeight.M} fontWeight={600}>
            {intl.formatMessage({
              id: 'global.export',
            })}
          </Heading>
        </Flex>
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
