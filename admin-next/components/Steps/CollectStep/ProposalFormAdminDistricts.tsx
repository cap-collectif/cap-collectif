import * as React from 'react'
import { FormValues } from '@components/Steps/CollectStep/CollectStepForm'
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Flex, ListCard } from '@cap-collectif/ui'
import ProposalFormAdminDistrictsModal from '@components/Steps/CollectStep/ProposalFormAdminDistrictsModal'
import { Control, useFieldArray } from 'react-hook-form'
import { useCollectStep } from './CollectStepContext'
import { useIntl } from 'react-intl'

export interface ProposalFormAdminDistrictsProps {
  control: Control<FormValues>
  defaultLocale: string
  districts: FormValues['form']['districts']
}

const ProposalFormAdminDistricts: React.FC<ProposalFormAdminDistrictsProps> = ({
  defaultLocale,
  control,
  districts,
}) => {
  const intl = useIntl()
  const { proposalFormKey } = useCollectStep()

  const { append, remove, update } = useFieldArray({
    control,
    name: `${proposalFormKey}.districts`,
  })

  const _districts = districts ?? []

  return (
    <Flex direction="column" width="100%" gap={2}>
      {_districts.length > 0 && (
        <ListCard>
          {_districts.map((district, index) => {
            return (
              <ListCard.Item backgroundColor="white" align="center" py={0} key={index}>
                <ListCard.Item.Label>
                  {
                    district.translations?.find(
                      elem => elem?.locale?.toLowerCase().replace(/-/g, '_') === defaultLocale,
                    ).name
                  }
                </ListCard.Item.Label>
                <ButtonGroup>
                  <ProposalFormAdminDistrictsModal
                    isUpdating
                    initialValue={district}
                    index={index}
                    update={update}
                    defaultLocale={defaultLocale}
                  />
                  <ButtonQuickAction
                    className={`NeededInfo_districts_item_delete_${index}`}
                    variantColor="red"
                    icon={CapUIIcon.Trash}
                    label={intl.formatMessage({ id: 'action_delete' })}
                    onClick={() => {
                      remove(index)
                    }}
                  />
                </ButtonGroup>
              </ListCard.Item>
            )
          })}
        </ListCard>
      )}

      <ProposalFormAdminDistrictsModal
        isUpdating={false}
        index={_districts.length}
        isContainer
        append={append}
        defaultLocale={defaultLocale}
      />
    </Flex>
  )
}

export default ProposalFormAdminDistricts
