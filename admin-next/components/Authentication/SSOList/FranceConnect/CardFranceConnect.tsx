import { FC, useState } from 'react';
import CardSSO from '@ui/CardSSO/CardSSO';
import { Button, ButtonQuickAction, CapUIIcon, Switch, Text } from '@cap-collectif/ui';
import logo from './Logo';
import { graphql, useFragment } from 'react-relay';
import type { CardFranceConnect_ssoConfiguration$key } from '@relay/CardFranceConnect_ssoConfiguration.graphql';
import type { CardFranceConnect_organizationName$key } from '@relay/CardFranceConnect_organizationName.graphql';
import ModalFranceConnectTeaser from './ModalFranceConnectTeaser';
import useFeatureFlag from '@hooks/useFeatureFlag';
import ModalFranceConnectConfiguration from './ModalFranceConnectConfiguration';
import { toggleSSO } from '@mutations/ToggleSSOConfigurationStatusMutation';
import { useMultipleDisclosure } from '@liinkiing/react-hooks';
import { useIntl } from 'react-intl';

type CardFranceConnectProps = {
    readonly ssoConfiguration: CardFranceConnect_ssoConfiguration$key | null,
    readonly organizationName: CardFranceConnect_organizationName$key | null,
    readonly ssoConnectionName: string
};

const FRAGMENT = graphql`
    fragment CardFranceConnect_ssoConfiguration on FranceConnectSSOConfiguration {
        id
        __typename
        clientId
        enabled
        ...ModalFranceConnectConfiguration_ssoConfiguration
    }
`;

const ORGANIZATION_NAME_FRAGMENT = graphql`
    fragment CardFranceConnect_organizationName on SiteParameter {
        value
    }
`;

const CardFranceConnect: FC<CardFranceConnectProps> = ({ ssoConfiguration: ssoConfigurationFragment, organizationName: organizationNameFragment, ssoConnectionName }) => {
    const intl = useIntl();
    const [hover, setHover] = useState(false);
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);
    const organizationName = useFragment(ORGANIZATION_NAME_FRAGMENT, organizationNameFragment);
    const hasFranceConnect = useFeatureFlag('login_franceconnect');
    const { onClose, onOpen, isOpen } = useMultipleDisclosure({
        'franceConnect-configuration': false,
        'franceConnect-configuration-editing': false
    });

    return (
        <>
            <CardSSO onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <CardSSO.Header>{hover ?
                    <ButtonQuickAction
                        variantColor="blue"
                        icon={CapUIIcon.Pencil}
                        label={intl.formatMessage({ id: 'action_edit' })}
                        onClick={onOpen('franceConnect-configuration-editing')}
                    />: logo}</CardSSO.Header>
                <CardSSO.Body>
                    <Text as="label" color="gray.900" fontSize={3} htmlFor="sso-france-connect">
                        FranceConnect
                    </Text>

                    {hasFranceConnect ?
                        (ssoConfiguration ? (
                        <Switch id="sso-france-connect" checked={ssoConfiguration.enabled} onChange={() => toggleSSO(ssoConfiguration.id, ssoConfiguration.enabled, ssoConfiguration.__typename) }/>
                    ) : <Button variantColor="primary" variant="tertiary" onClick={onOpen('franceConnect-configuration')} alternative>
                            {intl.formatMessage({ id: 'global.configure' })}
                        </Button>)  : (
                        <ModalFranceConnectTeaser organizationName={organizationName?.value || ''} />
                    )}
                </CardSSO.Body>
            </CardSSO>

            <ModalFranceConnectConfiguration
                ssoConfiguration={ssoConfiguration}
                ssoConnectionName={ssoConnectionName}
                isEditing
                isOpen={isOpen('franceConnect-configuration-editing')}
                onClose={onClose('franceConnect-configuration-editing')}
            />

            <ModalFranceConnectConfiguration
                ssoConfiguration={ssoConfiguration}
                ssoConnectionName={ssoConnectionName}
                isOpen={isOpen('franceConnect-configuration')}
                onClose={onClose('franceConnect-configuration')}
            />
        </>
    );
};

export default CardFranceConnect;
