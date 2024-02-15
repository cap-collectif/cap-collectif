import * as React from 'react';
import { UseFormSetValue } from 'react-hook-form/dist/types/form';
import { FormValues } from '@components/Steps/CollectStep/CollectStepForm';
import { ListCard } from '@ui/ListCard';
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Flex } from '@cap-collectif/ui';
import ProposalFormAdminDistrictsModal from '@components/Steps/CollectStep/ProposalFormAdminDistrictsModal';
import { Control, useFieldArray } from 'react-hook-form';
import {useCollectStep} from "./CollectStepContext";

export interface ProposalFormAdminDistrictsProps {
    control: Control<FormValues>;
    defaultLocale: string;
}

const ProposalFormAdminDistricts: React.FC<ProposalFormAdminDistrictsProps> = ({
    defaultLocale,
    control,
}) => {
    const {proposalFormKey} = useCollectStep();
    
    const {
        fields: districts,
        append,
        remove,
        update,
    } = useFieldArray({
        control,
        name: `${proposalFormKey}.districts`,
    });
    return (
        <Flex direction="column" width="100%" gap={2}>
            {districts.length > 0 && (
                <ListCard>
                    {districts.map((district, index) => {
                        return (
                            <ListCard.Item
                                backgroundColor="white"
                                align="center"
                                py={0}
                                key={district.id}>
                                <ListCard.Item.Label>
                                    {
                                        district.translations?.find(
                                            elem =>
                                                elem?.locale?.toLowerCase().replace(/-/g, '_') ===
                                                defaultLocale,
                                        ).name
                                    }
                                </ListCard.Item.Label>
                                <ButtonGroup>
                                    <ProposalFormAdminDistrictsModal
                                        isUpdating
                                        initialValue={district}
                                        index={index}
                                        update={update}
                                        defaultLocale={defaultLocale}
                                    />
                                    <ButtonQuickAction
                                        className={`NeededInfo_districts_item_delete_${index}`}
                                        variantColor="red"
                                        icon={CapUIIcon.Trash}
                                        label="delete"
                                        onClick={() => {
                                            remove(index);
                                        }}
                                    />
                                </ButtonGroup>
                            </ListCard.Item>
                        );
                    })}
                </ListCard>
            )}

            <ProposalFormAdminDistrictsModal
                isUpdating={false}
                index={districts.length}
                append={append}
                defaultLocale={defaultLocale}
            />
        </Flex>
    );
};

export default ProposalFormAdminDistricts;
