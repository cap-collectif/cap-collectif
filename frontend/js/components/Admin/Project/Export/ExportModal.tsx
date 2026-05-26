import type { FC } from 'react'
import { Button, MultiStepModal, CapUIModalSize, CapUIIcon } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import React, { useState } from 'react'
import ChooseStepModal from './ChooseStepModal'
import ChooseExportTypeModal from './ChooseExportTypeModal'
import ChooseDataFormatModal from './ChooseDataFormatModal'
import { graphql, useFragment } from 'react-relay'
import { ExportModal_project$key } from '~relay/ExportModal_project.graphql'


type ExportModalProps = {
  readonly project: ExportModal_project$key
}

export type ExportProps = {
  step: string
  selectedData: Array<'contribution' | 'votes' | 'participants' | 'grouped-data'>
  format: 'simplified' | 'full'
}

const FRAGMENT = graphql`
  fragment ExportModal_project on Project {
    exportSteps: steps(excludePresentationStep: true) {
      __typename
      id
      ... on ProposalStep {
        votable
      }
    }
    ...ChooseStepModal_project
    ...ChooseExportTypeModal_project
    ...ChooseDataFormatModal_project
  }
`

const ExportModal: FC<ExportModalProps> = ({ project: projectRef }) => {
  const intl = useIntl()
  const project = useFragment(FRAGMENT, projectRef)
  const [exportParams, setExportParams] = useState<ExportProps>({ step: null, selectedData: [], format: null })

  const currentStep = project.exportSteps
    .filter(step => step.__typename !== 'PresentationStep' && step.__typename !== 'OtherStep')
    .find(step => step.id === exportParams.step)
  const isCurrentStepVotable = currentStep?.votable === true || currentStep?.__typename === 'DebateStep'

  return (
    <MultiStepModal
      ariaLabel={intl.formatMessage({ id: 'import-list' })}
      disclosure={
        <Button variant="tertiary" variantColor="primary" variantSize="small" leftIcon={CapUIIcon.Download}>
          {intl.formatMessage({
            id: 'global.export',
          })}
        </Button>
      }
      size={CapUIModalSize.Md}
      hideOnClickOutside={false}
    >
      <ChooseStepModal project={project} exportParams={exportParams} setExportParams={setExportParams} />
      <ChooseExportTypeModal
        project={project}
        exportParams={exportParams}
        setExportParams={setExportParams}
        enforcedChoice={exportParams.step === 'all'}
        votesEnabled={isCurrentStepVotable}
      />
      <ChooseDataFormatModal project={project} exportParams={exportParams} setExportParams={setExportParams} />
    </MultiStepModal>
  )
}

export default ExportModal
