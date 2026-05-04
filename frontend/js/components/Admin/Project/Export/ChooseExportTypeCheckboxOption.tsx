import type { FC } from 'react'
import React from 'react'
import { Text, Flex, Checkbox, Card, CapUISpotIconSize, SpotIcon, CapUISpotIcon } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ExportProps } from './ExportModal'

type ChooseExportTypeCheckboxOptionProps = {
  readonly option: 'contribution' | 'votes' | 'participants' | 'grouped-data'
  readonly exportParams: ExportProps
  readonly setExportParams: (exportParam: ExportProps) => void
  readonly disabled?: boolean
}

const ChooseExportTypeCheckboxOption: FC<ChooseExportTypeCheckboxOptionProps> = ({
  option,
  exportParams,
  setExportParams,
  disabled,
}) => {
  const intl = useIntl()

  const handleSelectedChange = e => {
    const { value } = e.target
    if (e.target.checked) {
      setExportParams({ ...exportParams, selectedData: [...exportParams.selectedData, value] })
    } else {
      setExportParams({ ...exportParams, selectedData: exportParams.selectedData.filter(item => item !== value) })
    }
  }

  const getBackgroundColor = (option: 'contribution' | 'votes' | 'participants' | 'grouped-data') => {
    switch (option) {
      case 'contribution':
        return disabled
          ? 'neutral-gray.100'
          : exportParams.selectedData.includes('contribution')
          ? 'primary.100'
          : 'inherit'

      case 'votes':
        return disabled
          ? 'neutral-gray.100'
          : exportParams.selectedData.includes('votes')
          ? 'primary.100'
          : 'inherit'

      case 'participants':
        return exportParams.selectedData.includes('participants') ? 'primary.100' : 'inherit'

      case 'grouped-data':
        return disabled
          ? 'neutral-gray.100'
          : exportParams.selectedData.includes('grouped-data')
          ? 'primary.100'
          : 'inherit'
    }
  }

  /**
   * @param option the parent option (string)
   * @param value the targeted element: checkbox label, description, or icon
   * @returns a html content as either an icon or a translation key
   */
  const getOptionContent = (
    option: 'contribution' | 'votes' | 'participants' | 'grouped-data',
    value: 'label' | 'description' | 'icon',
  ) => {
    const content = {
      contribution: {
        label: 'global.contribution',
        description: 'data.contribution',
        icon: CapUISpotIcon.VIGNETTE,
      },
      votes: {
        label: 'global.vote',
        description: 'data.votes',
        icon: CapUISpotIcon.RATING_CLICK,
      },
      participants: {
        label: 'global.participants',
        description: 'data.participants',
        icon: CapUISpotIcon.FORM,
      },
      'grouped-data': {
        label: 'data.grouped',
        description: 'data.grouped-by-step',
        icon: CapUISpotIcon.TABLEAU,
      },
    }

    return content[option][value]
  }

  return (
    <Card
      display={'flex'}
      alignContent={'center'}
      border="1px solid"
      backgroundColor={getBackgroundColor(option)}
      borderColor={exportParams.selectedData.includes(option) ? 'primary.base' : 'neutral-gray.200'}
      sx={{
        '&:hover': {
          cursor: disabled ? 'not-allowed' : 'pointer',
        },
        label: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          '&:hover': {
            cursor: disabled ? 'not-allowed' : 'pointer',
          },
        },
      }}
    >
      <Checkbox
        checked={exportParams.selectedData.includes(option)}
        onChange={handleSelectedChange}
        id={option}
        value={option}
        disabled={disabled}
      >
        <SpotIcon name={getOptionContent(option, 'icon') as CapUISpotIcon} size={CapUISpotIconSize.Md} />
        <Flex direction={'column'}>
          <Text color={'text.primary'} fontWeight={600}>
            {intl.formatMessage({
              id: getOptionContent(option, 'label'),
            })}
          </Text>
          <Text fontWeight={300}>{intl.formatMessage({ id: getOptionContent(option, 'description') })}</Text>
        </Flex>
      </Checkbox>
    </Card>
  )
}

export default ChooseExportTypeCheckboxOption
