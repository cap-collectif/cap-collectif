import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { Button, CapColorPickerVariant, CapUIIcon, Flex, InputGroup } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormValues } from '@components/BackOffice/Steps/SelectStep/SelectStepForm'
import { ProposalStepStatuses_query$key } from '@relay/ProposalStepStatuses_query.graphql'
import { pxToRem } from '@shared/utils/pxToRem'

type ProposalStepStatusesColor =
  | 'CAUTION'
  | 'DANGER'
  | 'DEFAULT'
  | 'INFO'
  | 'PRIMARY'
  | 'SUCCESS'
  | 'WARNING'
  | '%future added value'

export interface ProposalStepStatusesProps {
  readonly formMethods: UseFormReturn<any>
  readonly query: ProposalStepStatuses_query$key
}

const STATUSLIST_QUERY = graphql`
  fragment ProposalStepStatuses_query on Query {
    siteColors {
      keyname
      value
    }
  }
`

enum StatusColorsEnum {
  INFO = '#77b5fe',
  PRIMARY = '',
  SUCCESS = '#399a39',
  WARNING = '#f4b721',
  DANGER = '#f75d56',
  DEFAULT = '#707070',
}

export const getStatusesInitialValues = (
  statuses:
    | ReadonlyArray<{
        id: string
        name: string
        color: ProposalStepStatusesColor
      }>
    | undefined,
  bgColor: string,
) => {
  if (!!statuses) {
    return statuses.map(status => ({
      ...status,
      color: status.color === 'PRIMARY' ? bgColor : StatusColorsEnum[status.color],
    }))
  }
}
export const getStatusesInputList = (statuses: FormValues['statuses'], bgColor: string) => {
  if (statuses) {
    return statuses.map(status => {
      if (status.color === bgColor) {
        return {
          ...status,
          color: 'PRIMARY',
        }
      } else {
        const index = Object.values(StatusColorsEnum).indexOf(status.color as StatusColorsEnum)
        return {
          ...status,
          color: Object.keys(StatusColorsEnum)[index],
        }
      }
    })
  }
}

const ProposalStepStatuses: React.FC<ProposalStepStatusesProps> = ({ formMethods, query: queryRef }) => {
  const { siteColors } = useFragment(STATUSLIST_QUERY, queryRef)
  const bgColor = siteColors.find(elem => elem.keyname === 'color.btn.primary.bg').value
  const intl = useIntl()
  const { control } = formMethods
  const {
    fields: statuses,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `statuses`,
  })

  return (
    <Flex direction="column" width="100%">
      {statuses.map((status, index) => (
        <InputGroup
          key={status.id}
          width="100%"
          wrap="nowrap"
          sx={{
            '.cap-form-control:last-child': { width: '100% !important' },
            '.cap-color-picker_container': { marginTop: '0 !important', width: pxToRem(32), height: pxToRem(32) },
          }}
        >
          <FormControl name={`statuses[${index}].color`} control={control} position="relative">
            <FieldInput
              type="colorPicker"
              id={`statuses[${index}].color`}
              name={`statuses[${index}].color`}
              control={control}
              // @ts-ignore
              variant={CapColorPickerVariant.Twitter}
              colors={[bgColor, '#77b5fe', '#399a39', '#f4b721', '#f75d56', '#707070']}
              sx={{
                display: 'none',
              }}
            />
          </FormControl>
          <FormControl name={`statuses[${index}].name`} control={control} sx={{ width: '100% !important' }}>
            <FieldInput
              data-cy={`statuses_${index}_name`}
              id={`statuses[${index}].name`}
              name={`statuses[${index}].name`}
              control={control}
              type="text"
              placeholder={intl.formatMessage({ id: 'enter-label' })}
              onClickActions={[
                {
                  icon: CapUIIcon.Trash,
                  onClick: () => remove(index),
                  label: intl.formatMessage({ id: 'global.delete' }),
                },
              ]}
            />
          </FormControl>
        </InputGroup>
      ))}
      <Button
        id="add-status-button"
        variant="tertiary"
        mb={4}
        onClick={() => {
          append({ color: bgColor })
        }}
      >
        {intl.formatMessage({ id: 'global.add' })}
      </Button>
    </Flex>
  )
}

export default ProposalStepStatuses
