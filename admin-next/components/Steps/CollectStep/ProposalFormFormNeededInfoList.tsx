import * as React from 'react'
import { ListCard } from '@ui/ListCard'
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Flex } from '@cap-collectif/ui'
import InfoModal from '@components/Steps/CollectStep/InfoModal'
import { deleteRequiredInfo } from '@components/Steps/CollectStep/ProposalFormForm.utils'
import ProposalFormAdminCategories from '@components/Steps/CollectStep/ProposalFormAdminCategories'
import ProposalFormAdminDistricts from '@components/Steps/CollectStep/ProposalFormAdminDistricts'
import { useIntl } from 'react-intl'
import { FormValues } from '@components/Steps/CollectStep/CollectStepForm'
import { UseFormSetValue } from 'react-hook-form/dist/types/form'
import { Control, FieldValue } from 'react-hook-form'
import { graphql, useFragment } from 'react-relay'
import { useCollectStep } from './CollectStepContext'
import { ProposalFormFormNeededInfoList_query$key } from '@relay/ProposalFormFormNeededInfoList_query.graphql'

export interface ProposalFormFormNeededInfoListProps {
  values: FormValues['form']
  setValue: UseFormSetValue<FieldValue<FormValues>>
  control: Control<any>
  query: ProposalFormFormNeededInfoList_query$key
  defaultLocale: string
}

const QUERY_FRAGMENT = graphql`
  fragment ProposalFormFormNeededInfoList_query on Query {
    ...ProposalFormAdminCategories_query
  }
`

