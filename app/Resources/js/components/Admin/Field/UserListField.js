// @flow
import * as React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import { Field } from 'redux-form';
import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';

type Props = {
  id: ?string,
  name: string,
  label: string,
  labelClassName: ?string,
  inputClassName: ?string,
  placeholder: ?string,
  userListToNoSearch?: ?Array<string>,
};

export default class UserListField extends React.Component<Props, State> {
  static defaultProps = {
    className: '',
  };

  render() {
    const getUsersList = graphql`
      query UserListFieldQuery($displayName: String) {
        userSearch(displayName: $displayName) {
          id
          displayName
        }
      }
    `;

    const getUsersListWithoutIds = graphql`
      query UserListFieldQuery($notInIds: [String], $displayName: String) {
        userSearch(notInIds: $notInIds, displayName: $displayName) {
          id
          displayName
        }
      }
    `;

    const {
      id,
      name,
      label,
      labelClassName,
      inputClassName,
      placeholder,
      userListToNoSearch,
    } = this.props;

    const retrieveUsersList = (usersIds: ?Array<string>, terms: ?string) => {
      if (usersIds) {
        return fetchQuery(environment, getUsersListWithoutIds, {
          notInIds: usersIds,
          displayName: terms,
        }).then(data => ({
          options: data.userSearch.map(u => ({
            value: u.id,
            label: u.displayName,
          })),
        }));
      }

      return fetchQuery(environment, getUsersList, {
        displayName: terms,
      }).then(data => ({
        options: data.userSearch.map(u => ({
          value: u.id,
          label: u.displayName,
        })),
      }));
    };

    return (
      <Field
        name={name}
        id={id}
        label={label}
        labelClassName={labelClassName}
        inputClassName={inputClassName}
        placeholder={placeholder}
        multi
        component={select}
        clearable={false}
        loadOptions={terms => retrieveUsersList(userListToNoSearch, terms)}
      />
    );
  }
}
