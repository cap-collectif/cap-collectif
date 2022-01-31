import { FC, useState } from 'react';
import CardSSO from '@ui/CardSSO/CardSSO';
import { Switch, Text } from '@cap-collectif/ui';
import logo from './Logo';
import { graphql, useFragment } from 'react-relay';
import type { CardFacebook_ssoConfiguration$key } from '@relay/CardFacebook_ssoConfiguration.graphql';
import ModalFacebookConfiguration from './ModalFacebookConfiguration';
import { toggleFacebook } from '@mutations/UpdateFacebookSSOConfigurationMutation';

type CardFacebookProps = {
    readonly ssoConfiguration: CardFacebook_ssoConfiguration$key | null,
    readonly ssoConnectionName: string
};

const FRAGMENT = graphql`
    fragment CardFacebook_ssoConfiguration on FacebookSSOConfiguration {
        __typename
        clientId
        secret
        enabled
        ...ModalFacebookConfiguration_ssoConfiguration
    }
`;

const CardFacebook: FC<CardFacebookProps> = ({ ssoConfiguration: ssoConfigurationFragment, ssoConnectionName }) => {
    const [hover, setHover] = useState(false);
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);

    return (
        <CardSSO onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <CardSSO.Header>{hover ? <ModalFacebookConfiguration ssoConfiguration={ssoConfiguration} ssoConnectionName={ssoConnectionName} isEditing /> : logo}</CardSSO.Header>
            <CardSSO.Body>
                <Text as="label" color="gray.900" fontSize={3} htmlFor="sso-facebook">
                    Facebook
                </Text>

                {ssoConfiguration ? (
                    <Switch id="sso-facebook" checked={ssoConfiguration.enabled} onChange={() => toggleFacebook(ssoConfiguration, ssoConnectionName) }/>
                ) : (
                    <ModalFacebookConfiguration ssoConfiguration={null} ssoConnectionName={ssoConnectionName} />
                )}
            </CardSSO.Body>
        </CardSSO>
    );
};

export default CardFacebook;
