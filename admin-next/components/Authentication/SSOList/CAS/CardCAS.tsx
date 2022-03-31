import { FC, useState } from 'react';
import CardSSO from '@ui/CardSSO/CardSSO';
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Switch, Text } from '@cap-collectif/ui';
import logo from './Logo';
import { graphql, useFragment } from 'react-relay';
import type { CardCAS_ssoConfiguration$key } from '@relay/CardCAS_ssoConfiguration.graphql';
import ModalCasConfiguration from './ModalCasConfiguration';
import { useMultipleDisclosure } from '@liinkiing/react-hooks';
import { useIntl } from 'react-intl';
import { toggleSSO } from '@mutations/ToggleSSOConfigurationStatusMutation';
import ModalCASDelete from './ModalCASDelete';

type CardCASProps = {
    readonly ssoConfiguration: CardCAS_ssoConfiguration$key | null;
    readonly ssoConnectionName: string;
};

const FRAGMENT = graphql`
    fragment CardCAS_ssoConfiguration on CASSSOConfiguration {
        id
        __typename
        name
        enabled
        ...ModalCasConfiguration_ssoConfiguration
        ...ModalCASDelete_ssoConfiguration
    }
`;

const CardCAS: FC<CardCASProps> = ({
    ssoConfiguration: ssoConfigurationFragment,
    ssoConnectionName,
}) => {
    const intl = useIntl();
    const [hover, setHover] = useState(false);
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);
    const { onClose, onOpen, isOpen } = useMultipleDisclosure({
        'cas-configuration': false,
        'cas-delete': false,
    });

    return (
        <>
            <CardSSO onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <CardSSO.Header>
                    {hover ? (
                        <ButtonGroup>
                            <ButtonQuickAction
                                variantColor="blue"
                                icon={CapUIIcon.Pencil}
                                label={intl.formatMessage({ id: 'action_edit' })}
                                onClick={onOpen('cas-configuration')}
                            />
                            <ButtonQuickAction
                                variantColor="red"
                                icon={CapUIIcon.Trash}
                                label={intl.formatMessage({ id: 'action_delete' })}
                                onClick={onOpen('cas-delete')}
                            />
                        </ButtonGroup>
                    ) : (
                        logo
                    )}
                </CardSSO.Header>
                <CardSSO.Body spacing={2}>
                    <Text
                        as="label"
                        color="gray.900"
                        fontSize={3}
                        htmlFor={`sso-${ssoConfiguration.id}`}>
                        {ssoConfiguration.name}
                    </Text>

                    <Switch
                        id={`sso-${ssoConfiguration.id}`}
                        checked={ssoConfiguration.enabled}
                        onChange={() =>
                            toggleSSO(
                                ssoConfiguration.id,
                                ssoConfiguration.enabled,
                                ssoConfiguration.__typename,
                            )
                        }
                    />
                </CardSSO.Body>
            </CardSSO>

            <ModalCasConfiguration
                ssoConfiguration={ssoConfiguration}
                ssoConnectionName={ssoConnectionName}
                isEditing
                isOpen={isOpen('cas-configuration')}
                onClose={onClose('cas-configuration')}
            />

            <ModalCASDelete
                ssoConfiguration={ssoConfiguration}
                isOpen={isOpen('cas-delete')}
                onClose={onClose('cas-delete')}
            />
        </>
    );
};

export default CardCAS;
