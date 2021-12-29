// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type { GlobalState } from '../../types';
import component from './Field';

type OwnProps = {|
  id: string,
  name: string,
  label: string,
|};

type Props = {|
  ...OwnProps,
  isSuperAdmin: boolean,
  hasProjectAdminFeature: boolean,
  intl: IntlShape,
|};

export class SelectUserRole extends Component<Props> {
  render() {
    const { isSuperAdmin, hasProjectAdminFeature, intl, id, name, label } = this.props;
    const userRoles = [
      {
        id: 'ROLE_USER',
        useIdAsValue: true,
        label: intl.formatMessage({ id: 'roles.user' }),
      },
      {
        id: 'ROLE_ADMIN',
        useIdAsValue: true,
        label: intl.formatMessage({ id: 'roles.admin' }),
      },
    ];

    if (hasProjectAdminFeature) {
      userRoles.push({
        id: 'ROLE_PROJECT_ADMIN',
        useIdAsValue: true,
        label: intl.formatMessage({ id: 'roles.project_admin' }),
      });
    }
    if (isSuperAdmin) {
      userRoles.push({
        id: 'ROLE_SUPER_ADMIN',
        useIdAsValue: true,
        label: intl.formatMessage({ id: 'roles.super_admin' }),
      });
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
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
  hasProjectAdminFeature: state.default.features.unstable__project_admin ?? false,
});

const connector = connect<any, any, _, _, _, _>(mapStateToProps);

export default connector(injectIntl(SelectUserRole));
