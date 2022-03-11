import { FC, useEffect, useState } from 'react';
import {
    Accordion,
    Button,
    CapUIAccordionColor,
    CapUIFontWeight,
    CapUIIcon,
    CapUIIconSize,
    Flex,
    FormGuideline,
    FormLabel,
    Menu,
    Switch, Tag,
    Text,
    toast, UPLOADER_SIZE,
} from '@cap-collectif/ui';
import { IntlShape, useIntl } from 'react-intl';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { ShieldQuery, ShieldQueryResponse } from '@relay/ShieldQuery.graphql';
import UpdateShieldAdminFormMutation, { toggleShield } from '@mutations/UpdateShieldAdminFormMutation';
import { FieldInput, FormControl, UploaderProps } from '@cap-collectif/form';
import { useForm } from 'react-hook-form';
import { createOrReplaceTranslation, formatCodeToLocale } from '@utils/locale-helper';
import { toggleFeatureFlag } from '@mutations/ToggleFeatureMutation';
import { useFeatureFlags } from '@hooks/useFeatureFlag';
import { useNavBarContext } from '../NavBar/NavBar.context';
import { UPLOAD_PATH } from '@utils/config';
import { useAppContext } from '../AppProvider/App.context';

type MenuLocaleValue = {
    label: string,
    value: string,
};

const QUERY = graphql`
    query ShieldQuery {
        shieldAdminForm {
            shieldMode
            translations {
                locale
                introduction
            }
            media {
                id
                name
                size
                type: contentType
                url(format: "reference")
            }
        }
        availableLocales(includeDisabled: false) {
            code
            isEnabled
            isDefault
            traductionKey
        }
    }
`;

type FormValues = {
    introduction: string,
    logo?: Parameters<UploaderProps['onChange']>[0]
};

const onSubmit = (
    data: FormValues,
    locale: string,
    translations: ShieldQueryResponse['shieldAdminForm']['translations'],
    setLoading: (loading: boolean) => void,
    intl: IntlShape
): void => {
    setLoading(true);

    const fields  = [
        {
            name: "introduction",
            value: data.introduction,
        }
    ];

    UpdateShieldAdminFormMutation.commit({
        input: {
            shieldMode: true,
            translations: createOrReplaceTranslation(fields, locale, translations),
            mediaId: data.logo ? data.logo.id : undefined
        },
    }).then(() => {
        setLoading(false);
        toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'global-saved' }),
        });
    });
};

