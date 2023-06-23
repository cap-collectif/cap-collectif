import * as React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import type {
    GroupListFieldQuery,
    GroupListFieldQueryResponse,
} from '@relay/GroupListFieldQuery.graphql';
import { environment } from 'utils/relay-environement';
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form';

interface GroupListFieldProps extends Omit<BaseField, 'onChange'>, Omit<FieldSelect, 'type'> {}

type GroupListFieldValue = {
    label: string,
    value: string,
};

const getGroupList = graphql`
  query GroupListFieldQuery($term: String) {
    groups(term: $term) {
      edges {
        node {
            value: id
            label: title
        }
      }
    }
  }
`;

const formatGroupsData = (groups: GroupListFieldQueryResponse['groups']) => {
    if (!groups) return [];
    return groups.edges
    ?.map(edge => edge?.node)
    ?.map(d => ({ value: d?.value ?? '', label: d?.label ?? '' })) || [];
};

export const GroupListField: React.FC<GroupListFieldProps> = ({
    name,
    control,
    ...props
}) => {
    const loadOptions = async (term: string): Promise<GroupListFieldValue[]> => {
        const groupsData = await fetchQuery<GroupListFieldQuery>(environment, getGroupList, {
            term
        }).toPromise();

        if (groupsData && groupsData.groups) {
            return (formatGroupsData(groupsData.groups) as GroupListFieldValue[]);
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

export default GroupListField;
