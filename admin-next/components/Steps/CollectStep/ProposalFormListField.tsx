import * as React from 'react';
import {fetchQuery, graphql, useFragment} from 'react-relay';
import { environment } from '@utils/relay-environement';
import {
    ProposalFormListFieldQuery,
    ProposalFormListFieldQuery$data,
} from '@relay/ProposalFormListFieldQuery.graphql';
import { FormLabel } from '@cap-collectif/ui';
import {useFormContext} from 'react-hook-form';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useIntl } from 'react-intl';
import {
    ProposalFormListField_proposalForm$key
} from "../../../__generated__/ProposalFormListField_proposalForm.graphql";
import {ProposalFormListField_query$key} from "../../../__generated__/ProposalFormListField_query.graphql";

type ProposalFormListFieldValue = {
    label: string,
    value: string,
};
export interface ProposalFormListFieldProps {
    proposalForm: ProposalFormListField_proposalForm$key,
    query: ProposalFormListField_query$key
}
const PROPOSAL_FORMS_QUERY = graphql`
    query ProposalFormListFieldQuery($query: String, $affiliations: [ProposalFormAffiliation!]) {
        viewer {
            proposalForms(query: $query, affiliations: $affiliations) {
                edges {
                    node {
                        id
                        title
                        isGridViewEnabled
                        isListViewEnabled
                        isMapViewEnabled
                        titleHelpText
                        descriptionMandatory
                        categoryHelpText
                        descriptionHelpText
                        usingSummary
                        summaryHelpText
                        usingDescription
                        description
                        usingIllustration
                        illustrationHelpText
                        usingThemes
                        themeHelpText
                        themeMandatory
                        usingCategories
                        categories {
                            id
                            name
                            color
                            icon
                            categoryImage {
                                id
                                image {
                                    url
                                    id
                                }
                            }
                        }
                        categoryMandatory
                        usingAddress
                        addressHelpText
                        usingDistrict
                        districts {
                            id
                            name
                            titleOnMap
                            geojson
                            displayedOnMap
                            geojsonStyle
                            border {
                                enabled
                                color
                                opacity
                                size
                            }
                            background {
                                enabled
                                color
                                opacity
                            }
                            translations {
                                name
                                locale
                            }
                        }
                        districtHelpText
                        districtMandatory
                        zoomMap
                        mapCenter {
                            formatted
                            json
                            lat
                            lng
                        }
                        canContact
                        nbrOfMessagesSent
                        proposalInAZoneRequired
                    }
                }
            }  
            organizations {
                proposalForms(query: $query) {
                    edges {
                        node {
                            id
                            title
                            isGridViewEnabled
                            isListViewEnabled
                            isMapViewEnabled
                            titleHelpText
                            descriptionMandatory
                            categoryHelpText
                            descriptionHelpText
                            usingSummary
                            summaryHelpText
                            usingDescription
                            description
                            usingIllustration
                            illustrationHelpText
                            usingThemes
                            themeHelpText
                            themeMandatory
                            usingCategories
                            categories {
                                id
                                name
                                color
                                icon
                                categoryImage {
                                    id
                                    image {
                                        url
                                        id
                                    }
                                }
                            }
                            categoryMandatory
                            usingAddress
                            addressHelpText
                            usingDistrict
                            districts {
                                id
                                name
                                titleOnMap
                                geojson
                                displayedOnMap
                                geojsonStyle
                                border {
                                    enabled
                                    color
                                    opacity
                                    size
                                }
                                background {
                                    enabled
                                    color
                                    opacity
                                }
                                translations {
                                    name
                                    locale
                                }
                            }
                            districtHelpText
                            districtMandatory
                            zoomMap
                            mapCenter {
                                formatted
                                json
                                lat
                                lng
                            }
                            canContact
                            nbrOfMessagesSent
                            proposalInAZoneRequired
                        }
                    }
                }
            }
        }
        
    }
`;

const PROPOSAL_FORM_FRAGMENT = graphql`
    fragment ProposalFormListField_proposalForm on ProposalForm {
        id
    }
`

const QUERY_FRAGMENT = graphql`
    fragment ProposalFormListField_query on Query {
        viewer {
            isOnlyProjectAdmin
        }
    }
`

const formatProposalListData = (proposalForms: ProposalFormListFieldQuery$data['proposalForms'][number]) => {
    if (!proposalForms) return [];
    if (proposalForms) {
        return proposalForms.map(form => {
            return {
                value: form?.id,
                label: form?.title,
            };
        });
    }
};

