import type { FC, Dispatch, SetStateAction } from 'react'
import React from 'react'
import {
  Button,
  MultiStepModal,
  Text,
  Heading,
  useMultiStepModal,
  Flex,
  RadioGroup,
  CapUIIcon,
  Modal,
  CapUIFontSize,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import ChooseStepRadioOption from './ChooseStepRadioOption'
import { ExportProps } from './ExportModal'
import { ProjectType, Step } from './ExportModal.type'
import { ChooseStepModal_project$key } from '@relay/ChooseStepModal_project.graphql'
import { graphql, useFragment } from 'react-relay'

type ChooseStepModalProps = {
  readonly project: ChooseStepModal_project$key
  readonly exportParams: ExportProps
  readonly setExportParams: Dispatch<SetStateAction<ExportProps>>
}

const PROJECT_FRAGMENT = graphql`
  fragment ChooseStepModal_project on Project {
    title
    steps {
      id
      title
      __typename
    }
  }
`

const ChooseStepModal: FC<ChooseStepModalProps> = ({ project: projectRef, exportParams, setExportParams }) => {
  const intl = useIntl()
  const project = useFragment(PROJECT_FRAGMENT, projectRef)
  const { steps } = project

  // Add an additional "all steps" option
  const stepOptions: Step[] = [
    ...steps.map(step => ({
      ...step,
      __typename: step.__typename as ProjectType,
    })),
    {
      id: 'all',
      title: `${intl.formatMessage({
        id: 'export.all-steps',
      })}`,
      __typename: 'AllSteps',
    },
  ]

  const { hide, goToNextStep } = useMultiStepModal()
  const handleOnChange = e => {
    setExportParams({ ...exportParams, step: e.target.value })
  }

  return (
    <>
      <MultiStepModal.Header>
        <Heading color="text.tertiary">
          <Modal.Header.Label fontSize={CapUIFontSize.Caption} uppercase={true}>
            {project.title}
          </Modal.Header.Label>
          <Text color="#3D454C !important">
            {intl.formatMessage({
              id: 'global.export',
            })}
          </Text>
        </Heading>
      </MultiStepModal.Header>

      <MultiStepModal.Body>
        <Text marginBottom={4} color="#3D454C !important">
          {intl.formatMessage({
            id: 'export.select_step',
          })}
        </Text>

        <Flex direction={'column'} alignItems={'center'}>
          <RadioGroup spacing={4}>
            {stepOptions
              .filter(step => step.__typename !== 'PresentationStep')
              .map(step => (
                <ChooseStepRadioOption
                  key={step.id}
                  step={step}
                  exportParams={exportParams}
                  handleOnChange={handleOnChange}
                />
              ))}
          </RadioGroup>
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
        <Button onClick={hide} variant="secondary" variantColor="hierarchy" variantSize="big">
          {intl.formatMessage({
            id: 'global.cancel',
          })}
        </Button>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          rightIcon={CapUIIcon.LongArrowRight}
          onClick={goToNextStep}
          disabled={!exportParams.step}
        >
          {intl.formatMessage({
            id: 'global.next',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default ChooseStepModal
