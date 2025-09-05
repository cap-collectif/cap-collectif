import React from 'react'
import { connect } from 'react-redux'
import { reduxForm, Field, change, formValueSelector } from 'redux-form'
import { createFragmentContainer, graphql } from 'react-relay'
import type { IntlShape } from 'react-intl'
import L from 'leaflet'
import { Marker, ZoomControl, MapContainer as Map } from 'react-leaflet'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { GestureHandling } from 'leaflet-gesture-handling'
import * as S from './HomePageProjectsSectionConfigurationPage.style'
import renderComponent from '~/components/Form/Field'
import type { Dispatch, GlobalState } from '~/types'
import Button from '~ds/Button/Button'
import UpdateHomePageProjectsMapSectionConfigurationMutation from '~/mutations/UpdateHomePageProjectsMapSectionConfigurationMutation'
import Flex from '~ui/Primitives/Layout/Flex'
import { toast } from '~ds/Toast'
import { handleTranslationChange, formatLocaleToCode } from '~/services/Translation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import Text from '~ui/Primitives/Text'
import type { HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration } from '~relay/HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration.graphql'
import InfoMessage from '~ds/InfoMessage/InfoMessage'
import { MapContainer } from '~/components/ProposalForm/Section/SectionDisplayMode/SectionDisplayMode.style'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
import type { MapProps, MapCenterObject } from '~/components/Proposal/Map/Map.types'
import {
  LOCATION_PARIS,
  ZOOM_CITY,
  zoomLevels,
} from '~/components/ProposalForm/Section/SectionDisplayMode/SectionDisplayMode'
import AppBox from '~/components/Ui/Primitives/AppBox'
import Address from '~/components/Form/Address/Address'
import { flyToPosition } from '~/components/Proposal/Create/ProposalChangeAddressModal'
import type { AddressComplete } from '~/components/Form/Address/Address.type'
import { normalizeNumberInput } from '~/components/Form/utils'
const formName = 'section-proposal-admin-form'
type Props = ReduxFormFormProps & {
  readonly homePageProjectsMapSectionConfiguration: HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration
  readonly hasDistrict: boolean
  readonly currentLanguage: string
  readonly intl: IntlShape
  readonly centerLatitude: number | null | undefined
  readonly centerLongitude: number | null | undefined
  readonly zoomMap: number | null | undefined
}
type FormValues = {
  readonly enabled: string
  readonly position: string
  readonly teaser: string | null | undefined
  readonly title: string
  readonly centerLatitude: number
  readonly centerLongitude: number
  readonly zoomMap: number
}
const TEASER_MAX = 200

const asyncValidate = (values: FormValues) => {
  return new Promise((resolve, reject) => {
    if (values?.teaser && values.teaser.length > TEASER_MAX) {
      const error: any = {}
      error.teaser = {
        id: 'characters-maximum',
        values: {
          quantity: TEASER_MAX,
        },
      }
      return reject(error)
    }

    if (values.title.trim() === '') {
      const error: any = {
        title: {
          id: 'error.fill.title',
        },
      }
      return reject(error)
    }

    return resolve()
  })
}

const onSubmit = async (values: FormValues, dispatch: Dispatch, { currentLanguage, intl }: Props) => {
  const { title, teaser, position, centerLatitude, centerLongitude, zoomMap } = values
  const translationsData = handleTranslationChange(
    [],
    {
      locale: formatLocaleToCode(currentLanguage),
      title,
      teaser,
    },
    currentLanguage,
  )
  const input = {
    position: parseInt(position, 10),
    enabled: values.enabled === 'published',
    translations: translationsData,
    centerLatitude,
    centerLongitude,
    zoomMap,
  }

  try {
    const { updateHomePageProjectsMapSectionConfiguration } =
      await UpdateHomePageProjectsMapSectionConfigurationMutation.commit({
        input,
      })
    const errorCode = updateHomePageProjectsMapSectionConfiguration?.errorCode

    if (errorCode === 'INVALID_FORM') {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({
          id: 'global.error.server.form',
        }),
      })
      return
    }

    toast({
      variant: 'success',
      content: intl.formatHTMLMessage({
        id: 'all.data.saved',
      }),
    })
  } catch (e) {
    mutationErrorToast(intl)
  }
}

