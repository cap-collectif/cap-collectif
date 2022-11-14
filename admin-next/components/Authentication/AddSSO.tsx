import { FC, useState } from 'react';
import useFeatureFlag, { useFeatureFlags } from '@hooks/useFeatureFlag';
import { Button, CapUIIcon, Menu } from '@cap-collectif/ui';
import ModalOpenIDConfiguration from './SSOList/OpenID/ModalOpenIDConfiguration';
import ModalCasConfiguration from './SSOList/CAS/ModalCasConfiguration';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import { AddSSO_query$key } from '@relay/AddSSO_query.graphql';

type AddSSOProps = {
    query: AddSSO_query$key;
};

const FRAGMENT = graphql`
    fragment AddSSO_query on Query {
        ssoConfigurations(first: 100) @connection(key: "SSOList_ssoConfigurations", filters: []) {
            edges {
                node {
                    __typename
                }
            }
        }
    }
`;

const AddSSO: FC<AddSSOProps> = ({ query: queryFragment }) => {
    const { ssoConfigurations } = useFragment(FRAGMENT, queryFragment);
    const casConfiguration = ssoConfigurations.edges.find(
        edge => edge.node && ['CASSSOConfiguration'].includes(edge.node.__typename),
    );
    const intl = useIntl();
    const featureFlags = useFeatureFlags(['login_openid', 'login_cas']);
    const canCreateCAS = featureFlags.login_cas && undefined === casConfiguration;
    const [showOpenIdModal, setShowOpenIdModal] = useState<boolean>(false);
    const [showCasModal, setShowCasModal] = useState<boolean>(false);

    if (featureFlags.login_openid && canCreateCAS) {
        return (
            <>
                <Menu
                    disclosure={
                        <Button
                            variantColor="primary"
                            variant="secondary"
                            variantSize="small"
                            rightIcon={CapUIIcon.ArrowDown}>
                            {intl.formatMessage({ id: 'global.add' })}
                        </Button>
                    }>
                    <Menu.List>
                        <Menu.Item
                            onClick={() => {
                                setShowOpenIdModal(true);
                            }}>
                            OpenID
                        </Menu.Item>
                        <Menu.Item onClick={() => setShowCasModal(true)}>CAS</Menu.Item>
                    </Menu.List>
                </Menu>

                <ModalOpenIDConfiguration
                    ssoConfiguration={null}
                    ssoConnectionName="client:root:__SSOList_ssoConfigurations_connection"
                    isOpen={showOpenIdModal}
                    onClose={() => {
                        setShowOpenIdModal(false);
                    }}
                />

                <ModalCasConfiguration
                    ssoConfiguration={null}
                    ssoConnectionName="client:root:__SSOList_ssoConfigurations_connection"
                    isOpen={showCasModal}
                    onClose={() => {
                        setShowCasModal(false);
                    }}
                />
            </>
        );
    }

    if (featureFlags.login_openid) {
        return (
            <>
                <Button
                    variantColor="primary"
                    variant="secondary"
                    variantSize="small"
                    onClick={() => {
                        setShowOpenIdModal(true);
                    }}>
                    {intl.formatMessage({ id: 'add-openid' })}
                </Button>

                <ModalOpenIDConfiguration
                    ssoConfiguration={null}
                    ssoConnectionName="client:root:__SSOList_ssoConfigurations_connection"
                    isOpen={showOpenIdModal}
                    onClose={() => {
                        setShowOpenIdModal(false);
                    }}
                />
            </>
        );
    }

    if (canCreateCAS) {
        return (
            <>
                <Button
                    variantColor="primary"
                    variant="secondary"
                    variantSize="small"
                    onClick={() => {
                        setShowCasModal(true);
                    }}>
                    {intl.formatMessage({ id: 'add-cas' })}
                </Button>

                <ModalCasConfiguration
                    ssoConfiguration={null}
                    ssoConnectionName="client:root:__SSOList_ssoConfigurations_connection"
                    isOpen={showCasModal}
                    onClose={() => {
                        setShowCasModal(false);
                    }}
                />
            </>
        );
    }

    return null;
};

export default AddSSO;
