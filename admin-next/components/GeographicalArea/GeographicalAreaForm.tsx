import * as React from 'react'
import L from 'leaflet'
import { useIntl, IntlShape } from 'react-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { graphql, useLazyLoadQuery } from 'react-relay'
import dynamic from 'next/dynamic'
import {
  Flex,
  Heading,
  Menu,
  CapUIIcon,
  FormLabel,
  Button,
  Switch,
  Spinner,
  toast,
  FormGuideline,
  Box,
  UPLOADER_SIZE,
  Text,
  Icon,
  CapUIIconSize,
  Link,
} from '@cap-collectif/ui'
import { GeographicalAreaFormQuery } from '@relay/GeographicalAreaFormQuery.graphql'
import useFeatureFlag from '@hooks/useFeatureFlag'
import { createOrReplaceTranslation, formatCodeToLocale } from '@utils/locale-helper'
import { FieldInput, FormControl } from '@cap-collectif/form'
import GeographicalAreaDeleteModal from 'components/GeographicalAreasList/GeographicalAreaDeleteModal'
import { useDisclosure } from '@liinkiing/react-hooks'
import CreateGlobalDistrictMutation from '@mutations/CreateGlobalDistrictMutation'
import { formatGeoJsons, FormattedDistrict } from '@utils/leaflet'
import { mutationErrorToast } from '@utils/mutation-error-toast'
import UpdateGlobalDistrictMutation from '@mutations/UpdateGlobalDistrictMutation'
import { UPLOAD_PATH } from '@utils/config'
import TextEditor from 'components/Form/TextEditor/TextEditor'

const GeographicalAreaMap = dynamic(() => import('./GeographicalAreaMap'), { ssr: false })

export const QUERY = graphql`
  query GeographicalAreaFormQuery {
    availableLocales(includeDisabled: false) {
      code
      isEnabled
      isDefault
      traductionKey
    }
  }
`

const isGeoJSONValid = (geoJSON: any[]) => {
  try {
    return !!L.geoJson(geoJSON[0].district)
  } catch (e) {
    return false
  }
}

const onSubmit = (
  data: FormattedDistrict,
  intl: IntlShape,
  locale: string,
  setIsLoading: (isLoading: boolean) => void,
  translations?: any,
) => {
  const fields = [
    {
      name: 'name',
      value: data.name,
    },
    {
      name: 'titleOnMap',
      value: data.titleOnMap,
    },
    {
      name: 'description',
      value: data.description,
    },
  ]
  const input = {
    translations: createOrReplaceTranslation(fields, locale, translations ? translations : null),
    cover: data.cover ? data.cover.id : null,
    geojson: data.geojson,
    displayedOnMap: data.displayedOnMap,
    border: {
      enabled: data.border ? true : false,
      color: data.border ? data.border.color : null,
      opacity: data.border ? data.border.opacity : null,
      size: data.border ? data.border.size : null,
    },
    background: {
      enabled: data.background ? true : false,
      color: data.background ? data.background.color?.slice(0, 7) : null,
      opacity: data.background ? fromHexStringToOpacity(data.background.color?.slice(7, 9)) : null,
    },
  }
  if (!data.id) {
    return CreateGlobalDistrictMutation.commit({
      input,
    })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'zone-geo-created' }),
        })
        setIsLoading(false)
        window.location.href = '/admin-next/geographicalAreas'
      })
      .catch(() => {
        mutationErrorToast(intl)
      })
  } else {
    UpdateGlobalDistrictMutation.commit({
      input: {
        ...input,
        id: data.id,
      },
    })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'zone-geo-modified' }),
        })
        setIsLoading(false)
      })
      .catch(() => {
        mutationErrorToast(intl)
      })
  }
}

const fromHexStringToOpacity = (hex: string) => Math.round(100 * (Number(`0x${hex}`) / 255))
const toHexStringFromOpacity = (opacity: number) => Math.round(255 * (opacity / 100)).toString(16)

type Props = {
  queryValues?: any
  translations?: readonly {
    readonly name: string
    readonly titleOnMap: string | null
    readonly locale: string
    readonly description: string | null
  }[]
}

