import * as React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import type {
    DistrictListFieldQuery,
    DistrictListFieldQueryResponse,
} from '@relay/DistrictListFieldQuery.graphql';
import { environment } from 'utils/relay-environement';
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form';
import { useFormContext } from 'react-hook-form';

interface DistrictListFieldProps
    extends Omit<BaseField, 'onChange' | 'control'>,
        Omit<FieldSelect, 'type'> {}

type DistrictListFieldValue = {
    label: string,
    value: string,
};

const getDistrictList = graphql`
    query DistrictListFieldQuery($term: String) {
        projectDistricts(name: $term) {
            edges {
                node {
                    value: id
                    label: name
                }
            }
        }
    }
`;

const formatDistrictsData = (
    projectDistricts: DistrictListFieldQueryResponse['projectDistricts'],
) => {
    if (!projectDistricts) return [];
    return (
        projectDistricts.edges
            ?.map(edge => edge?.node)
            ?.map(d => ({ value: d?.value ?? '', label: d?.label ?? '' })) || []
    );
};

export const DistrictListField: React.FC<DistrictListFieldProps> = ({ name, ...props }) => {
    const { control } = useFormContext();
    const loadOptions = async (term: string): Promise<DistrictListFieldValue[]> => {
        const districtsData = await fetchQuery<DistrictListFieldQuery>(
            environment,
            getDistrictList,
            {
                term,
            },
        ).toPromise();

        if (districtsData && districtsData.projectDistricts) {
            return (formatDistrictsData(districtsData.projectDistricts) as DistrictListFieldValue[]);
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

export default DistrictListField;
