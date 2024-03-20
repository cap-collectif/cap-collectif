import * as React from 'react'
import { UseFormResetField } from 'react-hook-form/dist/types/form'
import { useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import {
  Box,
  Button,
  ButtonQuickAction,
  CapUIBorder,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Modal,
  Switch,
  Text,
  Tooltip,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { formatCodeToLocale } from '@utils/locale-helper'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { isValid } from '@utils/GeoJsonValidator'

export interface ProposalFormAdminDistrictsModalProps {
  isUpdating: boolean
  initialValue?: {
    geojson: string | null
    displayedOnMap: boolean
    border: {
      color: string | null
      opacity: number | null
      size: number | null
    } | null
    background: {
      color: string | null
      opacity: number | null
    } | null
    translations: ReadonlyArray<{
      name: string
      locale: string
    }>
  }
  index?: number
  append?: (obj: any) => void
  update?: (index: number, obj: any) => void
  defaultLocale: string
}
interface ProposalFormAdminDistrictsModalFormValues {
  name: string | null
  geojson: string | null
  displayedOnMap: boolean
  border: {
    color: string | null
    opacity: number | null
    size: number | null
  } | null
  background: {
    color: string | null
    opacity: number | null
  } | null
  translations: ReadonlyArray<{
    name: string
    locale: string
  }>
}
const resetForm = (resetField: UseFormResetField<ProposalFormAdminDistrictsModalFormValues>) => {
  resetField('name')
  resetField('geojson')
  resetField('displayedOnMap')
  resetField('background.opacity')
  resetField('background.color')
  resetField('border.opacity')
  resetField('border.size')
  resetField('border.color')
}
const ProposalFormAdminDistrictsModal: React.FC<ProposalFormAdminDistrictsModalProps> = ({
  isUpdating,
  index,
  initialValue,
  defaultLocale,
  append,
  update,
}) => {
  const intl = useIntl()

  const { handleSubmit, formState, resetField, control, watch, setValue } =
    useForm<ProposalFormAdminDistrictsModalFormValues>({
      defaultValues: {
        name: initialValue?.translations?.find(elem => elem?.locale?.toLowerCase().replace(/-/g, '_') === defaultLocale)
          .name,
        geojson: initialValue?.geojson,
        displayedOnMap: initialValue?.displayedOnMap,
        border: initialValue?.border,
        background: initialValue?.background,
      },
      mode: 'onChange',
      resolver: yupResolver(
        yup.object().shape({
          name: yup.string().ensure(),
          geojson: yup
            .string()
            .nullable()
            .test(
              'geojson',
              intl.formatMessage({
                id: 'admin.fields.proposal.map.zone.geojson.invalid',
              }),
              function (this: yup.TestContext): boolean {
                const geoJSON = this.parent.geojson
                if (!geoJSON) {
                  return true
                }
                try {
                  const decoded = JSON.parse(geoJSON)
                  if (!isValid(decoded)) {
                    return false
                  }
                } catch (e) {
                  return false
                }
                return true
              },
            ),
        }),
      ),
    })
  const onSubmit = (values: ProposalFormAdminDistrictsModalFormValues) => {
    if (isUpdating) {
      const updatedDistrict = {
        geojson: values.geojson || null,
        displayedOnMap: values.displayedOnMap || false,
        border: values.border || null,
        background: values.background || null,
        translations: [
          {
            name: values.name,
            locale: formatCodeToLocale(defaultLocale.toUpperCase()),
          },
        ],
      }
      update(index, updatedDistrict)
      resetForm(resetField)
    }
    if (!isUpdating) {
      const updatedDistrict = {
        geojson: values.geojson || null,
        displayedOnMap: values.displayedOnMap || false,
        border: values.border || null,
        background: values.background || null,
        translations: [
          {
            name: values.name,
            locale: formatCodeToLocale(defaultLocale.toUpperCase()),
          },
        ],
      }
      append(updatedDistrict)
      resetForm(resetField)
    }
  }
  return (
    <Modal
      disclosure={
        isUpdating ? (
          <ButtonQuickAction
            variantColor="blue"
            icon={CapUIIcon.Pencil}
            label="Éditer"
            className={`NeededInfo_districts_item_edit_${index}`}
          />
        ) : (
          <Button width="60px" variant="tertiary" id="add-district-button">
            {intl.formatMessage({ id: 'admin.global.add' })}
          </Button>
        )
      }
      size={CapUIModalSize.Lg}
      aria-labelledby="district-modal-title-lg"
      ariaLabel={intl.formatMessage({
        id: !isUpdating ? 'district_modal.create.title' : 'district_modal.update.title',
      })}
    >
      {({ hide }) => (
        <>
          <Modal.Header>
            <Modal.Header.Label>{intl.formatMessage({ id: 'proposal-form' })}</Modal.Header.Label>
            <Heading id="district-modal-title-lg">
              {intl.formatMessage({
                id: !isUpdating ? 'add.geographical.area' : 'district_modal.update.title',
              })}
            </Heading>
          </Modal.Header>
          <Modal.Body backgroundColor="gray.100">
            <FormControl name="name" control={control} mb={6}>
              <FormLabel htmlFor="name" label={intl.formatMessage({ id: 'global.title' })} />
              <FieldInput id="name" name="name" control={control} type="text" />
            </FormControl>
            <FormControl name="geojson" control={control} mb={6}>
              <FormLabel
                htmlFor="geojson"
                label={intl.formatMessage({
                  id: 'admin.fields.proposal.map.zone.label',
                })}
              >
                <Box as="span" color="gray.500">
                  facultatif
                </Box>
                <Tooltip label="Une aide en plus">
                  <Icon name={CapUIIcon.Info} size={CapUIIconSize.Sm} color="blue.500" />
                </Tooltip>
              </FormLabel>
              <FieldInput id="geojson" name="geojson" control={control} type="textarea" />
            </FormControl>
            <FormControl name="displayedOnMap" control={control} mb={6}>
              <FieldInput id="displayedOnMap" name="displayedOnMap" control={control} type="checkbox">
                {intl.formatMessage({ id: 'display.on.map' })}
              </FieldInput>
            </FormControl>
            {watch('displayedOnMap') && (
              <Flex direction="column">
                <Flex direction="column" mt={3} backgroundColor="white" borderRadius={CapUIBorder.Card}>
                  <Flex direction="row" justifyContent="space-between" alignItems="center" p={4}>
                    <Text color="blue.900" fontSize={2} fontWeight={CapUIFontWeight.Semibold}>
                      {intl.formatMessage({ id: 'border' })}
                    </Text>
                    <Switch
                      id="border_color_enabled"
                      checked={!!watch('border.color') || !!watch('border.size') || !!watch('border.opacity')}
                      onChange={() => {
                        if (!!watch('border.color') || !!watch('border.size') || !!watch('border.opacity')) {
                          setValue('border.size', undefined)
                          setValue('border.color', undefined)
                          setValue('border.opacity', undefined)
                        } else {
                          setValue('border.size', 1)
                          setValue('border.color', '#313131')
                          setValue('border.opacity', 1)
                        }
                      }}
                    />
                  </Flex>
                  {(!!watch('border.color') || !!watch('border.size') || !!watch('border.opacity')) && (
                    <Flex direction="column" position="relative">
                      <Text px={3} color="gray.700" fontSize={2} fontWeight={CapUIFontWeight.Semibold}>
                        {intl.formatMessage({ id: 'border.guideline' })}
                      </Text>
                      <Flex direction="row" gap={3} px={3} mt={2} pb={4}>
                        <FormControl name="border.color" width="auto" control={control} mb={0}>
                          <FormLabel
                            htmlFor="border.color"
                            label={intl.formatMessage({
                              id: 'global.color',
                            })}
                          />
                          <FieldInput id="border.color" name="border.color" control={control} type="colorPicker" />
                        </FormControl>
                        <FormControl name="border.size" width="auto" control={control} mb={0}>
                          <FormLabel
                            htmlFor="border.size"
                            label={intl.formatMessage({
                              id: 'thickness',
                            })}
                          />
                          <FieldInput id="border.size" name="border.size" control={control} type="number" min={0} />
                        </FormControl>
                        <FormControl name="border.opacity" width="auto" control={control} mb={6}>
                          <FormLabel
                            htmlFor="border.opacity"
                            label={`${intl.formatMessage({
                              id: 'opacity',
                            })}${intl.formatMessage({
                              id: 'unit.percentage',
                            })}`}
                          />
                          <FieldInput
                            id="border.opacity"
                            name="border.opacity"
                            control={control}
                            type="number"
                            min={0}
                          />
                        </FormControl>
                      </Flex>
                    </Flex>
                  )}
                </Flex>

                <Flex direction="column" mt={3} backgroundColor="white" borderRadius={CapUIBorder.Card}>
                  <Flex direction="row" justifyContent="space-between" alignItems="center" p={4}>
                    <Text color="blue.900" fontSize={2} fontWeight={CapUIFontWeight.Semibold}>
                      {intl.formatMessage({ id: 'background' })}
                    </Text>

                    <Switch
                      id="background_color_enabled"
                      checked={!!watch('background.color')}
                      onChange={() => {
                        if (!!watch('background.color') || !!watch('background.opacity')) {
                          setValue('background.color', undefined)
                          setValue('background.opacity', undefined)
                        } else {
                          setValue('background.color', '#414141')
                          setValue('background.opacity', 1)
                        }
                      }}
                    />
                  </Flex>
                  {!!watch('background.color') && (
                    <Flex direction="column" position="relative">
                      <Text px={3} color="gray.700" fontSize={2} fontWeight={CapUIFontWeight.Semibold}>
                        {intl.formatMessage({
                          id: 'background.guideline.next',
                        })}
                      </Text>
                      <Flex direction="row" gap={3} px={3} mt={2} pb={4}>
                        <FormControl name="background.color" width="auto" control={control} mb={6}>
                          <FormLabel
                            htmlFor="background.color"
                            label={intl.formatMessage({
                              id: 'global.color',
                            })}
                          />
                          <FieldInput
                            id="background.color"
                            name="background.color"
                            control={control}
                            type="colorPicker"
                          />
                        </FormControl>
                        <FormControl name="background.opacity" width="auto" control={control} mb={6}>
                          <FormLabel
                            htmlFor="background.opacity"
                            label={intl.formatMessage({
                              id: 'opacity',
                            })}
                          />
                          <FieldInput
                            id="background.opacity"
                            name="background.opacity"
                            control={control}
                            type="number"
                            min={0}
                          />
                        </FormControl>
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" variantColor="primary" variantSize="big" onClick={hide}>
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button
              id="add-district-button"
              variant="primary"
              variantColor="primary"
              variantSize="big"
              disabled={!formState.isValid}
              onClick={e => {
                handleSubmit(onSubmit)(e)
                if (formState.isValid) {
                  hide()
                }
              }}
            >
              {intl.formatMessage({ id: 'global.validate' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  )
}

export default ProposalFormAdminDistrictsModal