const GeographicalAreaForm: React.FC<Props> = ({ queryValues, translations }) => {
  const intl = useIntl()
  const [geoJSONValid, setGeoJSONValid] = React.useState(false)
  const multilangue = useFeatureFlag('multilangue')
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { availableLocales } = useLazyLoadQuery<GeographicalAreaFormQuery>(QUERY, {})
  const defaultLocale = availableLocales.find(locale => locale.isDefault)
  const [localeSelected, setLocaleSelected] = React.useState({
    label: intl.formatMessage({ id: defaultLocale?.traductionKey || 'french' }),
    value: formatCodeToLocale(defaultLocale?.code || ''),
  })

  const defaultValues = {
    id: null,
    geojson: '',
    displayedOnMap: false,
    name: translations?.find(translation => translation.locale === localeSelected.value)?.name || '',
    titleOnMap: translations?.find(translation => translation.locale === localeSelected.value)?.titleOnMap || '',
    description: translations?.find(translation => translation.locale === localeSelected.value)?.description || '',
    ...queryValues,
    border: { color: '#5e5e5e', size: 1, ...queryValues?.border, opacity: 100 },
    background: {
      color: queryValues?.background?.color
        ? `${queryValues?.background?.color}${toHexStringFromOpacity(queryValues?.background?.opacity || 12)}`
        : '#0000001f',
      opacity: 100,
    },
  }

  const methods = useForm({
    mode: 'onChange',
    defaultValues,
  })

  const { control, reset, handleSubmit, formState, watch, setValue } = methods

  React.useEffect(() => {
    reset(defaultValues)
  }, [localeSelected])

  const id = watch('id')
  const geojson = watch('geojson')
  const background = watch('background')
  const border = watch('border')
  const titleOnMap = watch('titleOnMap')
  const displayedOnMap = watch('displayedOnMap')

  const district = {
    id,
    geojson,
    background,
    border,
    displayedOnMap,
    titleOnMap,
  }

  React.useEffect(() => {
    const geoJSON = formatGeoJsons([{ ...district, displayedOnMap: true }])
    if (!district.geojson || !geoJSON.length || !geoJSON[0].district) {
      setGeoJSONValid(false)
    } else {
      if (!isGeoJSONValid(geoJSON)) {
        setGeoJSONValid(false)
      } else {
        setGeoJSONValid(true)
      }
    }
  }, [district.geojson])

  return (
    <Flex direction="column">
      <form id="geographicalAreaForm">
        <Flex direction="column" bg="white" borderRadius="normal" p={6}>
          <Flex justify="space-between" alignItems="flex-start">
            <Heading as="h4" color="blue.800" fontWeight={600} mb={4}>
              {intl.formatMessage({ id: 'global.general' })}
            </Heading>
            {multilangue && (
              <Menu
                disclosure={
                  <Button variantColor="primary" variantSize="big" variant="tertiary" rightIcon={CapUIIcon.ArrowDownO}>
                    {localeSelected.label}
                  </Button>
                }
                onChange={setLocaleSelected}
                value={localeSelected}
              >
                <Menu.List>
                  {availableLocales.map(locale => (
                    <Menu.Item
                      key={locale?.code}
                      type="button"
                      value={{
                        label: intl.formatMessage({
                          id: locale?.traductionKey,
                        }),
                        value: formatCodeToLocale(locale?.code || ''),
                      }}
                    >
                      {intl.formatMessage({
                        id: locale?.traductionKey,
                      })}
                    </Menu.Item>
                  ))}
                </Menu.List>
              </Menu>
            )}
          </Flex>
          <Flex>
            <Box mr={8} width="50%">
              <FormControl name="name" control={control} isRequired>
                <FormLabel htmlFor="name" label={intl.formatMessage({ id: 'global.title' })} />
                <FieldInput
                  id="name"
                  name="name"
                  control={control}
                  type="text"
                  placeholder={intl.formatMessage({
                    id: 'city-neighbourhood-placeholder',
                  })}
                  minLength={2}
                  maxLength={255}
                />
              </FormControl>
              <FormProvider {...methods}>
                <TextEditor
                  name="description"
                  placeholder={intl.formatMessage({
                    id: 'city-neighbourhood-placeholder',
                  })}
                  label={intl.formatMessage({ id: 'global.description' })}
                  platformLanguage={defaultLocale?.code}
                  selectedLanguage={localeSelected.value}
                  limitChars={280}
                />
              </FormProvider>
              <FormControl name="cover" control={control}>
                <FormLabel label={intl.formatMessage({ id: 'cover-image' })}>
                  <Text fontSize={2} color="gray.500">
                    {intl.formatMessage({ id: 'global.optional' })}
                  </Text>
                </FormLabel>
                <FormGuideline>
                  {intl.formatMessage({ id: 'uploader.banner.format' }) +
                    ' jpg, png. ' +
                    intl.formatMessage({ id: 'uploader.banner.weight' }) +
                    ' 2mo.'}
                </FormGuideline>
                <FormGuideline>{intl.formatMessage({ id: 'featured-dimensions' }) + ' 1920x1080'}</FormGuideline>
                <FieldInput
                  type="uploader"
                  name="cover"
                  control={control}
                  format=".jpg,.jpeg,.png"
                  maxSize={2048000}
                  size={UPLOADER_SIZE.MD}
                  uploadURI={UPLOAD_PATH}
                  showThumbnail
                />
              </FormControl>
            </Box>
            <FormControl name="geojson" control={control} isInvalid={!geoJSONValid && geojson?.length}>
              <FormLabel htmlFor="geojson" label={intl.formatMessage({ id: 'geojson-code' })}>
                {' '}
                <Link target="_blank" href="https://aide.cap-collectif.com/article/286-le-code-geojson">
                  <Icon name={CapUIIcon.Info} size={CapUIIconSize.Sm} color="blue.500" />
                </Link>
              </FormLabel>
              <FieldInput
                id="geojson"
                name="geojson"
                control={control}
                type="textarea"
                rows={16}
                placeholder={intl.formatMessage({
                  id: 'paste-code-here',
                })}
                rules={{ validate: () => (geojson?.length ? geoJSONValid : true) }}
              />
            </FormControl>
          </Flex>
        </Flex>
        <Flex direction="column" bg="white" borderRadius="normal" p={6} mt={6}>
          <Flex justify="space-between" alignItems="flex-start">
            <Heading as="h4" color="blue.800" fontWeight={600} mb={displayedOnMap ? 4 : 0}>
              {intl.formatMessage({ id: 'display-area-on-map' })}
            </Heading>
            <Switch
              id="display-on-map"
              checked={displayedOnMap}
              onChange={() => setValue('displayedOnMap', !displayedOnMap)}
            />
          </Flex>
          {displayedOnMap ? (
            <Flex spacing={6}>
              <Flex direction="column" width="50%">
                <FormControl name="titleOnMap" control={control}>
                  <FormLabel htmlFor="titleOnMap" label={intl.formatMessage({ id: 'title-on-map' })} />
                  <FieldInput
                    id="titleOnMap"
                    name="titleOnMap"
                    control={control}
                    type="text"
                    required={displayedOnMap}
                    placeholder={intl.formatMessage({
                      id: 'admiun.project.create.title.placeholder',
                    })}
                    minLength={2}
                    maxLength={50}
                  />
                </FormControl>
                <Box position="relative" mb={4}>
                  <FormControl name="background.color" control={control} isRequired>
                    <FormLabel htmlFor="background.color" label={intl.formatMessage({ id: 'global.background' })} />
                    <FieldInput
                      id="background.color"
                      name="background.color"
                      control={control}
                      type="colorPicker"
                      withOpacity
                    />
                  </FormControl>
                </Box>
                <Box position="relative" mb={4}>
                  <FormControl name="border.color" control={control} isRequired position="relative">
                    <FormLabel htmlFor="border.color" label={intl.formatMessage({ id: 'global.border' })} />
                    <FieldInput id="border.color" name="border.color" control={control} type="colorPicker" />
                  </FormControl>
                </Box>
                <FormControl name="border.size" control={control} isRequired position="relative">
                  <FormLabel htmlFor="border.size" label={intl.formatMessage({ id: 'thickness' })} />
                  <FieldInput id="border.size" name="border.size" control={control} type="number" />
                </FormControl>
              </Flex>
              <React.Suspense fallback={<Spinner m="auto" />}>
                <GeographicalAreaMap district={district} />
              </React.Suspense>
            </Flex>
          ) : null}
        </Flex>
        <Flex spacing={6} mt={6}>
          <Button
            variant="primary"
            variantColor="primary"
            variantSize="big"
            disabled={!formState.isValid || !formState.isDirty || isLoading}
            loading={isLoading}
            onClick={e => {
              setIsLoading(true)
              handleSubmit((data: FormattedDistrict) =>
                onSubmit(data, intl, localeSelected?.value, setIsLoading, translations),
              )(e)
            }}
          >
            {intl.formatMessage({ id: queryValues ? 'global.save' : 'global.create' })}
          </Button>
          {queryValues ? (
            <>
              <GeographicalAreaDeleteModal show={isOpen} onClose={onClose} geographicalAreaId={id} fromDistrict />
              <Button type="button" variant="secondary" variantColor="danger" variantSize="big" onClick={onOpen}>
                {intl.formatMessage({
                  id: 'global.delete',
                })}
              </Button>
            </>
          ) : null}
          {!queryValues ? (
            <Button
              type="button"
              variant="secondary"
              variantColor="hierarchy"
              variantSize="big"
              as="a"
              href="/admin-next/geographicalAreas"
            >
              {intl.formatMessage({
                id: 'global.cancel',
              })}
            </Button>
          ) : null}
        </Flex>
      </form>
    </Flex>
  )
}

export default GeographicalAreaForm