const ProposalFormListField: React.FC<ProposalFormListFieldProps> = ({
    proposalForm: proposalFormRef,
    query: queryRef
}) => {
    const intl = useIntl();
    const currentProposalForm = useFragment(PROPOSAL_FORM_FRAGMENT, proposalFormRef);
    const query = useFragment(QUERY_FRAGMENT, queryRef)
    const viewer = query.viewer;
    const { control, setValue } = useFormContext();

    const [proposalForms, setProposalForms] =
        // @ts-ignore
        React.useState<ProposalFormListFieldQueryResponse['proposalForms']>(null);
    const loadOptions = async (search: string): Promise<any[]> => {
        const proposalFormsData = await fetchQuery<ProposalFormListFieldQuery>(
            environment,
            PROPOSAL_FORMS_QUERY,
            {
                query: search,
                affiliations: viewer.isOnlyProjectAdmin ? ['OWNER'] : null
            },
        ).toPromise();

        const owner = proposalFormsData.viewer.organizations?.[0] ?? proposalFormsData.viewer;
        const proposalForms = owner.proposalForms.edges.map(edge => edge?.node).filter(form => form?.id !== currentProposalForm.id);

        if (!proposalForms) {
            return []
        }

        setProposalForms(proposalForms);
        return formatProposalListData(proposalForms);
    };

    const onProposalFormSelect = (selected: ProposalFormListFieldValue) => {
        // @ts-ignore
        const proposalForm = proposalForms.find(form => form.id === selected.value);
        if (proposalForm) {
            // @ts-ignore
            setValue('form_model', {
                title: proposalForm.title ?? null,
                titleHelpText: proposalForm.title ?? null,
                usingSummary: proposalForm.usingSummary ?? false,
                summaryHelpText: proposalForm.summaryHelpText ?? null,
                usingDescription: proposalForm.usingDescription ?? false,
                description: proposalForm.description ?? null,
                usingIllustration: proposalForm.usingIllustration ?? false,
                illustrationHelpText: proposalForm.illustrationHelpText ?? null,
                usingThemes: proposalForm.usingThemes ?? false,
                themeHelpText: proposalForm.themeHelpText ?? null,
                themeMandatory: proposalForm.themeMandatory ?? false,
                usingCategories: proposalForm.usingCategories ?? false,
                categories:
                    proposalForm.categories.map(category => ({
                        ...category,
                        // color: category.color.replace('#', 'COLOR_').toUpperCase(),
                        // icon: !!category.icon ? category.icon.toUpperCase().replace(/-/g, '_') : null,
                    })) ?? null,
                categoryMandatory: proposalForm.categoryMandatory ?? false,
                usingAddress: proposalForm.usingAddress ?? false,
                addressHelpText: proposalForm.addressHelpText ?? null,
                usingDistrict: proposalForm.usingDistrict ?? false,
                // @ts-ignore
                districts: proposalForm.usingDistrict
                    ? proposalForm.districts.map(district => ({
                          // id: district.id,
                          geojson: district.geojson,
                          displayedOnMap: district.displayedOnMap,
                          border: district.border,
                          background: district.background,
                          translations: district.translations,
                      }))
                    : null,
                districtHelpText: proposalForm.districtHelpText ?? null,
                districtMandatory: proposalForm.districtMandatory ?? false,
                isGridViewEnabled: proposalForm.isGridViewEnabled ?? false,
                isListViewEnabled: proposalForm.isListViewEnabled ?? false,
                isMapViewEnabled: proposalForm.isMapViewEnabled ?? false,
                zoomMap: String(proposalForm.zoomMap) || null,
                mapCenter: proposalForm.mapCenter,
                descriptionMandatory: proposalForm.descriptionMandatory ?? false,
                categoryHelpText: proposalForm.categoryHelpText ?? null,
                descriptionHelpText: proposalForm.descriptionHelpText ?? null,
                canContact: proposalForm.canContact,
                proposalInAZoneRequired: proposalForm.proposalInAZoneRequired || false,
            });
        }
    };
    return (
        <FormControl name="selectedModel" control={control}>
            <FormLabel
                htmlFor="selectedModel"
                label={intl.formatMessage({
                    id: 'admin.form.model.source',
                })}
            />
            <FieldInput
                name="selectedModel"
                control={control}
                type="select"
                loadOptions={loadOptions}
                defaultOptions
                onChange={selected => {
                    onProposalFormSelect(selected);
                }}
                menuPortalTarget={undefined}
            />
        </FormControl>
    );
};

export default ProposalFormListField;
