import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import AlertBoxApp from '~/startup/AlertBoxApp'
import LocaleAdminContainer from './LocaleAdminContainer'

const LocaleAdminPage = () => (
  <div className="box box-primary container-fluid">
    <AlertBoxApp />
    <div className="box-header">
      <h3
        className="box-title font-weight-bold"
        style={{
          marginBottom: 0,
        }}
      >
        <FormattedMessage id="global-languages" />
      </h3>
    </div>
    <div className="box-content">
      <p className="mb-15 mt-0">
        <FormattedMessage id="multi-language-help-text" />
      </p>
      <LocaleAdminContainer />
    </div>
  </div>
)

export default LocaleAdminPage
