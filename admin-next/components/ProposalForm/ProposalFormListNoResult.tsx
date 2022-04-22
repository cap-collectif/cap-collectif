import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { Flex, Heading, SpotIcon, CapUISpotIcon, CapUISpotIconSize, Text } from '@cap-collectif/ui';
import ModalCreateProposalForm from './ModalCreateProposalForm';
import type { ProposalFormListNoResult_viewer$key } from '@relay/ProposalFormListNoResult_viewer.graphql';

const FRAGMENT = graphql`
    fragment ProposalFormListNoResult_viewer on User {
        ...ModalCreateProposalForm_viewer
    }
`;

type ProposalFormListNoResultProps = {
    viewer: ProposalFormListNoResult_viewer$key,
    term: string,
    orderBy: string,
    hasProposalForm: boolean,
};

const ProposalFormListNoResult: React.FC<ProposalFormListNoResultProps> = ({
    viewer: viewerFragment,
    term,
    orderBy,
    hasProposalForm,
}) => {
    const intl = useIntl();
    const viewer = useFragment<ProposalFormListNoResult_viewer$key>(FRAGMENT, viewerFragment);

    return (
        <Flex direction="row" spacing={8} bg="white" py="96px" px="111px" borderRadius="normal">
            <SpotIcon name={CapUISpotIcon.FORM} size={CapUISpotIconSize.Lg} />

            <Flex direction="column" color="blue.900" align="flex-start" maxWidth="300px">
                <Heading as="h3" mb={2}>
                    {intl.formatMessage({ id: 'publish-first-proposal-form' })}
                </Heading>
                <Text mb={8}>{intl.formatMessage({ id: 'proposal-form-description' })}</Text>

                <ModalCreateProposalForm
                    viewer={viewer}
                    term={term}
                    orderBy={orderBy}
                    hasProposalForm={hasProposalForm}
                    noResult
                />
            </Flex>
        </Flex>
    );
};

export default ProposalFormListNoResult;
