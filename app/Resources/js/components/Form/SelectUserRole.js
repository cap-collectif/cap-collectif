// @flow
import React, { Component } from 'react';
import { connect, type MapStateToProps, type Connector } from 'react-redux';
import { Field } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type { GlobalState } from '../../types';
import component from './Field';

type Props = {
  isSuperAdmin: boolean,
  id: string,
  name: string,
  label: string,
};

export class SelectUserRole extends Component<Props & { intl: IntlShape }> {
  render() {
    const { isSuperAdmin, intl, id, name, label } = this.props;

    const superAdminRole = {
      id: 'ROLE_SUPER_ADMIN',
      useIdAsValue: true,
      label: intl.formatMessage({ id: 'roles.super_admin' }),
    };
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

    if (isSuperAdmin) {
      userRoles.push(superAdminRole);
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

type ParentProps = {
  id: string,
  name: string,
  label: string,
};

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
});

const connector: Connector<ParentProps, Props> = connect(mapStateToProps);

export default connector(injectIntl(SelectUserRole));
