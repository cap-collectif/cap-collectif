import { Section } from '@ui/Section';
import type { FC } from 'react';
import { useIntl } from 'react-intl';
import SSOList from './SSOList/SSOList';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { AuthenticationMethodsQuery } from '@relay/AuthenticationMethodsQuery.graphql';
import { Button, Flex } from '@cap-collectif/ui';
import ModalOpenIDConfiguration from './SSOList/OpenID/ModalOpenIDConfiguration';
import SSOToggleList from './SSOToggleList/SSOToggleList';
import { useAppContext } from '../AppProvider/App.context';
import useFeatureFlag from '@hooks/useFeatureFlag';
import { useDisclosure } from '@liinkiing/react-hooks';

const QUERY = graphql`
    query AuthenticationMethodsQuery {
        ...SSOList_query
    }
`;

const AuthenticationMethods: FC = () => {
    const intl = useIntl();
    const query = useLazyLoadQuery<AuthenticationMethodsQuery>(QUERY, {});
    const { viewerSession } = useAppContext();
    const hasFeatureOpenId = useFeatureFlag('login_openid');
    const { isOpen, onClose, onOpen } = useDisclosure(false);

    return (
        <Section width="70%">
            <Flex direction="row" justify="space-between" align="flex-start" spacing={2}>
                <Flex direction="column" spacing={2}>
                    <Section.Title>
                        {intl.formatMessage({ id: 'authentication-methods' })}
                    </Section.Title>

                    <Section.Description>
                        {intl.formatMessage({ id: 'authentication-methods-description' })}
                    </Section.Description>
                </Flex>

                {hasFeatureOpenId && (
                    <>
                        <Button
                            variantColor="primary"
                            variant="secondary"
                            variantSize="small"
                            onClick={onOpen}>
                            {intl.formatMessage({ id: 'global.add' })}
                        </Button>

                        <ModalOpenIDConfiguration
                            ssoConfiguration={null}
                            ssoConnectionName="client:root:__SSOList_ssoConfigurations_connection"
                            isOpen={isOpen}
                            onClose={onClose}
                        />
                    </>
                )}
            </Flex>

            <SSOList query={query} />

            {viewerSession.isSuperAdmin && <SSOToggleList />}
        </Section>
    );
};

export default AuthenticationMethods;
