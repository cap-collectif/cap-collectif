import { Section } from '@ui/Section';
import type { FC } from 'react';
import { useIntl } from 'react-intl';
import SSOList from './SSOList/SSOList';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { AuthenticationMethodsQuery } from '@relay/AuthenticationMethodsQuery.graphql';
import { Flex } from '@cap-collectif/ui';
import SSOToggleList from './SSOToggleList/SSOToggleList';
import { useAppContext } from '../AppProvider/App.context';
import AddSSO from './AddSSO';

const QUERY = graphql`
    query AuthenticationMethodsQuery {
        ...SSOList_query
        ...AddSSO_query
    }
`;

const AuthenticationMethods: FC = () => {
    const intl = useIntl();
    const query = useLazyLoadQuery<AuthenticationMethodsQuery>(QUERY, {});
    const { viewerSession } = useAppContext();

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

                <AddSSO query={query} />
            </Flex>

            <SSOList query={query} />

            {viewerSession.isSuperAdmin && <SSOToggleList />}
        </Section>
    );
};

export default AuthenticationMethods;
