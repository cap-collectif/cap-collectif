import * as React from 'react'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import { FormattedMessage } from 'react-intl'
import { Button, Modal } from 'react-bootstrap'
import { createFragmentContainer, graphql } from 'react-relay'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { isValid } from '~/services/GeoJsonValidator'
import CloseButton from '~/components/Form/CloseButton'
import DistrictAdminFields from '~/components/District/DistrictAdminFields'
import LanguageButtonContainer from '~/components/LanguageButton/LanguageButtonContainer'
import { getTranslation, handleTranslationChange } from '~/services/Translation'
import type { District, GlobalState, Dispatch } from '~/types'
import CreateGlobalDistrictMutation from '~/mutations/CreateGlobalDistrictMutation'
import UpdateGlobalDistrictMutation from '~/mutations/UpdateGlobalDistrictMutation'
import type { GlobalDistrictForm_district } from '~relay/GlobalDistrictForm_district.graphql'

type Props = ReduxFormFormProps & {
  show: boolean
  member: string
  isCreating: boolean
  handleClose: () => void
  defaultLanguage: string
  district: GlobalDistrictForm_district
}
type FormValues = {
  globalDistrict: District
}

const validate = (values: FormValues) => {
  const errors: any = {
    globalDistrict: {},
  }

  if (!values.globalDistrict || !values.globalDistrict.name) {
    errors.globalDistrict.name = 'global.admin.required'
  }

  if (values.globalDistrict && values.globalDistrict.geojson && !isValid(values.globalDistrict.geojson)) {
    errors.globalDistrict.geojson = 'admin.fields.proposal.map.zone.geojson.invalid'
  }

  const borderEnable = values.globalDistrict && values.globalDistrict.border && values.globalDistrict.border.enabled

  if (borderEnable) {
    errors.globalDistrict.border = {}
  }

  if (borderEnable && !values.globalDistrict.border.size) {
    errors.globalDistrict.border.size = 'global.admin.required'
  }

  if (borderEnable && !values.globalDistrict.border.opacity) {
    errors.globalDistrict.border.opacity = 'global.admin.required'
  }

  if (borderEnable && !values.globalDistrict.border.color) {
    errors.globalDistrict.border.color = 'global.admin.required'
  }

  const backgroundEnable =
    values.globalDistrict && values.globalDistrict.background && values.globalDistrict.background.enabled

  if (backgroundEnable) {
    errors.globalDistrict.background = {}
  }

  if (backgroundEnable && !values.globalDistrict.background.opacity) {
    errors.globalDistrict.background.opacity = 'global.admin.required'
  }

  if (backgroundEnable && !values.globalDistrict.background.color) {
    errors.globalDistrict.background.color = 'global.admin.required'
  }

  return errors
}

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const translation = {
    name: values.globalDistrict.name,
    locale: props.defaultLanguage,
  }
  const input = {
    translations: handleTranslationChange(
      props.district ? props.district.translations : [],
      translation,
      props.defaultLanguage,
    ),
    geojson: values.globalDistrict.geojson,
    displayedOnMap: values.globalDistrict.displayedOnMap,
    border: {
      enabled: values.globalDistrict.border ? values.globalDistrict.border.enabled : null,
      color: values.globalDistrict.border ? values.globalDistrict.border.color : null,
      opacity: values.globalDistrict.border ? values.globalDistrict.border.opacity : null,
      size: values.globalDistrict.border ? values.globalDistrict.border.size : null,
    },
    background: {
      enabled: values.globalDistrict.background ? values.globalDistrict.background.enabled : null,
      color: values.globalDistrict.background ? values.globalDistrict.background.color : null,
      opacity: values.globalDistrict.background ? values.globalDistrict.background.opacity : null,
    },
  }

  if (Object.prototype.hasOwnProperty.call(values.globalDistrict, 'id')) {
    return UpdateGlobalDistrictMutation.commit({
      input: { ...input, id: values.globalDistrict.id },
    })
  }

  return CreateGlobalDistrictMutation.commit(
    {
      input,
    },
    props.defaultLanguage,
  )
}

const ModalHeaderContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
`
export class GlobalDistrictForm extends React.Component<Props> {
  handleOnSubmit = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const { handleSubmit, handleClose } = this.props
    handleSubmit()
    handleClose()
  }

  render() {
    const { member, show, isCreating, handleClose, pristine, submitting, district, invalid } = this.props
    return (
      <Modal show={show} onHide={handleClose} aria-labelledby="report-modal-title-lg" bsSize="large">
        <form onSubmit={this.handleOnSubmit}>
          <Modal.Header closeButton>
            <ModalHeaderContainer>
              <Modal.Title id="report-modal-title-lg">
                <FormattedMessage id={isCreating ? 'district_modal.create.title' : 'district_modal.update.title'} />
              </Modal.Title>
              <span className="mr-5">
                <LanguageButtonContainer />
              </span>
            </ModalHeaderContainer>
          </Modal.Header>
          <Modal.Body>
            <DistrictAdminFields
              formName="proposal-form-admin-configuration"
              member={member}
              district={district}
              enableDesignFields={false}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={handleClose} />
            <Button type="submit" id="js-sumbit-button" bsStyle="primary" disabled={pristine || invalid || submitting}>
              <FormattedMessage id={submitting ? 'global.loading' : 'global.validate'} />
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    )
  }
}
const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: 'globalDistrictForm',
})(GlobalDistrictForm)

const mapStateToProps = (state: GlobalState, props: Props) => {
  if (!props.district) {
    return {
      defaultLanguage: state.language.currentLanguage,
    }
  }

  const { district } = props
  const translation = getTranslation(district.translations, state.language.currentLanguage)
  return {
    defaultLanguage: state.language.currentLanguage,
    initialValues: {
      globalDistrict: { ...district, name: translation ? translation.name : null },
    },
  }
}

export // @ts-ignore
const container = connect<any, any>(mapStateToProps)(form)
export default createFragmentContainer(container, {
  district: graphql`
    fragment GlobalDistrictForm_district on GlobalDistrict {
      ...DistrictAdminFields_district
      id
      name
      geojson
      displayedOnMap
      border {
        enabled
        color
        opacity
        size
      }
      background {
        enabled
        color
        opacity
      }
      translations {
        name
        locale
      }
    }
  `,
})