export const HomePageProjectsMapSectionConfigurationPage = ({
  handleSubmit,
  intl,
  submitting,
  hasDistrict,
  dispatch,
  centerLatitude,
  centerLongitude,
  zoomMap,
  homePageProjectsMapSectionConfiguration,
}: Props) => {
  const [address, setAddress] = React.useState(null)
  const position = [
    centerLatitude || homePageProjectsMapSectionConfiguration.centerLatitude || LOCATION_PARIS.lat,
    centerLongitude || homePageProjectsMapSectionConfiguration.centerLongitude || LOCATION_PARIS.lng,
  ]
  const refMap = React.useRef(null)
  React.useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)

    if (refMap.current) {
      refMap.current.setZoom(zoomMap)
    }
  }, [zoomMap, refMap])
  return (
    <form method="POST" onSubmit={handleSubmit}>
      <S.SectionContainer>
        <h1>
          {intl.formatMessage({
            id: 'global.general',
          })}
        </h1>
        <S.SectionInner>
          <Field
            type="text"
            name="title"
            id="title"
            placeholder="global.participative.project"
            label={intl.formatMessage({
              id: 'global.title',
            })}
            component={renderComponent}
          />
          <Field
            type="textarea"
            name="teaser"
            id="teaser"
            placeholder="find-projects-next-to-you"
            label={
              <Flex>
                <Text>
                  {intl.formatMessage({
                    id: 'admin.fields.project.teaser',
                  })}
                </Text>
                <Text ml={2} color="gray.500">
                  {intl.formatMessage({
                    id: 'global.optional',
                  })}
                </Text>
              </Flex>
            }
            component={renderComponent}
          />
          <Field
            type="number"
            normalize={normalizeNumberInput}
            name="position"
            id="position"
            label={intl.formatMessage({
              id: 'section-admin-display-order',
            })}
            component={renderComponent}
            min={0}
          />
          <div>
            <AppBox mb={2}>
              {intl.formatMessage({
                id: 'initial-position-of-the-map',
              })}
            </AppBox>
            <MapContainer>
              <AppBox position="absolute" zIndex={1} top={2} left={2} width="45%">
                <Address
                  id="address"
                  getPosition={(lat, lng) => {
                    flyToPosition(refMap, lat, lng)
                    dispatch(change(formName, 'centerLatitude', lat))
                    dispatch(change(formName, 'centerLongitude', lng))
                  }}
                  getAddress={(addr: AddressComplete | null | undefined) => {
                    if (addr) {
                      flyToPosition(refMap, addr.geometry.location.lat, addr.geometry.location.lng)
                      dispatch(change(formName, 'centerLatitude', addr.geometry.location.lat))
                      dispatch(change(formName, 'centerLongitude', addr.geometry.location.lng))
                    }
                  }}
                  debounce={1200}
                  value={address}
                  onChange={setAddress}
                  placeholder={intl.formatMessage({
                    id: 'proposal.map.form.placeholder',
                  })}
                />
              </AppBox>
              <Map
                whenCreated={(map: MapProps) => {
                  refMap.current = map
                  map.on(
                    'click',
                    (
                      e:
                        | ((Event | null | undefined) & {
                            latlng: MapCenterObject
                          })
                        | null
                        | undefined,
                    ) => {
                      dispatch(change(formName, 'centerLatitude', e?.latlng.lat))
                      dispatch(change(formName, 'centerLongitude', e?.latlng.lng))
                    },
                  )
                }}
                className="map"
                center={position}
                zoom={zoomMap || zoomLevels[ZOOM_CITY].id}
                zoomControl={false}
                doubleClickZoom={false}
                gestureHandling
              >
                <CapcoTileLayer />
                <ZoomControl position="bottomright" />
                <Marker
                  position={position}
                  icon={L.icon({
                    iconUrl: '/svg/marker.svg',
                    iconSize: [30, 30],
                    iconAnchor: [20, 40],
                  })}
                />
              </Map>
              <div className="fields">
                <Field
                  type="text"
                  name="centerLatitude"
                  id="centerLatitude"
                  component={renderComponent}
                  label={intl.formatMessage({
                    id: 'admin.fields.proposal_form.latitude',
                  })}
                />
                <Field
                  type="text"
                  name="centerLongitude"
                  id="centerLongitude"
                  component={renderComponent}
                  label={intl.formatMessage({
                    id: 'admin.fields.proposal_form.longitude',
                  })}
                />
                <Field
                  type="select"
                  name="zoomMap"
                  id="zoom"
                  component={renderComponent}
                  normalize={val => parseInt(val, 10)}
                  label={intl.formatMessage({
                    id: 'admin.fields.proposal_form.zoom',
                  })}
                >
                  {zoomLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {`${level.id} ${
                        level.name
                          ? `- ${intl.formatMessage({
                              id: level.name,
                            })}`
                          : ''
                      }`}
                    </option>
                  ))}
                </Field>
              </div>
            </MapContainer>
          </div>
        </S.SectionInner>
      </S.SectionContainer>

      <S.SectionContainer>
        <h1>
          {intl.formatMessage({
            id: 'global.publication',
          })}
        </h1>

        <div>
          <Field
            type="radio"
            name="enabled"
            id="section-is-not-published"
            component={renderComponent}
            value="unpublished"
          >
            <span>
              {intl.formatMessage({
                id: 'post_is_not_public',
              })}
            </span>
          </Field>

          <Field type="radio" name="enabled" id="section-is-published" component={renderComponent} value="published">
            <span>
              {intl.formatMessage({
                id: 'admin.fields.section.enabled',
              })}
            </span>
          </Field>
        </div>
        {!hasDistrict && (
          <InfoMessage variant="info" width="fit-content">
            <InfoMessage.Title>Information</InfoMessage.Title>
            <InfoMessage.Content>
              <FormattedHTMLMessage
                id="create-district-link"
                values={{
                  url: '/admin-next/geographical-areas',
                }}
              />
            </InfoMessage.Content>
          </InfoMessage>
        )}
      </S.SectionContainer>

      <Button variant="primary" variantSize="big" type="submit" isLoading={submitting}>
        {intl.formatMessage({
          id: 'global.save',
        })}
      </Button>
    </form>
  )
}

