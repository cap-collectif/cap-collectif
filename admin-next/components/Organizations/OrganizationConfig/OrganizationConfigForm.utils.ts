import { OrgIdQueryResponse } from '@relay/OrgIdQuery.graphql';
import { FormValues } from './OrganizationConfigForm';
import { IntlShape } from 'react-intl';
import { OrganizationConfigForm_organization$data } from '@relay/OrganizationConfigForm_organization.graphql';
import { OrganizationConfigFormMembers_organization$data } from '@relay/OrganizationConfigFormMembers_organization.graphql';
import { Member } from './OrganizationConfigFormMembers';

export const getInitialValues = (
    organization: OrganizationConfigForm_organization$data,
    intl: IntlShape,
): FormValues => {
    return {
        title:
            organization?.title || intl.formatMessage({ id: 'organisation.create.default.name' }),
        body: organization?.body || '',
        logo: organization?.logo,
        banner: organization?.banner || null,
        socialNetworks: {
            facebookUrl: organization?.socialNetworks?.facebookUrl || null,
            webPageUrl: organization?.socialNetworks?.webPageUrl || null,
            twitterUrl: organization?.socialNetworks?.twitterUrl || null,
        },
    };
};
export const getMemberList = (
    organization: OrganizationConfigFormMembers_organization$data,
): Member[] => {
    return [
        organization?.members?.edges
            ?.filter(Boolean)
            .map(edge => edge?.node)
            .filter(Boolean)
            .map(member => ({
                user: {
                    id: member?.user.id,
                    username: member?.user?.username || '',
                    email: member?.user?.email || '',
                },
                role: member?.role,
                status: 'ACCEPTED',
            })),
        organization.pendingOrganizationInvitations?.edges
            ?.filter(Boolean)
            .map(edge => edge?.node)
            .filter(Boolean)
            .map(pendingMember => ({
                user: {
                    username: pendingMember?.user?.username || '',
                    email: pendingMember?.user?.email || '',
                },
                email: pendingMember?.email,
                role: pendingMember?.role,
                status: 'PENDING',
                id: pendingMember.id,
            })),
    ].flat();
};
