import { Section } from '@ui/Section';
import type { FC } from 'react';
import { useIntl } from 'react-intl';
import SSOList from './SSOList/SSOList';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { AuthenticationMethodsQuery } from '@relay/AuthenticationMethodsQuery.graphql';
import { Box, Flex } from '@cap-collectif/ui';
import ModalOpenIDConfiguration from './SSOList/OpenID/ModalOpenIDConfiguration';
import SSOToggleList from './SSOToggleList/SSOToggleList';
import { useAppContext } from '../AppProvider/App.context';
import useFeatureFlag from '@hooks/useFeatureFlag';

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

    return (
        <Section flex={2}>
            <Flex direction="row" justify="space-between" align="flex-start">
                <Box>
                    <Section.Title>
                        {intl.formatMessage({ id: 'authentication-methods' })}
                    </Section.Title>

                    <Section.Description>
                        {intl.formatMessage({ id: 'authentication-methods-description' })}
                    </Section.Description>
                </Box>

                {hasFeatureOpenId && (
                    <ModalOpenIDConfiguration
                        ssoConfiguration={null}
                        ssoConnectionName="client:root:__SSOList_ssoConfigurations_connection"
                    />
                )}
            </Flex>

            <SSOList query={query} />

            {viewerSession.isSuperAdmin && <SSOToggleList />}
        </Section>
    );
};

export default AuthenticationMethods;
