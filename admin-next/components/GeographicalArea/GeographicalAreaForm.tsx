import * as React from 'react';
import L from 'leaflet';
import { useIntl, IntlShape } from 'react-intl';
import { useForm } from 'react-hook-form';
import { graphql, useLazyLoadQuery } from 'react-relay';
import dynamic from 'next/dynamic';
import {
    Flex,
    Heading,
    Menu,
    CapUIIcon,
    FormLabel,
    Button,
    Switch,
    Spinner,
    toast,
} from '@cap-collectif/ui';
import { GeographicalAreaFormQuery } from '@relay/GeographicalAreaFormQuery.graphql';
import useFeatureFlag from '@hooks/useFeatureFlag';
import { createOrReplaceTranslation, formatCodeToLocale } from '@utils/locale-helper';
import { FieldInput, FormControl } from '@cap-collectif/form';
import GeographicalAreaDeleteModal from 'components/GeographicalAreasList/GeographicalAreaDeleteModal';
import { useDisclosure } from '@liinkiing/react-hooks';
import CreateProjectDistrictMutation from '@mutations/CreateProjectDistrictMutation';
import { formatGeoJsons, FormattedDistrict } from '@utils/leaflet';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import UpdateProjectDistrictMutation from '@mutations/UpdateProjectDistrictMutation';

const GeographicalAreaMap = dynamic(() => import('./GeographicalAreaMap'), { ssr: false });

export const QUERY = graphql`
    query GeographicalAreaFormQuery {
        availableLocales(includeDisabled: false) {
            code
            isEnabled
            isDefault
            traductionKey
        }
    }
`;

const isGeoJSONValid = (geoJSON: any[]) => {
    try {
        return !!L.geoJson(geoJSON[0].district);
    } catch (e) {
        return false;
    }
};

const onSubmit = (data: FormattedDistrict, intl: IntlShape, locale: string, translations?: any) => {
    const fields = [
        {
            name: 'name',
            value: data.name,
        },
        {
            name: 'titleOnMap',
            value: data.titleOnMap,
        },
    ];

    const input = {
        translations: createOrReplaceTranslation(fields, locale, translations ? translations : null),
        geojson: data.geojson,
        displayedOnMap: data.displayedOnMap,
        border: {
            enabled: data.border ? true : false,
            color: data.border ? data.border.color : null,
            opacity: data.border ? data.border.opacity : null,
            size: data.border ? data.border.size : null,
        },
        background: {
            enabled: data.background ? true : false,
            color: data.background ? data.background.color : null,
            opacity: data.background ? data.background.opacity : null,
        },
    };
    if (!data.id) {
        return CreateProjectDistrictMutation.commit({
            input,
        })
            .then(() =>
                toast({
                    variant: 'success',
                    content: intl.formatMessage({ id: 'zone-geo-modified' }),
                }),
            )
            .catch(() => {
                mutationErrorToast(intl);
            });
    } else {
        UpdateProjectDistrictMutation.commit({
            input: {
                ...input,
                id: data.id,
            },
        })
            .then(() => {
                toast({
                    variant: 'success',
                    content: intl.formatMessage({ id: 'zone-geo-created' }),
                });
                window.location.href = '/geographicalAreas';
            })
            .catch(() => {
                mutationErrorToast(intl);
            });
    }
};

const fromHexStringToOpacity = (hex: string) => Math.round(100 * (Number(`0x${hex}`) / 255));

type Props = {
    queryValues?: any,
    translations?: readonly {
        readonly name: string,
        readonly titleOnMap: string | null,
        readonly locale: string,
    }[],
};

