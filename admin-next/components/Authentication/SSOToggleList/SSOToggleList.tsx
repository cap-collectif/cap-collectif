import { FC, Fragment } from 'react';
import {
    CapUIFontWeight,
    CapUIIcon,
    CapUIIconSize,
    Checkbox,
    Flex,
    headingStyles,
    Switch,
    Tag,
    Text,
} from '@cap-collectif/ui';
import { Section } from '@ui/Section';
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql';
import { IntlShape, useIntl } from 'react-intl';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import { useNavBarContext } from '../../NavBar/NavBar.context';
import { useFeatureFlags } from '@hooks/useFeatureFlag';
import ToggleFeatureMutation from '@mutations/ToggleFeatureMutation';
import ListCard from '@ui/ListCard/ListCard';

type SSOToggle = {
    label: string,
    featureFlag: FeatureFlagType,
};

const SSO_TOGGLES: SSOToggle[] = [
    {
        label: 'FranceConnect',
        featureFlag: 'login_franceconnect',
    },
    {
        label: 'Open ID',
        featureFlag: 'login_openid',
    },
    {
        label: 'SAML',
        featureFlag: 'login_saml',
    },
    {
        label: 'CAS',
        featureFlag: 'login_cas',
    },
    {
        label: 'MonCompteParis',
        featureFlag: 'login_paris',
    },
];

const toggleFeatureFlag = (
    name: FeatureFlagType,
    enabled: boolean,
    intl: IntlShape,
    callBack: any,
) => {
    callBack(true);

    return ToggleFeatureMutation.commit({
        input: {
            type: name,
            enabled,
        },
    }).then(response => {
        callBack(false);

        if (!response.toggleFeature?.featureFlag) {
            return mutationErrorToast(intl);
        }
    });
};

const SSOToggleList: FC = () => {
    const intl = useIntl();
    const { setSaving } = useNavBarContext();
    const features = useFeatureFlags([
        'login_franceconnect',
        'login_openid',
        'login_saml',
        'login_cas',
        'login_paris',
        'disconnect_openid',
    ]);

    return (
        <Flex direction="column" mt={9}>
            <Flex direction="row" mb={2} spacing={2}>
                <Text color="gray.900" {...headingStyles.h4}>
                    {intl.formatMessage({ id: 'activate-custom-authentication-method' })}
                </Text>

                <Tag variantColor="gray">
                    <Tag.LeftIcon name={CapUIIcon.Lock} size={CapUIIconSize.Sm} mr={0} />
                </Tag>
            </Flex>
            <Section.Description mb={4}>
                {intl.formatMessage({
                    id: 'activate-custom-authentication-method-description',
                })}
            </Section.Description>

            <ListCard>
                {SSO_TOGGLES.map(ssoToggle => (
                    <Fragment key={ssoToggle.featureFlag}>
                        <ListCard.Item as="label" htmlFor={ssoToggle.featureFlag}>
                            <ListCard.Item.Label
                                color="gray.900"
                                fontWeight={CapUIFontWeight.Semibold}>
                                {ssoToggle.label}
                            </ListCard.Item.Label>

                            <Switch
                                id={ssoToggle.featureFlag}
                                checked={features[ssoToggle.featureFlag]}
                                onChange={e =>
                                    toggleFeatureFlag(
                                        ssoToggle.featureFlag,
                                        e.target.checked,
                                        intl,
                                        setSaving,
                                    )
                                }
                            />
                        </ListCard.Item>
                        {ssoToggle.featureFlag === 'login_openid' && features.login_openid && (
                            <ListCard.SubItem>
                                <Checkbox
                                    checked={features.disconnect_openid}
                                    onChange={e =>
                                        toggleFeatureFlag(
                                            'disconnect_openid',
                                            e.target.checked,
                                            intl,
                                            setSaving,
                                        )
                                    }
                                    id="confirmed-openID-connection"
                                    label={intl.formatMessage({
                                        id: 'confirm-connection-openID',
                                    })}
                                />
                            </ListCard.SubItem>
                        )}
                    </Fragment>
                ))}
            </ListCard>
        </Flex>
    );
};

export default SSOToggleList;
