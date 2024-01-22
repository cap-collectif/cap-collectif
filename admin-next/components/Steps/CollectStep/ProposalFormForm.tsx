import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import {
    Button,
    CapUIIcon,
    FormLabel,
    Menu,
    Tabs,
    Text,
    Box,
    CapUIRadius,
} from '@cap-collectif/ui';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { Control, FormProvider, UseFormReturn } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { ProposalFormForm_step$key } from '@relay/ProposalFormForm_step.graphql';
import { UseFormSetValue } from 'react-hook-form/dist/types/form';
import type { FormValues } from './CollectStepForm';
import { ProposalFormForm_query$key } from '@relay/ProposalFormForm_query.graphql';
import {
    addRequiredInfo,
    getDropDownOptions,
} from '@components/Steps/CollectStep/ProposalFormForm.utils';
import ProposalFormListField from '@components/Steps/CollectStep/ProposalFormListField';
import TextEditor from '@components/Form/TextEditor/TextEditor';
import ProposalFormFormNeededInfoList from '@components/Steps/CollectStep/ProposalFormFormNeededInfoList';
import {useCollectStep} from "./CollectStepContext";

export interface ProposalFormFormProps {
    control: Control<any>;
    step: ProposalFormForm_step$key;
    query: ProposalFormForm_query$key;
    values: FormValues['form'];
    setValue: UseFormSetValue<FormValues>;
    isEditing: boolean;
    defaultLocale: string;
    formMethods: UseFormReturn<any>;
}

const PROPOSALFORMFORM_STEP_FRAGMENT = graphql`
    fragment ProposalFormForm_step on Step {
        ... on CollectStep {
            id
            form {
                ...ProposalFormListField_proposalForm
            }
        }
    }
`;
const PROPOSALFORMFORM_QUERY_FRAGMENT = graphql`
    fragment ProposalFormForm_query on Query {
        ...ProposalFormAdminCategories_query
    }
`;

