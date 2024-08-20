import * as React from 'react'
import { Field, formValueSelector } from 'redux-form'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import component from '~/components/Form/Field'
import toggle from '~/components/Form/Toggle'
import PanelBorderStyle from './Fields/PanelBorderStyle'
import PanelBackgroundStyle from './Fields/PanelBackgroundStyle'
import type { DistrictAdminFields_district } from '~relay/DistrictAdminFields_district.graphql'
import { isValid } from '~/services/GeoJsonValidator'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'
import type { State, Dispatch } from '~/types'

type Props = {
  member: string
  // Also District of ProposalFormAdminDistrictModal but flow…
  district: DistrictAdminFields_district | null | undefined
  enableDesignFields: boolean
  onChange?: (...args: Array<any>) => any
  isDisplayedOnMap?: boolean
  dispatch?: Dispatch
  formName: string
}

const isBorderEnable = district => district && district.border && district.border.enabled

const isBackgroundEnable = district => district && district.background && district.background.enabled

const validateGeoJSON = (geoJSON: string): string | null | undefined => {
  if (geoJSON) {
    try {
      const decoded = JSON.parse(geoJSON)

      if (!isValid(decoded)) {
        return 'admin.fields.proposal.map.zone.geojson.invalid'
      }
    } catch (e) {
      return 'admin.fields.proposal.map.zone.geojson.invalid'
    }
  }

  return undefined
}

export const DistrictAdminFields = ({
  member,
  district,
  enableDesignFields,
  onChange,
  isDisplayedOnMap,
  dispatch,
  formName,
}: Props) => (
  <>
    <Field
      label={<FormattedMessage id="admin.fields.sub-section.title" />}
      id={`${member}.name`}
      name={`${member}.name`}
      type="text"
      component={component}
    />
    {enableDesignFields && (
      <>
        <Field
          label={
            <div>
              <FormattedMessage id="admin.fields.proposal.map.zone" />
              <div className="excerpt inline">
                <FormattedMessage id="format.GeoJSON" />
                <a
                  href="https://aide.cap-collectif.com/article/205-budget-participatif-creer-un-formulaire-de-depot-de-propositions#zones"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="ml-5"
                >
                  <Icon name={ICON_NAME.information} size={12} color={colors.iconGrayColor} />
                </a>
              </div>
            </div>
          }
          id={`${member}.geojson`}
          name={`${member}.geojson`}
          type="textarea"
          component={component}
          validate={validateGeoJSON}
          onChange={onChange ? onChange.bind(this) : undefined}
        />

        <Field
          label={<FormattedMessage id="display.on.map" />}
          id={`${member}.displayedOnMap`}
          name={`${member}.displayedOnMap`}
          normalize={val => !!val}
          component={toggle}
        />

        {isDisplayedOnMap && (
          <div>
            <FormattedMessage id="styles" tagName="h4" />
            <PanelBorderStyle
              formName={formName}
              member={member}
              isEnabled={!!isBorderEnable(district)}
              dispatch={dispatch}
            />
            <PanelBackgroundStyle
              formName={formName}
              member={member}
              isEnabled={!!isBackgroundEnable(district)}
              dispatch={dispatch}
            />
          </div>
        )}
      </>
    )}
  </>
)

const mapStateToProps = (state: State, { member, formName }: Props) => {
  const selector = formValueSelector(formName)
  return {
    isDisplayedOnMap: selector(state, `${member}.displayedOnMap`),
  }
}

/* /!\ Care, This component is used as fragment, connect component and default functional component, sad story */
export const DistrictAdminFieldsConnected = connect(mapStateToProps)(DistrictAdminFields)
export default createFragmentContainer(DistrictAdminFields, {
  district: graphql`
    fragment DistrictAdminFields_district on District {
      border {
        enabled
      }
      background {
        enabled
      }
    }
  `,
})
