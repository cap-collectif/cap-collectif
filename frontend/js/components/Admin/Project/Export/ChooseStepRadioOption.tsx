import React, { FC } from 'react'
import {
  Text,
  Flex,
  Card,
  Radio,
  FormControl,
  SpotIcon,
  CapUISpotIconSize,
  CapUISpotIcon,
  CapUIFontWeight,
  CapUIFontSize,
  CapUILineHeight,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ExportProps } from './ExportModal'
import { ProjectType, Step } from './ExportModal.type'

type ChooseStepRadioOptionProps = {
  readonly step: Step
  readonly exportParams: ExportProps
  readonly handleOnChange: (e: any) => void
}

export const ChooseStepRadioOption: FC<ChooseStepRadioOptionProps> = ({ step, exportParams, handleOnChange }) => {
  const intl = useIntl()
  const isSelectedCurrentStep = exportParams.step === step.id

  const getStepContent = (type: ProjectType, value: 'icon' | 'title') => {
    const content = {
      DebateStep: {
        icon: CapUISpotIcon.USER_DISCUSS,
        title: 'global.debate',
      },
      ConsultationStep: {
        icon: CapUISpotIcon.CONSULTATION,
        title: 'global.consultation',
      },
      CollectStep: {
        icon: CapUISpotIcon.BULB_SKETCH,
        title: 'global.collect.step.label',
      },
      SelectionStep: {
        icon: CapUISpotIcon.RATING_CLICK,
        title: 'global.selection',
      },
      RankingStep: {
        icon: CapUISpotIcon.PROJECT,
        title: 'ranking-step',
      },
      QuestionnaireStep: {
        icon: CapUISpotIcon.QUESTIONNAIRE,
        title: 'global.questionnaire',
      },
      OtherStep: {
        icon: CapUISpotIcon.PROJECT,
        title: 'global.custom.feminine.lowercase',
      },
      AllSteps: {
        icon: CapUISpotIcon.PROJECT,
        title: 'every-step',
      },
    }
    return content[type][value]
  }

  return (
    <FormControl key={step.id}>
      <Card
        display={'flex'}
        alignItems="center"
        border="1px solid"
        backgroundColor={isSelectedCurrentStep ? 'primary.background' : '#FFFFFF'}
        borderColor={isSelectedCurrentStep ? '#C2DFFF' : '#DADEE1'}
        borderRadius="8px"
        px={4}
        py={2}
        gap={2}
        width="100%"
        sx={{
          '&:hover': {
            cursor: 'pointer',
          },
          label: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            justifyContent: 'flex-start',
            '&:hover': {
              cursor: 'pointer',
            },
          },
        }}
      >
        <Radio id={step.id} name={step.title} value={step.id} checked={isSelectedCurrentStep} onChange={handleOnChange}>
          <SpotIcon
            name={getStepContent(step.__typename as ProjectType, 'icon') as CapUISpotIcon}
            size={CapUISpotIconSize.Md}
          />
          <Flex direction={'column'} alignItems="flex-start">
            <Text
              color="text.primary"
              fontWeight={CapUIFontWeight.Semibold}
              fontSize={CapUIFontSize.BodyRegular}
              lineHeight={CapUILineHeight.M}
            >
              {intl.formatMessage({
                id: getStepContent(step.__typename as ProjectType, 'title'),
              })}
            </Text>
            <Text
              fontWeight={CapUIFontWeight.Normal}
              fontSize={CapUIFontSize.BodyRegular}
              lineHeight={CapUILineHeight.M}
              color="#3D454C !important"
            >
              {step.title}
            </Text>
          </Flex>
        </Radio>
      </Card>
    </FormControl>
  )
}
export default ChooseStepRadioOption
