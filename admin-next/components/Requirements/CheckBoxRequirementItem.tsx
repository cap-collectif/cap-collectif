import React from 'react';
import {Box, Button, ButtonQuickAction, CapUIIcon, Checkbox, Flex, Input, Text, ButtonGroup} from "@cap-collectif/ui";
import {useIntl} from "react-intl";
import {UseFieldArrayRemove} from "react-hook-form/dist/types/fieldArray";
import {useFormContext} from "react-hook-form";

type Props = {
    id: string
    index: number
    remove: UseFieldArrayRemove
};

const CheckBoxRequirementItem: React.FC<Props> = ({id, index, remove}) => {
    const { register, watch } = useFormContext();
    const intl = useIntl();
    const labelValue = watch(`requirements.${index}.label`);
    const [isEditing, setIsEditing] = React.useState(() => !labelValue);

    const toggleEditing = () => {
        setIsEditing(oldValue => !oldValue);
    }

    return (
        <Flex key={id} p={4} spacing={4} bg="white" alignItems="center" justifyContent="space-between">
            {
                isEditing ? (
                    <>
                        <Box>
                            <Checkbox id={id} checked/>
                            <Input type="text"
                                   width="280px"
                                   placeholder={intl.formatMessage({id: 'enter-label'})}
                                   {...register(`requirements.${index}.label`)}
                            />
                        </Box>
                        <Button onClick={toggleEditing}>{intl.formatMessage({id: 'global.validate'})}</Button>
                    </>
                ) : (
                    <>
                        <Flex>
                            <Checkbox id={id} checked/>
                            <Text as="label" htmlFor={id} color="gray.700" fontWeight={400} ml={1}>{labelValue}</Text>
                        </Flex>
                        <ButtonGroup>
                            <ButtonQuickAction onClick={() => setIsEditing(true)} icon={CapUIIcon.Pencil} label="edit" variantColor="blue" />
                            <ButtonQuickAction onClick={() => remove(index)} icon={CapUIIcon.Trash} label="delete" variantColor="red" />
                        </ButtonGroup>
                    </>
                )
            }
        </Flex>
    );
};

export default CheckBoxRequirementItem;