const mapStateToProps = (state: GlobalState, { homePageProjectsMapSectionConfiguration }: Props) => {
  if (homePageProjectsMapSectionConfiguration) {
    const { title, teaser, position, enabled, centerLatitude, centerLongitude, zoomMap } =
      homePageProjectsMapSectionConfiguration
    const initialValues = {
      title,
      teaser,
      position,
      centerLatitude,
      centerLongitude,
      zoomMap,
      enabled: enabled === true ? 'published' : 'unpublished',
    }
    return {
      initialValues,
      currentLanguage: state.language.currentLanguage,
      centerLatitude: formValueSelector(formName)(state, 'centerLatitude'),
      centerLongitude: formValueSelector(formName)(state, 'centerLongitude'),
      zoomMap: formValueSelector(formName)(state, 'zoomMap'),
    }
  }
}

const form = injectIntl(
  reduxForm({
    form: formName,
    onSubmit,
    asyncValidate,
    asyncChangeFields: ['teaser', 'title'],
  })(HomePageProjectsMapSectionConfigurationPage),
)
const HomePageProjectsMapSectionConfigurationPageConnected = connect(mapStateToProps)(form)
const fragmentContainer = createFragmentContainer(HomePageProjectsMapSectionConfigurationPageConnected, {
  homePageProjectsMapSectionConfiguration: graphql`
    fragment HomePageProjectsMapSectionConfigurationPage_homePageProjectsMapSectionConfiguration on HomePageProjectsMapSectionConfiguration {
      title
      position
      teaser
      enabled
      centerLatitude
      centerLongitude
      zoomMap
    }
  `,
})
export default fragmentContainer
