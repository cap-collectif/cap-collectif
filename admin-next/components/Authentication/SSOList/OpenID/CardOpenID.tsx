import { FC, useState } from 'react';
import CardSSO from '@ui/CardSSO/CardSSO';
import { ButtonGroup, Checkbox, Switch, Text } from '@cap-collectif/ui';
import logo from './Logo';
import { graphql, useFragment } from 'react-relay';
import type { CardOpenID_ssoConfiguration$key } from '@relay/CardOpenID_ssoConfiguration.graphql';
import ModalOpenIDConfiguration from './ModalOpenIDConfiguration';
import ModalOpenIDDelete from './ModalOpenIDDelete';
import { toggleSSO } from '@mutations/ToggleSSOConfigurationStatusMutation';

type CardOpenIDProps = {
    readonly ssoConfiguration: CardOpenID_ssoConfiguration$key,
    readonly ssoConnectionName: string
};

const FRAGMENT = graphql`
    fragment CardOpenID_ssoConfiguration on Oauth2SSOConfiguration {
        id
        enabled
        name
        __typename
        ...ModalOpenIDConfiguration_ssoConfiguration
        ...ModalOpenIDDelete_ssoConfiguration
    }
`;

const CardOpenID: FC<CardOpenIDProps> = ({ ssoConfiguration: ssoConfigurationFragment, ssoConnectionName }) => {
    const [hover, setHover] = useState(false);
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);

    return (
        <CardSSO onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <CardSSO.Header>
                {hover ?
                    <ButtonGroup>
                        <ModalOpenIDConfiguration ssoConfiguration={ssoConfiguration} ssoConnectionName={ssoConnectionName} isEditing />
                        <ModalOpenIDDelete ssoConfiguration={ssoConfiguration} />
                    </ButtonGroup> : logo}
            </CardSSO.Header>

            <CardSSO.Body>
                <Text as="label" color="gray.900" fontSize={3} htmlFor={`sso-${ssoConfiguration.id}`}>
                    {ssoConfiguration.name}
                </Text>

                <Switch
                    id={`sso-${ssoConfiguration.id}`}
                    checked={ssoConfiguration.enabled}
                    onChange={() => toggleSSO(ssoConfiguration.id, ssoConfiguration.enabled, ssoConfiguration.__typename)} />
            </CardSSO.Body>
        </CardSSO>
    );
};

export default CardOpenID;
