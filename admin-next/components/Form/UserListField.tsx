import * as React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import type {
    UserListFieldQuery,
    UserListFieldQueryResponse,
} from '@relay/UserListFieldQuery.graphql';
import { environment } from 'utils/relay-environement';
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form';

interface UserListFieldProps
    extends Omit<BaseField, 'onChange'>,
        Omit<FieldSelect, 'type' | 'onChange'> {
    userIdsToNoSearch?: string[];
    authorOfEvent?: boolean;
}

type UserListFieldValue = {
    label: string;
    value: string;
};

const getUserList = graphql`
    query UserListFieldQuery(
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
    userIdsToNoSearch = [],
    authorOfEvent = false,
    name,
    control,
    ...props
}) => {
    const loadOptions = async (search: string): Promise<UserListFieldValue[]> => {
        const usersData = await fetchQuery<UserListFieldQuery>(environment, getUserList, {
            notInIds: userIdsToNoSearch,
            displayName: search,
            authorOfEventOnly: authorOfEvent,
        }).toPromise();

        if (usersData && usersData.userSearch) {
            return formatUsersData(usersData.userSearch) as UserListFieldValue[];
        }

        return [];
    };

    return (
        <FieldInput
            {...props}
            type="select"
            control={control}
            name={name}
            defaultOptions
            loadOptions={loadOptions}
        />
    );
};

export default UserListField;
