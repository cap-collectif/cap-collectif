import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { ButtonGroup, ButtonQuickAction, CapUIIcon, CapUIIconSize, Flex, Icon, ListCard } from '@cap-collectif/ui'
import {
  AvailableProposalCategoryIcon,
  ProposalFormAdminCategories_query$key,
} from '@relay/ProposalFormAdminCategories_query.graphql'
import { useFeatureFlags } from '@shared/hooks/useFeatureFlag'
import ProposalFormAdminCategoriesModal from '@components/Steps/CollectStep/ProposalFormAdminCategoriesModal'
import type { FormValues } from '@components/Steps/CollectStep/CollectStepForm'
import { Control } from 'react-hook-form'
import convertIconToDs from '@components/Steps/CollectStep/ProposalFormAdminCategories.utils'
import { useFieldArray } from 'react-hook-form'
import { useCollectStep } from './CollectStepContext'
import { AvailableProposalCategoryColor } from '@relay/PreConfigureProjectMutation.graphql'
import { useIntl } from 'react-intl'

export interface ProposalFormAdminCategoriesProps {
  query: ProposalFormAdminCategories_query$key
  control: Control<FormValues>
  categories: FormValues['form']['categories']
}

const CATEGORIES_FRAGMENT = graphql`
  fragment ProposalFormAdminCategories_query on Query {
    proposalCategoryOptions {
      colors
      icons
    }
    ...ProposalFormAdminCategoriesModal_query
  }
`

export const getFormattedCategories = (categories: FormValues['form']['categories']) => {
  return (
    categories?.map(category => ({
      ...category,
      color: !!category.color ? category.color.replace('#', 'COLOR_').toUpperCase() : 'COLOR_EF5350',
      icon: !!category.icon ? category.icon.toUpperCase().replace(/-/g, '_') : null,
      categoryImage: !!category.categoryImage ? category.categoryImage.id : null,
    })) ?? []
  )
}

const ProposalFormAdminCategories: React.FC<ProposalFormAdminCategoriesProps> = ({
  query: queryRef,
  control,
  categories,
}) => {
  const query = useFragment(CATEGORIES_FRAGMENT, queryRef)
  const intl = useIntl()
  const { proposalCategoryOptions } = query
  const { proposalFormKey } = useCollectStep()

  const { append, remove, update } = useFieldArray({
    control,
    name: `${proposalFormKey}.categories`,
  })

  const _categories = categories === null || categories === undefined ? [] : categories
  const features = useFeatureFlags(['display_pictures_in_depository_proposals_list'])
  const usedColors = _categories?.map(c => c.color)
  const usedIcons = _categories?.map(c => c.icon)

  return (
    <Flex direction="column" width="100%" gap={2}>
      {_categories.length > 0 && (
        <ListCard>
          {_categories.map((category, index) => (
            <ListCard.Item backgroundColor="white" align="center" py={0} key={category.id}>
              <ListCard.Item.Label>
                {features.display_pictures_in_depository_proposals_list ? (
                  <Flex direction="row" justify="flex-start" align="center" gap={3}>
                    <Flex
                      justify="center"
                      align="center"
                      py={2}
                      px={4}
                      paddingLeft={0}
                      borderColor="gray.300"
                      borderRightWidth={1}
                    >
                      <Flex
                        align="center"
                        justify="center"
                        backgroundColor={category.color.replace('COLOR_', '#').toLowerCase()}
                        width={4}
                        height={4}
                      >
                        {category.icon && (
                          <Icon
                            name={
                              CapUIIcon[
                                // @ts-ignore
                                convertIconToDs(category.icon)
                              ]
                            }
                            size={CapUIIconSize.Sm}
                            color="white"
                          />
                        )}
                      </Flex>
                    </Flex>
                    {category.name}
                  </Flex>
                ) : (
                  <>{category.name}</>
                )}
              </ListCard.Item.Label>
              <ButtonGroup>
                <ProposalFormAdminCategoriesModal
                  query={query}
                  isUpdating
                  initialValue={category}
                  index={index}
                  update={update}
                  colors={
                    proposalCategoryOptions.colors.map(color =>
                      color.replace('COLOR_', '#').toLowerCase(),
                    ) as AvailableProposalCategoryColor[]
                  }
                  icons={
                    proposalCategoryOptions.icons.map(icon =>
                      icon.toLowerCase().replace(/_/g, '-'),
                    ) as AvailableProposalCategoryIcon[]
                  }
                  usedColors={usedColors}
                  usedIcons={usedIcons}
                />
                <ButtonQuickAction
                  className={`NeededInfo_categories_item_delete_${index}`}
                  variantColor="red"
                  icon={CapUIIcon.Trash}
                  label={intl.formatMessage({ id: 'action_delete' })}
                  onClick={() => remove(index)}
                />
              </ButtonGroup>
            </ListCard.Item>
          ))}
        </ListCard>
      )}
      <ProposalFormAdminCategoriesModal
        query={query}
        isUpdating={false}
        isContainer
        index={_categories.length}
        initialValue={null}
        append={append}
        colors={
          proposalCategoryOptions.colors.map(color =>
            color.replace('COLOR_', '#').toLowerCase(),
          ) as AvailableProposalCategoryColor[]
        }
        icons={
          proposalCategoryOptions.icons.map(icon =>
            icon.toLowerCase().replace(/_/g, '-'),
          ) as AvailableProposalCategoryIcon[]
        }
        usedColors={usedColors}
        usedIcons={usedIcons}
      />
    </Flex>
  )
}

export default ProposalFormAdminCategories
