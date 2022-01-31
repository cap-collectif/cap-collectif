import { FC, useState } from 'react';
import CardSSO from '@ui/CardSSO/CardSSO';
import { Switch, Text } from '@cap-collectif/ui';
import logo from './Logo';
import { graphql, useFragment } from 'react-relay';
import type { CardFranceConnect_ssoConfiguration$key } from '@relay/CardFranceConnect_ssoConfiguration.graphql';
import type { CardFranceConnect_organizationName$key } from '@relay/CardFranceConnect_organizationName.graphql';
import ModalFranceConnectTeaser from './ModalFranceConnectTeaser';
import useFeatureFlag from '@hooks/useFeatureFlag';
import ModalFranceConnectConfiguration from './ModalFranceConnectConfiguration';
import { toggleSSO } from '@mutations/ToggleSSOConfigurationStatusMutation';

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
    const [hover, setHover] = useState(false);
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);
    const organizationName = useFragment(ORGANIZATION_NAME_FRAGMENT, organizationNameFragment);
    const hasFranceConnect = useFeatureFlag('login_franceconnect');

    return (
        <CardSSO onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <CardSSO.Header>{hover ? <ModalFranceConnectConfiguration ssoConfiguration={ssoConfiguration} ssoConnectionName={ssoConnectionName} isEditing /> : logo}</CardSSO.Header>
            <CardSSO.Body>
                <Text as="label" color="gray.900" fontSize={3} htmlFor="sso-france-connect">
                    FranceConnect
                </Text>

                {hasFranceConnect ?
                    (ssoConfiguration ? (
                    <Switch id="sso-france-connect" checked={ssoConfiguration.enabled} onChange={() => toggleSSO(ssoConfiguration.id, ssoConfiguration.enabled, ssoConfiguration.__typename) }/>
                ) : <ModalFranceConnectConfiguration ssoConfiguration={ssoConfiguration} ssoConnectionName={ssoConnectionName} />)  : (
                    <ModalFranceConnectTeaser organizationName={organizationName?.value || ''} />
                )}
            </CardSSO.Body>
        </CardSSO>
    );
};

export default CardFranceConnect;
