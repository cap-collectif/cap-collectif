import type { FC } from 'react'
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
  CapUIFontSize,
  CapUILineHeight,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import ChooseStepRadioOption from './ChooseStepRadioOption'
import { ExportProps } from './ExportModal'
import { graphql, useFragment } from 'react-relay'
import { ChooseStepModal_project$key } from '~relay/ChooseStepModal_project.graphql'

type ChooseStepModalProps = {
  readonly project: ChooseStepModal_project$key
  readonly exportParams: ExportProps
  readonly setExportParams: (exportParams: ExportProps) => void
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
  const project = useFragment(PROJECT_FRAGMENT, projectRef);
  const {steps} = project;

  // Add an additional "all steps" option
  const stepOptions = [
    ...steps,
    {
      id: 'all',
      title: `${intl.formatMessage({
        id: 'export.all-steps',
      })}`,
      __typename: 'AllSteps',
    }
  ]

  const { hide, goToNextStep } = useMultiStepModal()
  const handleOnChange = e => {
    setExportParams({ ...exportParams, step: e.target.value })
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

      <MultiStepModal.Body borderTop="1px solid" borderBottom="1px solid" borderColor="neutral-gray.200">
        <Text marginBottom={4} color="text.primary" fontSize={CapUIFontSize.BodyRegular} lineHeight={CapUILineHeight.M}>
          {intl.formatMessage({
            id: 'export.select_step',
          })}
        </Text>

        <Flex direction={'column'} alignItems={'center'}>
          <RadioGroup spacing={4}>
            {stepOptions
              .filter(step => step.__typename !== 'PresentationStep')
              .map(step => (
                <ChooseStepRadioOption step={step} exportParams={exportParams} handleOnChange={handleOnChange} />
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