const ProposalFormFormNeededInfoList: React.FC<ProposalFormFormNeededInfoListProps> = ({
  values,
  setValue,
  control,
  query: queryRef,
  defaultLocale,
}) => {
  const intl = useIntl()
  const query = useFragment(QUERY_FRAGMENT, queryRef)

  const { proposalFormKey } = useCollectStep()
  const isMapViewEnabled = values.isMapViewEnabled

  return (
    <Flex direction="column">
      <ListCard.Item backgroundColor="white" mb={4} border="none" className="NeededInfo_title">
        <Flex direction="column">
          <ListCard.Item.Label>{intl.formatMessage({ id: 'proposal_form.title' })}</ListCard.Item.Label>
        </Flex>

        <ButtonGroup>
          <InfoModal
            className="NeededInfo_title_edit"
            setValue={setValue}
            initialValues={{ HelpText: values.titleHelpText }}
            name="title"
            title={intl.formatMessage({ id: 'proposal_form.title' })}
          />
          <ButtonQuickAction
            className="NeededInfo_title_delete"
            isDisabled
            variantColor="red"
            icon={CapUIIcon.Trash}
            label={intl.formatMessage({ id: 'global.delete' })}
            disabled
            sx={{
              opacity: '0.3',
              cursor: 'default',
            }}
          />
        </ButtonGroup>
      </ListCard.Item>

      {values.usingSummary && (
        <ListCard.Item backgroundColor="white" mb={4} border="none" className="NeededInfo_summary">
          <Flex direction="column">
            <ListCard.Item.Label>{intl.formatMessage({ id: 'proposal_form.summary' })}</ListCard.Item.Label>
          </Flex>

          <ButtonGroup>
            <InfoModal
              className="NeededInfo_summary_edit"
              setValue={setValue}
              initialValues={{ HelpText: values.summaryHelpText }}
              name="summary"
              title={intl.formatMessage({ id: 'proposal_form.summary' })}
            />
            <ButtonQuickAction
              className="NeededInfo_summary_delete"
              variantColor="red"
              icon={CapUIIcon.Trash}
              label={intl.formatMessage({ id: 'global.delete' })}
              onClick={() => {
                // @ts-ignore setValue types are weird
                deleteRequiredInfo('summary', setValue, proposalFormKey)
              }}
            />
          </ButtonGroup>
        </ListCard.Item>
      )}
      {values.usingDescription && (
        <ListCard.Item backgroundColor="white" mb={4} border="none" className="NeededInfo_description">
          <Flex direction="column">
            <ListCard.Item.Label>{intl.formatMessage({ id: 'proposal_form.description' })}</ListCard.Item.Label>
          </Flex>

          <ButtonGroup>
            <InfoModal
              className="NeededInfo_description_edit"
              setValue={setValue}
              initialValues={{
                HelpText: values.descriptionHelpText,
                Mandatory: values.descriptionMandatory,
              }}
              name="description"
              title={intl.formatMessage({
                id: 'proposal_form.description',
              })}
            />
            <ButtonQuickAction
              className="NeededInfo_description_delete"
              variantColor="red"
              icon={CapUIIcon.Trash}
              label={intl.formatMessage({ id: 'global.delete' })}
              onClick={() => {
                deleteRequiredInfo('description', setValue, proposalFormKey)
              }}
            />
          </ButtonGroup>
        </ListCard.Item>
      )}
      {values.usingThemes && (
        <ListCard.Item backgroundColor="white" mb={4} border="none" className="NeededInfo_themes">
          <Flex direction="column">
            <ListCard.Item.Label>{intl.formatMessage({ id: 'proposal_form.theme' })}</ListCard.Item.Label>
          </Flex>

          <ButtonGroup>
            <InfoModal
              className="NeededInfo_themes_edit"
              setValue={setValue}
              initialValues={{
                HelpText: values.themeHelpText,
                Mandatory: values.themeMandatory,
              }}
              name="theme"
              title={intl.formatMessage({ id: 'proposal_form.theme' })}
            />
            <ButtonQuickAction
              className="NeededInfo_themes_delete"
              variantColor="red"
              icon={CapUIIcon.Trash}
              label={intl.formatMessage({ id: 'global.delete' })}
              onClick={() => {
                deleteRequiredInfo('theme', setValue, proposalFormKey)
              }}
            />
          </ButtonGroup>
        </ListCard.Item>
      )}
      {values.usingCategories && (
        <ListCard.Item
          backgroundColor="white"
          mb={4}
          border="none"
          align="flex-start"
          className="NeededInfo_categories"
        >
          <Flex direction="column" width="100%">
            <Flex direction="row" justify="space-between" width="100%" mb={5}>
              <ListCard.Item.Label>{intl.formatMessage({ id: 'global.categories' })}</ListCard.Item.Label>
              <ButtonGroup>
                <InfoModal
                  className="NeededInfo_categories_edit"
                  setValue={setValue}
                  initialValues={{
                    HelpText: values.categoryHelpText,
                    Mandatory: values.categoryMandatory,
                  }}
                  name="category"
                  title={intl.formatMessage({
                    id: 'proposal_form.category',
                  })}
                />
                <ButtonQuickAction
                  className="NeededInfo_categories_delete"
                  variantColor="red"
                  icon={CapUIIcon.Trash}
                  label={intl.formatMessage({ id: 'global.delete' })}
                  onClick={() => {
                    deleteRequiredInfo('categories', setValue, proposalFormKey)
                  }}
                />
              </ButtonGroup>
            </Flex>
            <ProposalFormAdminCategories query={query} control={control} key={proposalFormKey} />
          </Flex>
        </ListCard.Item>
      )}
      {values.usingAddress && (
        <ListCard.Item backgroundColor="white" mb={4} border="none" className="NeededInfo_address">
          <Flex direction="column">
            <ListCard.Item.Label>{intl.formatMessage({ id: 'proposal_form.address' })}</ListCard.Item.Label>
          </Flex>

          <ButtonGroup>
            <InfoModal
              className="NeededInfo_address_edit"
              setValue={setValue}
              initialValues={{ HelpText: values.addressHelpText }}
              name="address"
              title={intl.formatMessage({ id: 'proposal_form.address' })}
            />
            <ButtonQuickAction
              className="NeededInfo_address_delete"
              isDisabled={isMapViewEnabled}
              disabled={isMapViewEnabled}
              variantColor="red"
              icon={CapUIIcon.Trash}
              label={intl.formatMessage({ id: 'global.delete' })}
              onClick={() => {
                deleteRequiredInfo('address', setValue, proposalFormKey)
              }}
              sx={{
                opacity: isMapViewEnabled ? '0.3' : 1,
                cursor: isMapViewEnabled ? 'default' : 'pointer',
                '&:hover': {
                  backgroundColor: isMapViewEnabled ? 'transparent' : 'red.150',
                },
                '&:hover .cap-icon': {
                  color: isMapViewEnabled ? '' : 'red.500',
                },
              }}
            />
          </ButtonGroup>
        </ListCard.Item>
      )}
      {values.usingDistrict && (
        <ListCard.Item backgroundColor="white" mb={4} border="none" align="flex-start" className="NeededInfo_district">
          <Flex direction="column" width="100%">
            <Flex direction="row" justify="space-between" width="100%" mb={5}>
              <ListCard.Item.Label>{intl.formatMessage({ id: 'proposal_form.districts' })}</ListCard.Item.Label>
              <ButtonGroup>
                <InfoModal
                  className="NeededInfo_district_edit"
                  setValue={setValue}
                  initialValues={{
                    HelpText: values.districtHelpText,
                    Mandatory: values.districtMandatory,
                    proposalInAZoneRequired: values.proposalInAZoneRequired,
                  }}
                  name="district"
                  title={intl.formatMessage({
                    id: 'proposal_form.districts',
                  })}
                />
                <ButtonQuickAction
                  className="NeededInfo_district_delete"
                  variantColor="red"
                  icon={CapUIIcon.Trash}
                  label={intl.formatMessage({ id: 'global.delete' })}
                  onClick={() => {
                    deleteRequiredInfo('district', setValue, proposalFormKey)
                  }}
                />
              </ButtonGroup>
            </Flex>
            <ProposalFormAdminDistricts control={control} defaultLocale={defaultLocale} />
          </Flex>
        </ListCard.Item>
      )}
      {values.usingIllustration && (
        <ListCard.Item backgroundColor="white" mb={4} border="none" className="NeededInfo_illustration">
          <Flex direction="column">
            <ListCard.Item.Label>
              {intl.formatMessage({
                id: 'proposal_form.illustration',
              })}
            </ListCard.Item.Label>
          </Flex>

          <ButtonGroup>
            <InfoModal
              className="NeededInfo_illustration_edit"
              setValue={setValue}
              initialValues={{ HelpText: values.illustrationHelpText }}
              name="illustration"
              title={intl.formatMessage({
                id: 'proposal_form.illustration',
              })}
            />
            <ButtonQuickAction
              className="NeededInfo_illustration_delete"
              variantColor="red"
              icon={CapUIIcon.Trash}
              label={intl.formatMessage({ id: 'global.delete' })}
              onClick={() => {
                deleteRequiredInfo('illustration', setValue, proposalFormKey)
              }}
            />
          </ButtonGroup>
        </ListCard.Item>
      )}
    </Flex>
  )
}

export default ProposalFormFormNeededInfoList
