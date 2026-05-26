import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Flex,
  Heading,
  MultiStepModal,
  Text,
  useMultiStepModal,
  CapUIFontSize,
  CapUILineHeight,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ExportProps } from './ExportModal'
import ChooseDataFormatRadioOption from './ChooseDataFormatRadioOption'
import { graphql, useFragment } from 'react-relay'
import { ChooseDataFormatModal_project$key } from '~relay/ChooseDataFormatModal_project.graphql'
import downloadCSV from '../../../../../../admin-next/utils/download-csv';

type ExportUrl = {
  readonly variant: string
  readonly url: string
}

type ExportStep = {
  readonly __typename: string
  readonly id: string
  readonly exportContributorsUrls?: ReadonlyArray<ExportUrl> | null
  readonly exportContributionsUrls?: ReadonlyArray<ExportUrl> | null
  readonly exportGroupedUrls?: ReadonlyArray<ExportUrl> | null
  readonly exportVotesUrls?: ReadonlyArray<ExportUrl> | null
}

type ExportProject = {
  readonly exportContributorsUrl?: string | null
  readonly exportSteps: ReadonlyArray<ExportStep>
}

type ChooseDataFormatModalProps = {
  readonly project: ChooseDataFormatModal_project$key
  readonly exportParams: ExportProps
  readonly setExportParams: (exportParams: ExportProps) => void
}

type FormatConstraints = {
  readonly forcedFormat: ExportProps['format'] | null
  readonly isSimplifiedDisabled: boolean
  readonly isFullDisabled: boolean
}

const PROJECT_FRAGMENT = graphql`
    fragment ChooseDataFormatModal_project on Project {
        title
        slug
        exportContributorsUrl
        exportSteps: steps(excludePresentationStep: true) {
            __typename
            id
            slug
            exportContributorsUrls {
              variant
              url
            }
            exportContributionsUrls {
                variant
                url
            }
            exportGroupedUrls {
                variant
                url
            }
            ...on ProposalStep {
                exportVotesUrls {
                    variant
                    url
                }
            }
            ...on DebateStep {
                exportVotesUrls {
                    variant
                    url
                }
            }
        }
    }
`

const getStepExportUrls = (
  step: ExportStep | undefined,
  selectedData: ExportProps['selectedData'],
  format: ExportProps['format'],
): string[] => {
  if (!step) {
    return []
  }

  const exportTypeApiMapping = {
    contribution: 'exportContributionsUrls',
    participants: 'exportContributorsUrls',
    'grouped-data': 'exportGroupedUrls',
    votes: 'exportVotesUrls',
  } as const

  return selectedData
    .map(exportType => {
      const apiExportTypeField = exportTypeApiMapping[exportType]
      return step[apiExportTypeField]?.find(({ variant }) => variant === format)?.url
    })
    .filter((url): url is string => Boolean(url))
}

export const resolveExportUrls = (project: ExportProject, exportParams: ExportProps): string[] => {
  const { step: stepId, selectedData, format } = exportParams

  if (stepId === 'all' && selectedData.length === 1 && selectedData[0] === 'participants') {
    return project.exportContributorsUrl ? [project.exportContributorsUrl] : []
  }

  if (stepId === 'all') {
    return project.exportSteps
      .filter(step => step.__typename !== 'PresentationStep' && step.__typename !== 'OtherStep')
      .flatMap(step => getStepExportUrls(step, selectedData, format))
  }

  const step = project.exportSteps.find(currentStep => currentStep.id === stepId)

  return getStepExportUrls(step, selectedData, format)
}

export const getFormatConstraints = (exportParams: ExportProps): FormatConstraints => {
  const isAllStepsParticipantsExport =
    exportParams.step === 'all' &&
    exportParams.selectedData.length === 1 &&
    exportParams.selectedData[0] === 'participants'

  const canOnlySelectSimplifiedData =
    exportParams.selectedData.includes('votes') || exportParams.selectedData.includes('grouped-data')

  if (isAllStepsParticipantsExport) {
    return {
      forcedFormat: 'full',
      isSimplifiedDisabled: true,
      isFullDisabled: false,
    }
  }

  if (canOnlySelectSimplifiedData) {
    return {
      forcedFormat: 'simplified',
      isSimplifiedDisabled: false,
      isFullDisabled: true,
    }
  }

  return {
    forcedFormat: null,
    isSimplifiedDisabled: false,
    isFullDisabled: false,
  }
}

const ChooseDataFormatModal: FC<ChooseDataFormatModalProps> = ({ project: projectRef, exportParams, setExportParams }) => {
  const intl = useIntl()
  const [isLoading, setIsLoading] = useState(false)

  const project = useFragment(PROJECT_FRAGMENT, projectRef);
  const { goToPreviousStep, hide } = useMultiStepModal()
  const formatConstraints = getFormatConstraints(exportParams)

  const onPrevious = () => {
    goToPreviousStep()
    setExportParams({ ...exportParams, format: null })
  }

  useEffect(() => {
    if (formatConstraints.forcedFormat && exportParams.format !== formatConstraints.forcedFormat) {
      setExportParams({ ...exportParams, format: formatConstraints.forcedFormat })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatConstraints.forcedFormat, exportParams])

  const save = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const urls = resolveExportUrls(project, exportParams)

    try {
      const validUrls = urls.filter(Boolean);
      const downloadResults = await Promise.all(validUrls.map(url => downloadCSV(url, intl)));
      const hasCompletedAllExports =
        validUrls.length > 0 && downloadResults.every(result => result.downloaded || result.jsonResponse);
      if (hasCompletedAllExports) {
        hide();
      }
    } finally {
      setIsLoading(false);
    }
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
          <Heading
            color="#3D454C !important"
            fontSize={CapUIFontSize.Headline}
            lineHeight={CapUILineHeight.M}
            fontWeight={600}
          >
            {intl.formatMessage({
              id: 'global.export',
            })}
          </Heading>
        </Flex>
      </MultiStepModal.Header>

      <MultiStepModal.Body>
        <Flex direction="column" spacing={4}>
          <Text color="#3D454C !important">
            {intl.formatMessage({
              id: 'export.select_format',
            })}
          </Text>

          <Flex direction="row" gap={4} width="100%" flexWrap="wrap" alignItems="stretch">
            <Flex flex={1} minWidth={0} sx={{ flexBasis: 0 }}>
              <ChooseDataFormatRadioOption
                option="simplified"
                exportParams={exportParams}
                setExportParams={setExportParams}
                checked={formatConstraints.forcedFormat === 'simplified'}
                disabled={formatConstraints.isSimplifiedDisabled}
              />
            </Flex>
            <Flex flex={1} minWidth={0} sx={{ flexBasis: 0 }}>
              <ChooseDataFormatRadioOption
                option="full"
                exportParams={exportParams}
                setExportParams={setExportParams}
                checked={formatConstraints.forcedFormat === 'full'}
                disabled={formatConstraints.isFullDisabled}
              />
            </Flex>
          </Flex>
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
        <Button
          onClick={onPrevious}
          variant="secondary"
          variantColor="hierarchy"
          variantSize="big"
          disabled={isLoading}
        >
          {intl.formatMessage({
            id: 'global.back',
          })}
        </Button>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          onClick={save}
          isLoading={isLoading}
          disabled={!exportParams.format}
        >
          {intl.formatMessage({
            id: 'global.export.projects',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default ChooseDataFormatModal
