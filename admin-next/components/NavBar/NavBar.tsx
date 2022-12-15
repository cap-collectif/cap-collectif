import * as React from 'react';
import { NavBarQuery } from '@relay/NavBarQuery.graphql';
import { Avatar, CapUIIcon, CapUIIconSize, Icon, Menu, Spinner, Text } from '@cap-collectif/ui';
import { NavBar as NavBarUI } from '@ui/NavBar';
import { formatCodeToLocale, setLocaleCookie } from '@utils/locale-helper';
import { getBaseUrlWithAdminNextSupport } from '~/config';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useIntl } from 'react-intl';
import useFeatureFlag from '../../hooks/useFeatureFlag';
import { useNavBarContext } from './NavBar.context';
import BreadCrumbItems from '../BreadCrumb/BreadCrumbItems';

const QUERY = graphql`
    query NavBarQuery {
        availableLocales(includeDisabled: false) {
            id
            code
            traductionKey
            isDefault
        }
        viewer {
            displayName
            url
            media {
                url
            }
        }
    }
`;

const FLAGS = {
    EN_GB: '🇬🇧',
    FR_FR: '🇫🇷',
    ES_ES: '🇪🇸',
    DE_DE: '🇩🇪',
    NL_NL: '🇳🇱',
    SV_SE: '🇸🇪',
    EU_EU: '🇪🇸',
    OC_OC: '🇫🇷',
    UR_IN: '🏁',
};

type NavBarData = {
    number: {
        color: string;
        label: string | number;
    };
    label: string;
};

export interface NavBarProps {
    readonly title: string;
    readonly data?: NavBarData[];
}

export const NavBar: React.FC<NavBarProps> = ({ title, data }) => {
    const { availableLocales, viewer } = useLazyLoadQuery<NavBarQuery>(QUERY, {});
    const intl = useIntl();
    const hasMultilangue = useFeatureFlag('multilangue');
    const { saving, breadCrumbItems } = useNavBarContext();
    const localeFromCookie = intl.locale;
    const localeSelected =
        availableLocales.find(locale =>
            localeFromCookie
                ? localeFromCookie === formatCodeToLocale(locale.code)
                : locale.isDefault,
        ) || availableLocales[0];

    return (
        <NavBarUI>
            <NavBarUI.Title>
                {breadCrumbItems.length > 0 ? (
                    <BreadCrumbItems breadCrumbItems={breadCrumbItems} />
                ) : (
                    title
                )}
            </NavBarUI.Title>

            {saving && (
                <NavBarUI.List ml="auto" mr={4} spacing={2} color="gray.500">
                    <Spinner />
                    <Text>{intl.formatMessage({ id: 'global.saving' })}</Text>
                </NavBarUI.List>
            )}

            {data && data.length > 0 && (
                <NavBarUI.List ml={saving ? 0 : 'auto'} mr={4} spacing={4}>
                    {data.map((data, idx) => (
                        <NavBarUI.Data key={`data-${idx}`}>
                            <Text as="span" color={data.number.color}>
                                {data.number.label}
                            </Text>{' '}
                            {data.label}
                        </NavBarUI.Data>
                    ))}
                </NavBarUI.List>
            )}

            <NavBarUI.List>
                {hasMultilangue && (
                    <Menu
                        disclosure={<NavBarUI.Item />}
                        value={{
                            value: localeSelected.id,
                            label: `${FLAGS[localeSelected.code]} ${intl.formatMessage({
                                id: localeSelected.traductionKey,
                            })}`,
                        }}>
                        <Menu.List>
                            {availableLocales
                                .filter(locale => locale.id !== localeSelected.id)
                                .map(locale => (
                                    <Menu.Item
                                        key={locale.id}
                                        onClick={() => {
                                            setLocaleCookie(formatCodeToLocale(locale.code));
                                            window.location.reload();
                                        }}
                                        value={{
                                            value: locale.id,
                                            label: `${FLAGS[locale.code]} ${intl.formatMessage({
                                                id: locale.traductionKey,
                                            })}`,
                                        }}>
                                        {`${FLAGS[locale.code]} ${intl.formatMessage({
                                            id: locale.traductionKey,
                                        })}`}
                                    </Menu.Item>
                                ))}
                        </Menu.List>
                    </Menu>
                )}

                <NavBarUI.Item className="beamerTrigger">
                    <Icon name={CapUIIcon.Bell} size={CapUIIconSize.Md} />
                </NavBarUI.Item>

                <Menu
                    disclosure={
                        <NavBarUI.Item spacing={2}>
                            <Avatar name={viewer.displayName} src={viewer?.media?.url} size="sm" />
                            <Text>{viewer.displayName}</Text>
                        </NavBarUI.Item>
                    }>
                    <Menu.List>
                        <Menu.Item onClick={() => (window.location.href = viewer.url)}>
                            <Icon name={CapUIIcon.User} color="gray.500" />
                            <Text ml={1}>{intl.formatMessage({ id: 'navbar.profile' })}</Text>
                        </Menu.Item>
                        <Menu.Item
                            onClick={() =>
                                (window.location.href = getBaseUrlWithAdminNextSupport())
                            }>
                            <Icon name={CapUIIcon.Home} color="gray.500" />
                            <Text ml={1}>{intl.formatMessage({ id: 'global.platform' })}</Text>
                        </Menu.Item>
                        <Menu.Item
                            onClick={() =>
                                (window.location.href = `${getBaseUrlWithAdminNextSupport()}/logout`)
                            }>
                            <Icon name={CapUIIcon.Logout} color="gray.500" />
                            <Text ml={1}>{intl.formatMessage({ id: 'global-disconnect' })}</Text>
                        </Menu.Item>
                    </Menu.List>
                </Menu>
            </NavBarUI.List>
        </NavBarUI>
    );
};

export default NavBar;