const Shield: FC = () => {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);
    const { viewerSession } = useAppContext();
    const { shieldAdminForm, availableLocales } = useLazyLoadQuery<ShieldQuery>(QUERY, {});
    const features = useFeatureFlags(['sso_by_pass_auth', 'multilangue', 'remind_user_account_confirmation']);
    const { setSaving } = useNavBarContext();

    const defaultLocale = (availableLocales.find(locale => locale.isDefault) as ShieldQueryResponse['availableLocales'][0]);
    const [localeSelected, setLocaleSelected] = useState<MenuLocaleValue>({
        label: intl.formatMessage({ id: defaultLocale?.traductionKey || 'french' }),
        value: formatCodeToLocale(defaultLocale.code),
    });

    const defaultValues = {
        introduction:
            shieldAdminForm.translations.find(
                translation =>
                    translation.locale === localeSelected.value
            )?.introduction || '',
        logo: shieldAdminForm?.media || null,
    }

    const { control, reset, handleSubmit, formState } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues
    });

    useEffect(() => {
        reset(defaultValues)
    }, [localeSelected])

    return (
        <Accordion defaultAccordion="advanced-settings" color={CapUIAccordionColor.White} width="30%">
            <Accordion.Item id="advanced-settings">
                <Accordion.Button>
                    {intl.formatMessage({ id: 'advanced-setttings' })}
                </Accordion.Button>
                <Accordion.Panel spacing={6}>
                    <Flex direction="row" justify="space-between" align="flex-start" spacing={2}>
                        <Flex direction="column" spacing={1}>
                            <Text color="gray.900" fontSize={3} fontWeight={CapUIFontWeight.Semibold}>
                                {intl.formatMessage({ id: 'global.shield' })}
                            </Text>
                            <Text color="gray.700" fontSize={2}>{intl.formatMessage({ id: 'module-shield-description' })}</Text>
                        </Flex>
                        <Switch
                            id="shield"
                            checked={shieldAdminForm.shieldMode}
                            onChange={() => toggleShield(!shieldAdminForm.shieldMode, shieldAdminForm.translations, shieldAdminForm?.media?.id)}
                        />
                    </Flex>


                    {shieldAdminForm.shieldMode && (
                        <Flex as="form" direction="column" align="flex-start" onSubmit={e => handleSubmit((data: FormValues) => onSubmit(data, localeSelected.value, shieldAdminForm.translations, setLoading, intl))(e)}>
                            <FormControl name="introduction" control={control}>
                                <FormLabel label={intl.formatMessage({ id: 'global.intro' })}>
                                    <Flex direction="row" justify="space-between" flex={1}>
                                        <Text fontSize={2} color="gray.500">
                                            {intl.formatMessage({ id: "global.optional" })}
                                        </Text>

                                        {features.multilangue && <Menu
                                            disclosure={
                                                <Button
                                                    variantColor="hierarchy"
                                                    variantSize="big"
                                                    variant="tertiary"
                                                    rightIcon={CapUIIcon.ArrowDownO}>
                                                    {localeSelected.label}
                                                </Button>
                                            }
                                            onChange={setLocaleSelected}
                                            value={localeSelected}>
                                            <Menu.List>
                                                {availableLocales.map(locale => (
                                                    <Menu.Item
                                                        key={locale.code}
                                                        type="button"
                                                        value={{
                                                            label: intl.formatMessage({
                                                                id: locale.traductionKey,
                                                            }),
                                                            value: formatCodeToLocale(locale.code),
                                                        }}>
                                                        {intl.formatMessage({
                                                            id: locale.traductionKey,
                                                        })}
                                                    </Menu.Item>
                                                ))}
                                            </Menu.List>
                                        </Menu>}
                                    </Flex>
                                </FormLabel>
                                <FieldInput name="introduction" control={control} type="textarea" />
                            </FormControl>

                            <FormControl name="logo" control={control}>
                                <FormLabel label={intl.formatMessage({ id: 'platform-logo' })}>
                                    <Text fontSize={2} color="gray.500">
                                        {intl.formatMessage({ id: "global.optional" })}
                                    </Text>
                                </FormLabel>
                                <FormGuideline>
                                    {intl.formatMessage({ id: "supported.format.listed"}, { format: 'jpg, png, svg'})}
                                    {' '}
                                    {intl.formatMessage({ id: "specific-max-weight"}, { weight: '200Ko'})}
                                </FormGuideline>

                                <FieldInput
                                    type="uploader"
                                    name="logo"
                                    control={control}
                                    format=".jpg,.jpeg,.png,.svg"
                                    maxSize={204800}
                                    size={UPLOADER_SIZE.MD}
                                    uploadURI={UPLOAD_PATH}
                                    showThumbnail />
                            </FormControl>

                            <Button
                                type="submit"
                                variant="secondary"
                                variantColor="primary"
                                isLoading={loading}
                                disabled={!formState.isValid || !formState.isDirty}
                                loading={formState.isSubmitting}>
                                {intl.formatMessage({ id: "modifications.publish"})}
                            </Button>
                        </Flex>
                    )}

                    {viewerSession.isSuperAdmin && (
                        <>
                            <Flex direction="row" justify="space-between" align="flex-start" spacing={2}>
                                <Flex direction="column" spacing={1}>
                                    <Flex direction="row" spacing={1}>
                                        <Text color="gray.900" fontSize={3} fontWeight={CapUIFontWeight.Semibold}>
                                            {intl.formatMessage({ id: 'instant-authentication' })}
                                        </Text>
                                        <Tag variantColor='gray'>
                                            <Tag.LeftIcon name={CapUIIcon.LockOpen} size={CapUIIconSize.Sm} mr={0} />
                                        </Tag>
                                    </Flex>

                                    <Text color="gray.700" fontSize={2}>{intl.formatMessage({ id: 'module-instant-authentication-description' })}</Text>
                                </Flex>
                                <Switch
                                    id="by-pass-auth"
                                    checked={features.sso_by_pass_auth}
                                    onChange={() => toggleFeatureFlag("sso_by_pass_auth", !features.sso_by_pass_auth, intl, setSaving)}
                                />
                            </Flex>

                            <Flex direction="row" justify="space-between" align="flex-start" spacing={2}>
                                <Flex direction="column" spacing={1}>
                                    <Flex direction="row" spacing={1}>
                                        <Text color="gray.900" fontSize={3} fontWeight={CapUIFontWeight.Semibold}>
                                            {intl.formatMessage({ id: 'capco.module.remind_user_account_confirmation' })}
                                        </Text>
                                        <Tag variantColor='gray'>
                                            <Tag.LeftIcon name={CapUIIcon.LockOpen} size={CapUIIconSize.Sm} mr={0} />
                                        </Tag>
                                    </Flex>

                                    <Text color="gray.700" fontSize={2}>
                                        {intl.formatMessage({ id: 'description.module.remind_user_account_confirmation' })}
                                    </Text>
                                </Flex>
                                <Switch
                                    id="remind-user-acount-confirmation"
                                    checked={features.remind_user_account_confirmation}
                                    onChange={() => toggleFeatureFlag('remind_user_account_confirmation', !features.remind_user_account_confirmation, intl, setSaving)}
                                />
                            </Flex>
                        </>
                    )}
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
};

export default Shield;
