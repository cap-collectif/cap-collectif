import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Accordion, FormLabel } from '@cap-collectif/ui';
import { Address, FieldInput, FormControl } from '@cap-collectif/form';

import { useIntl } from 'react-intl';
import ThemeListField from 'components/Form/ThemeListField';
import DistrictListField from 'components/Form/DistrictListField';

const ProjectConfigFormParameters: React.FC = () => {
    const intl = useIntl();

    const { control, setValue } = useFormContext();

    return (
        <>
            <Accordion.Button>
                {intl.formatMessage({ id: 'admin-menu-parameters' })}
            </Accordion.Button>
            <Accordion.Panel>
                <FormControl name="video" control={control}>
                    <FormLabel
                        htmlFor="video"
                        label={intl.formatMessage({ id: 'admin.fields.project.video' })}
                    />
                    <FieldInput
                        id="video"
                        name="video"
                        control={control}
                        type="textarea"
                        rows={2}
                        placeholder={intl.formatMessage({
                            id: 'admin-project-video-placeholder',
                        })}
                    />
                </FormControl>
                <FormControl name="themes" control={control}>
                    <FormLabel label={intl.formatMessage({ id: 'global.themes' })} />
                    <ThemeListField name="themes" isMulti />
                </FormControl>
                <FormControl name="districts" control={control}>
                    <FormLabel label={intl.formatMessage({ id: 'proposal_form.districts' })} />
                    <DistrictListField name="districts" isMulti />
                </FormControl>
                <FormControl name="addressText" control={control}>
                    <FormLabel label={intl.formatMessage({ id: 'proposal_form.address' })} />
                    <FieldInput
                        name="addressText"
                        type="address"
                        control={control}
                        getAddress={add => {
                            setValue('address', add);
                        }}
                    />
                </FormControl>
                <FormControl name="metaDescription" control={control}>
                    <FormLabel
                        htmlFor="metaDescription"
                        label={intl.formatMessage({ id: 'global.meta.description' })}
                    />
                    <FieldInput
                        name="metaDescription"
                        type="textarea"
                        control={control}
                        placeholder={intl.formatMessage({
                            id: 'admin.fields.menu_item.parent_empty',
                        })}
                    />
                </FormControl>
                <FormControl name="opinionCanBeFollowed" control={control}>
                    <FieldInput
                        id="opinionCanBeFollowed"
                        name="opinionCanBeFollowed"
                        type="checkbox"
                        control={control}>
                        {intl.formatMessage({ id: 'activate-proposals-subscription' })}
                    </FieldInput>
                </FormControl>
            </Accordion.Panel>
        </>
    );
};

export default ProjectConfigFormParameters;