const GeographicalAreaForm: React.FC<Props> = ({ queryValues, translations }) => {
    const intl = useIntl();
    const [geoJSONValid, setGeoJSONValid] = React.useState(false);
    const multilangue = useFeatureFlag('multilangue');
    const { isOpen, onOpen, onClose } = useDisclosure(false);
    const { availableLocales } = useLazyLoadQuery<GeographicalAreaFormQuery>(QUERY, {});
    const defaultLocale = availableLocales.find(locale => locale.isDefault);
    const [localeSelected, setLocaleSelected] = React.useState({
        label: intl.formatMessage({ id: defaultLocale?.traductionKey || 'french' }),
        value: formatCodeToLocale(defaultLocale?.code || ''),
    });

    const defaultValues = {
        id: null,
        geojson: '',
        displayedOnMap: false,
        name:
            translations?.find(translation => translation.locale === localeSelected.value)?.name ||
            '',
        titleOnMap:
            translations?.find(translation => translation.locale === localeSelected.value)
                ?.titleOnMap || '',
        ...queryValues,
        border: { color: '#5e5e5e', size: 1, ...queryValues?.border, opacity: 100 },
        background: {
            color: '#000012',
            opacity: queryValues?.opacity
                ? queryValues.opacity < 1
                    ? queryValues.opacity * 100
                    : queryValues.opacity
                : 12,
        },
    };

    const { control, reset, handleSubmit, formState, watch, setValue } =
        useForm({
            mode: 'onChange',
            defaultValues,
        });

    React.useEffect(() => {
        reset(defaultValues);
    }, [localeSelected]);

    const id = watch('id');
    const geojson = watch('geojson');
    const background = watch('background');
    const border = watch('border');
    const titleOnMap = watch('titleOnMap');
    const displayedOnMap = watch('displayedOnMap');

    const district = {
        id,
        geojson,
        background,
        border,
        displayedOnMap,
        titleOnMap,
    };

    React.useEffect(() => {
        const geoJSON = formatGeoJsons([{ ...district, displayedOnMap: true }]);
        if (!district.geojson || !geoJSON.length || !geoJSON[0].district) {
            setGeoJSONValid(false);
        } else {
            if (!isGeoJSONValid(geoJSON)) {
                setGeoJSONValid(false);
            } else {
                setGeoJSONValid(true);
            }
        }
    }, [district.geojson]);

    return (
        <Flex direction="column">
            <form id="geographicalAreaForm">
                <Flex direction="column" bg="white" borderRadius="normal" p={6}>
                    <Flex justify="space-between" alignItems="flex-start">
                        <Heading as="h4" color="blue.800" fontWeight={600} mb={4}>
                            {intl.formatMessage({ id: 'global.general' })}
                        </Heading>
                        {multilangue && (
                            <Menu
                                disclosure={
                                    <Button
                                        variantColor="primary"
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
                                            key={locale?.code}
                                            type="button"
                                            value={{
                                                label: intl.formatMessage({
                                                    id: locale?.traductionKey,
                                                }),
                                                value: formatCodeToLocale(locale?.code || ''),
                                            }}>
                                            {intl.formatMessage({
                                                id: locale?.traductionKey,
                                            })}
                                        </Menu.Item>
                                    ))}
                                </Menu.List>
                            </Menu>
                        )}
                    </Flex>

                    <FormControl name="name" control={control} isRequired>
                        <FormLabel
                            htmlFor="name"
                            label={intl.formatMessage({ id: 'global.title' })}
                        />
                        <FieldInput
                            id="name"
                            name="name"
                            control={control}
                            type="text"
                            placeholder={intl.formatMessage({
                                id: 'city-neighbourhood-placeholder',
                            })}
                            minLength={2}
                            maxLength={255}
                        />
                    </FormControl>
                    <FormControl
                        name="geojson"
                        control={control}
                        isRequired
                        isInvalid={!geoJSONValid && geojson?.length}>
                        <FormLabel
                            htmlFor="geojson"
                            label={intl.formatMessage({ id: 'geojson-code' })}
                        />
                        <FieldInput
                            id="geojson"
                            name="geojson"
                            control={control}
                            type="textarea"
                            rows={5}
                            placeholder={intl.formatMessage({
                                id: 'paste-code-here',
                            })}
                            rules={{ validate: () => geoJSONValid }}
                        />
                    </FormControl>
                </Flex>
                <Flex direction="column" bg="white" borderRadius="normal" p={6} mt={6}>
                    <Flex justify="space-between" alignItems="flex-start">
                        <Heading as="h4" color="blue.800" fontWeight={600} mb={4}>
                            {intl.formatMessage({ id: 'display-area-on-map' })}
                        </Heading>
                        <Switch
                            id="display-on-map"
                            checked={displayedOnMap}
                            onChange={() => setValue('displayedOnMap', !displayedOnMap)}
                        />
                    </Flex>
                    {displayedOnMap ? (
                        <Flex spacing={6}>
                            <Flex direction="column" width="50%">
                                <FormControl name="titleOnMap" control={control}>
                                    <FormLabel
                                        htmlFor="titleOnMap"
                                        label={intl.formatMessage({ id: 'title-on-map' })}
                                    />
                                    <FieldInput
                                        id="titleOnMap"
                                        name="titleOnMap"
                                        control={control}
                                        type="text"
                                        placeholder={intl.formatMessage({
                                            id: 'admiun.project.create.title.placeholder',
                                        })}
                                        minLength={2}
                                        maxLength={255}
                                    />
                                </FormControl>
                                <FormControl name="background.color" control={control} isRequired>
                                    <FormLabel
                                        htmlFor="background.color"
                                        label={intl.formatMessage({ id: 'global.background' })}
                                    />
                                    <FieldInput
                                        id="background.color"
                                        name="background.color"
                                        control={control}
                                        type="colorPicker"
                                        onChange={hexColor => {
                                            const color = String(hexColor);
                                            setValue('background.color', color?.slice(0, 6));
                                            setValue(
                                                'background.opacity',
                                                color?.length === 10
                                                    ? fromHexStringToOpacity(color?.slice(7, 9))
                                                    : 100,
                                            );
                                        }}
                                        withOpacity
                                    />
                                </FormControl>
                                <FormControl name="border.color" control={control} isRequired>
                                    <FormLabel
                                        htmlFor="border.color"
                                        label={intl.formatMessage({ id: 'global.border' })}
                                    />
                                    <FieldInput
                                        id="border.color"
                                        name="border.color"
                                        control={control}
                                        type="colorPicker"
                                    />
                                </FormControl>
                                <FormControl name="border.size" control={control} isRequired>
                                    <FormLabel
                                        htmlFor="border.size"
                                        label={intl.formatMessage({ id: 'thickness' })}
                                    />
                                    <FieldInput
                                        id="border.size"
                                        name="border.size"
                                        control={control}
                                        type="number"
                                    />
                                </FormControl>
                            </Flex>
                            <React.Suspense fallback={<Spinner m="auto" />}>
                                <GeographicalAreaMap district={district} />
                            </React.Suspense>
                        </Flex>
                    ) : null}
                </Flex>
                <Flex spacing={6} mt={6}>
                    <Button
                        variant="primary"
                        variantColor="primary"
                        variantSize="big"
                        disabled={!formState.isValid || !formState.isDirty}
                        loading={formState.isSubmitting}
                        onClick={e =>
                            handleSubmit((data: FormattedDistrict) =>
                                onSubmit(data, intl, localeSelected?.value, translations),
                            )(e)
                        }>
                        {intl.formatMessage({ id: queryValues ? 'global.save' : 'global.create' })}
                    </Button>
                    {queryValues ? (
                        <>
                            <GeographicalAreaDeleteModal
                                show={isOpen}
                                onClose={onClose}
                                geographicalAreaId={id}
                                fromDistrict
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                variantColor="danger"
                                variantSize="big"
                                onClick={onOpen}>
                                {intl.formatMessage({
                                    id: 'global.delete',
                                })}
                            </Button>
                        </>
                    ) : null}
                </Flex>
            </form>
        </Flex>
    );
};

export default GeographicalAreaForm;
