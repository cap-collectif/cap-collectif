// @flow
import * as React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import { Field } from 'redux-form';
import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';

type Props = {
  id: ?string,
  name: string,
  label?: React$Element<*>,
  labelClassName: ?string,
  inputClassName: ?string,
  placeholder: ?string,
  ariaControls: ?string,
  userListToNoSearch?: ?Array<string>,
  disabled?: boolean,
  selectFieldIsObject?: boolean,
  multi?: boolean,
  autoload: boolean,
  debounce: boolean,
  authorOfEvent: boolean,
  clearable: boolean,
};

const getUsersList = graphql`
  query UserListFieldQuery($displayName: String, $authorOfEventOnly: Boolean) {
    userSearch(displayName: $displayName, authorsOfEventOnly: $authorOfEventOnly) {
      id
      displayName
    }
  }
`;

const getUsersListWithoutIds = graphql`
  query UserListFieldNotInIdsQuery(
    $notInIds: [String]
    $displayName: String
    $authorOfEventOnly: Boolean
  ) {
    userSearch(
      notInIds: $notInIds
      displayName: $displayName
      authorsOfEventOnly: $authorOfEventOnly
    ) {
      id
      displayName
    }
  }
`;

export default class UserListField extends React.Component<Props> {
  static defaultProps = {
    className: '',
    authorOfEvent: false,
    multi: false,
    debounce: false,
  };

  loadOptions = (search: string) => {
    const { userListToNoSearch, authorOfEvent } = this.props;
    const retrieveUsersList = (usersIds: ?Array<string>, terms: ?string) => {
      if (usersIds) {
        return fetchQuery(environment, getUsersListWithoutIds, {
          notInIds: usersIds,
          displayName: terms,
          authorOfEventOnly: authorOfEvent,
        }).then(data =>
          data.userSearch.map(u => ({
            value: u.id,
            label: u.displayName,
          })),
        );
      }

      return fetchQuery(environment, getUsersList, {
        displayName: terms,
        authorOfEventOnly: authorOfEvent,
      }).then(data =>
        data.userSearch.map(u => ({
          value: u.id,
          label: u.displayName,
        })),
      );
    };

    return retrieveUsersList(userListToNoSearch, search);
  };

  render() {
    const {
      id,
      name,
      label,
      labelClassName,
      inputClassName,
      clearable,
      autoload,
      placeholder,
      ariaControls,
      disabled,
      selectFieldIsObject,
      debounce,
      multi,
    } = this.props;

    return (
      <Field
        name={name}
        id={id}
        label={label}
        labelClassName={labelClassName}
        inputClassName={inputClassName}
        placeholder={placeholder}
        aria-controls={ariaControls}
        multi={multi}
        aria-autocomplete="list"
        aria-haspopup="true"
        role="combobox"
        debounce={debounce}
        autoload={autoload}
        disabled={disabled}
        selectFieldIsObject={selectFieldIsObject}
        component={select}
        clearable={clearable}
        loadOptions={this.loadOptions}
      />
    );
  }
}
