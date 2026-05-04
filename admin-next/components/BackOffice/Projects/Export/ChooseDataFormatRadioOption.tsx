import type { FC, Dispatch, SetStateAction } from 'react'
import React from 'react'
import {
  Text,
  Flex,
  Card,
  Radio,
  SpotIcon,
  CapUISpotIcon,
  CapUISpotIconSize,
  Icon,
  CapUIIcon,
  CapUIFontWeight,
  CapUIFontSize,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ExportProps } from './ExportModal'

type ChooseDataFormatRadioOptionProps = {
  readonly option: 'simplified' | 'full'
  readonly exportParams: ExportProps
  readonly setExportParams: Dispatch<SetStateAction<ExportProps>>
  readonly disabled?: boolean
  readonly checked?: boolean
}

const ChooseDataFormatRadioOption: FC<ChooseDataFormatRadioOptionProps> = ({
  option,
  exportParams,
  setExportParams,
  disabled,
  checked,
}) => {
  const intl = useIntl()

  const handleSelect = () => {
    if (disabled) {
      return
    }
    setExportParams({ ...exportParams, format: option })
  }

  return (
    <Card
      display={'flex'}
      height="100%"
      width={'100%'}
      minWidth={0}
      gap={4}
      sx={{
        '&:hover': {
          cursor: disabled ? 'not-allowed' : 'pointer',
        },
        'alignItems': 'center',
        'justifyContent': 'space-between',
      }}
      border="1px solid"
      backgroundColor={
        disabled ? 'neutral-gray.100' : exportParams.format === option ? 'primary.background' : 'inherit'
      }
      borderColor={exportParams.format === `${option}-data` ? 'primary.base' : 'neutral-gray.200'}
      onClick={handleSelect}
      aria-disabled={disabled}
    >
      <Flex gap={4} direction={'column'} alignItems={'center'} flex={1} width="100%" minHeight={0}>
        {option === 'simplified' && <SpotIcon name={CapUISpotIcon.SHEET} size={CapUISpotIconSize.Lg} />}
        {/* TODO: add the proper icon */}
        {option === 'full' && <SpotIcon name={CapUISpotIcon.SHEET_FULL} size={CapUISpotIconSize.Lg} />}

        <Text textAlign={'center'} color={'primary.base'} fontWeight={CapUIFontWeight.Bold} mb={2}>
          {intl.formatMessage({
            id: `data.${option}`,
          })}
        </Text>
        <Text textAlign={'center'} fontSize={CapUIFontSize.BodyRegular}>
          {intl.formatMessage({
            id: `data.${option}-description`,
          })}
        </Text>
        <Flex direction={'row'} mt="auto" alignItems="center" gap={2}>
          <Icon name={CapUIIcon.CheckO} />
          <Text fontSize={CapUIFontSize.BodySmall}>
            {intl.formatMessage({
              id: `data.${option}-tip`,
            })}
          </Text>
        </Flex>
      </Flex>
      <Radio
        id={option}
        name={option}
        value={option}
        checked={exportParams.format === option || checked}
        onChange={handleSelect}
        onClick={event => event.stopPropagation()}
        justifySelf={'flex-end'}
        disabled={disabled}
      />
    </Card>
  )
}

export default ChooseDataFormatRadioOption
