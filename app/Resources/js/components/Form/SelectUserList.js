// @flow
import React from 'react';
import { Field } from 'redux-form';
import { fetchQuery, graphql } from 'react-relay';
import select from './Select';
import environment from '../../createRelayEnvironment';

const userListQuery = graphql`
  query SelectUserListQuery($notInIds: [String], $displayName: String) {
    userSearch(notInIds: $notInIds, displayName: $displayName) {
      id
      displayName
    }
  }
`;

type Props = {|
  fieldName: string,
  name?: string,
  multi: boolean,
  autoload: boolean,
  id: string,
  clearable: boolean,
  disabled: boolean,
  label: any,
  userList: ?any,
|};

export class SelectUserList extends React.Component<Props> {
  static defaultProps = {
    userList: [],
    multi: false,
    autoload: false,
    fieldName: 'selectUser',
  };

  render() {
    const { fieldName, multi, id, clearable, disabled, label, userList } = this.props;

    const retrieveUsersList = (usersIds: ?Array<?string>, terms: ?string) =>
      fetchQuery(environment, userListQuery, {
        notInIds: usersIds,
        displayName: terms,
      }).then(data => ({
        options: data.userSearch.map(u => ({
          value: u.id,
          label: u.displayName,
        })),
      }));

    return (
      <Field
        name={fieldName}
        label={label}
        id={id}
        disabled={disabled}
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        component={select}
        clearable={clearable}
        multi={multi}
        autoload
        loadOptions={terms => retrieveUsersList(userList, terms)}
      />
    );
  }
}

export default SelectUserList;