const ProposalFormForm: React.FC<ProposalFormFormProps> = ({
    control,
    values,
    setValue,
    step: stepRef,
    query: queryRef,
    defaultLocale,
    formMethods,
}) => {
    const step = useFragment(PROPOSALFORMFORM_STEP_FRAGMENT, stepRef);
    const query = useFragment(PROPOSALFORMFORM_QUERY_FRAGMENT, queryRef);
    const intl = useIntl();
    const dropDownList = getDropDownOptions(values, intl);
    const form = step.form;

    const {operationType} = useCollectStep();
    const isEditing = operationType === 'EDIT'

    if (isEditing) {
        return (
            <Box bg="#F7F7F8" p={6} borderRadius={CapUIRadius.Accordion}>
                <FormProvider {...formMethods}>
                    <TextEditor
                        name="form.description"
                        label={intl.formatMessage({
                            id: 'admin.fields.proposal_form.introduction',
                        })}
                        platformLanguage={defaultLocale}
                        selectedLanguage={defaultLocale}
                        placeholder={intl.formatMessage({
                            id: 'admin.fields.proposal_form.introduction.placeholder',
                        })}
                    />
                </FormProvider>
                <Text mb={4}>{intl.formatMessage({ id: 'admin.proposal.form.needed.info' })}</Text>
                <ProposalFormFormNeededInfoList
                    control={control}
                    defaultLocale={defaultLocale}
                    setValue={setValue}
                    query={query}
                    values={values}
                />
                {dropDownList.length > 0 && (
                    <Menu
                        disclosure={
                            <Button variant="secondary" rightIcon={CapUIIcon.ArrowDownO}>
                                {intl.formatMessage({ id: 'admin.global.add' })}
                            </Button>
                        }
                        onChange={selected => {
                            addRequiredInfo(selected.value, setValue);
                        }}>
                        <Menu.List>
                            {dropDownList.map(dropDownItem => (
                                <Menu.Item key={dropDownItem.value} value={dropDownItem}>
                                    {dropDownItem.label}
                                </Menu.Item>
                            ))}
                        </Menu.List>
                    </Menu>
                )}
            </Box>
        );
    }

    return (
        <Tabs
            selectedId={'new-form'}
            onChange={selected => {
                // if (selected === 'newdf-form') {
                //     resetForm(setValue);
                // }
            }}>
            <Tabs.ButtonList ariaLabel={intl.formatMessage({ id: 'proposal-form' })}>
                <Tabs.Button id={'new-form'}>
                    {intl.formatMessage({ id: 'global.new' })}
                </Tabs.Button>
                <Tabs.Button id={'from-model'}>
                    {intl.formatMessage({ id: 'from-model' })}
                </Tabs.Button>
            </Tabs.ButtonList>
            <Tabs.PanelList>
                <Tabs.Panel>
                    <FormControl name="form.description" control={control} mb={6}>
                        <FormLabel
                            htmlFor="form.description"
                            label={intl.formatMessage({
                                id: 'admin.fields.proposal_form.introduction',
                            })}
                        />
                        <FieldInput
                            id="form.description"
                            name="form.description"
                            control={control}
                            type="textarea"
                            placeholder={intl.formatMessage({
                                id: 'admin.fields.proposal_form.introduction.placeholder',
                            })}
                        />
                    </FormControl>
                    <Text mb={4}>
                        {intl.formatMessage({ id: 'admin.proposal.form.needed.info' })}
                    </Text>
                    <ProposalFormFormNeededInfoList
                        control={control}
                        defaultLocale={defaultLocale}
                        setValue={setValue}
                        query={query}
                        values={values}
                    />
                    {dropDownList.length > 0 && (
                        <Menu
                            disclosure={
                                <Button variant="secondary" rightIcon={CapUIIcon.ArrowDownO}>
                                    {intl.formatMessage({ id: 'admin.global.add' })}
                                </Button>
                            }
                            onChange={selected => {
                                addRequiredInfo(selected.value, setValue);
                            }}>
                            <Menu.List>
                                {dropDownList.map(dropDownItem => (
                                    <Menu.Item key={dropDownItem.value} value={dropDownItem}>
                                        {dropDownItem.label}
                                    </Menu.Item>
                                ))}
                            </Menu.List>
                        </Menu>
                    )}
                </Tabs.Panel>

                <Tabs.Panel>
                    <ProposalFormListField
                        setValue={setValue}
                        proposalForm={form}
                        // defaultValue={
                        //     !!Stepquery.form
                        //         ? { value: Stepquery.form.id, label: Stepquery.form.title }
                        //         : undefined
                        // }
                    />

                    <FormControl name="form.description" control={control} mb={6}>
                        <FormLabel
                            htmlFor="form.description"
                            label={intl.formatMessage({
                                id: 'admin.fields.proposal_form.introduction',
                            })}
                        />
                        <FieldInput
                            id="form.description"
                            name="form.description"
                            control={control}
                            type="textarea"
                            placeholder={intl.formatMessage({
                                id: 'admin.fields.proposal_form.introduction.placeholder',
                            })}
                        />
                    </FormControl>
                    <Text mb={4}>
                        {intl.formatMessage({ id: 'admin.proposal.form.needed.info' })}
                    </Text>
                    <ProposalFormFormNeededInfoList
                        control={control}
                        defaultLocale={defaultLocale}
                        setValue={setValue}
                        query={query}
                        values={values}
                    />
                    {dropDownList.length > 0 && (
                        <Menu
                            placement="bottom-start"
                            closeOnSelect
                            disclosure={
                                <Button variant="secondary" rightIcon={CapUIIcon.ArrowDownO}>
                                    {intl.formatMessage({ id: 'admin.global.add' })}
                                </Button>
                            }
                            onChange={selected => {
                                addRequiredInfo(selected.value, setValue);
                            }}>
                            <Menu.List>
                                {dropDownList.map(dropDownItem => (
                                    <Menu.Item key={dropDownItem.value} value={dropDownItem}>
                                        {dropDownItem.label}
                                    </Menu.Item>
                                ))}
                            </Menu.List>
                        </Menu>
                    )}
                </Tabs.Panel>
            </Tabs.PanelList>
        </Tabs>
    );
};

export default ProposalFormForm;
