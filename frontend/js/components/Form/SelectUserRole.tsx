import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import type { GlobalState } from '../../types'
import component from './Field'

type OwnProps = {
  id: string
  name: string
  label: string
}
type Props = OwnProps & {
  isSuperAdmin: boolean
  hasShieldAuthorizationControls: boolean
  hasProjectAdminFeature: boolean
  intl: IntlShape
}
export class SelectUserRole extends Component<Props> {
  render() {
    const { isSuperAdmin, hasShieldAuthorizationControls, hasProjectAdminFeature, intl, id, name, label } = this.props
    const userRoles = [
      ...(hasShieldAuthorizationControls
        ? [
            {
              id: 'ROLE_SHIELD_AUTHORIZED_USER',
              useIdAsValue: true,
              label: intl.formatMessage({
                id: 'roles.shield_authorized_user',
              }),
              description: intl.formatMessage({ id: 'roles.shield_authorized_user_help' }),
            },
          ]
        : []),
      {
        id: 'ROLE_USER',
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'roles.user',
        }),
      },
      {
        id: 'ROLE_ADMIN',
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'roles.admin',
        }),
      },
    ]

    if (hasProjectAdminFeature) {
      userRoles.push({
        id: 'ROLE_PROJECT_ADMIN',
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'roles.project_admin',
        }),
      })
    }

    if (isSuperAdmin) {
      userRoles.push({
        id: 'ROLE_SUPER_ADMIN',
        useIdAsValue: true,
        label: intl.formatMessage({
          id: 'roles.super_admin',
        }),
      })
    }

    return (
      <Field
        id={id}
        name={name}
        component={component}
        type="checkbox"
        label={<FormattedMessage id={label} />}
        choices={userRoles}
      />
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
  hasShieldAuthorizationControls: state.default.features.shield_authorization_controls ?? false,
  hasProjectAdminFeature: state.default.features.project_admin ?? false,
})

const connector = connect(mapStateToProps)
export default connector(injectIntl(SelectUserRole))
