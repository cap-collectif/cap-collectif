import * as React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import { UserListFieldQuery, UserListFieldQueryResponse } from '@relay/UserListFieldQuery.graphql';
import { UserListFieldNotInIdsQuery } from '@relay/UserListFieldNotInIdsQuery.graphql';
import { environment } from 'utils/relay-environement';
import { FieldInput, FieldInputProps } from './FieldInput';

interface UserListFieldProps extends FieldInputProps {
    ariaControls?: string;
    userListToNoSearch?: Array<string>;
    autoload?: boolean;
    authorOfEvent?: boolean;
}

const getUsersList = graphql`
    query UserListFieldQuery($displayName: String, $authorOfEventOnly: Boolean) {
        userSearch(displayName: $displayName, authorsOfEventOnly: $authorOfEventOnly) {
            id
            displayName
            email
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
            email
        }
    }
`;

const formatUsersData = (users: UserListFieldQueryResponse['userSearch']) => {
    const duplicateNames: { [key: string]: [number] } = {};

    if (!users) return [];

    users.forEach((user, index) => {
        if (user) {
            const { displayName } = user;
            if (duplicateNames[displayName]) {
                duplicateNames[displayName].push(index);
            } else {
                duplicateNames[displayName] = [index];
            }
        }
    });

    return users.map(user => {
        if (user) {
            const { id, displayName, email } = user;
            let label = displayName;
            if (duplicateNames[displayName] && duplicateNames[displayName].length > 1) {
                label = `${displayName} - ${email}`;
            }
            return {
                value: id,
                label,
            };
        }
    });
};

export const UserListField: React.FC<UserListFieldProps> = ({
    id,
    name,
    label,
    clearable,
    placeholder,
    ariaControls,
    ...props
}) => {
    const loadOptions = (search: string) => {
        const { userListToNoSearch, authorOfEvent } = props;
        const retrieveUsersList = (usersIds: null | Array<string>, terms: null | string) => {
            if (usersIds) {
                return fetchQuery<UserListFieldNotInIdsQuery>(environment, getUsersListWithoutIds, {
                    notInIds: usersIds,
                    displayName: terms,
                    authorOfEventOnly: authorOfEvent || false,
                })
                    .toPromise()
                    .then(data => formatUsersData(data?.userSearch || null));
            }

            return fetchQuery<UserListFieldQuery>(environment, getUsersList, {
                displayName: terms,
                authorOfEventOnly: authorOfEvent || false,
            })
                .toPromise()
                .then(data => formatUsersData(data?.userSearch || null));
        };

        return retrieveUsersList(userListToNoSearch || null, search);
    };

    return (
        <FieldInput
            name={name}
            id={id}
            type="select"
            label={label}
            placeholder={placeholder}
            aria-controls={ariaControls}
            aria-autocomplete="list"
            aria-haspopup="true"
            role="combobox"
            clearable={clearable}
            loadOptions={loadOptions}
            {...props}
        />
    );
};

export default UserListField;
