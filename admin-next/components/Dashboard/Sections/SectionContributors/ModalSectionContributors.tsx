import type { FC } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { Modal, InfoMessage, Heading } from '@cap-collectif/ui';
import type { ModalSectionContributors_contributors$key } from '@relay/ModalSectionContributors_contributors.graphql';
import type { ModalSectionContributors_anonymousContributors$key } from '@relay/ModalSectionContributors_anonymousContributors.graphql';
import LineChart from '@ui/Charts/LineChart/LineChart';
import formatValues from '~/components/Admin/Dashboard/Sections/formatValues';
import ProjectPeriod from '../../ProjectPeriod';

interface ModalSectionContributorsProps {
    show: boolean;
    onClose: () => void;
    contributors: ModalSectionContributors_contributors$key | null;
    anonymousContributors: ModalSectionContributors_anonymousContributors$key | null;
}

const CONTRIBUTORS_FRAGMENT = graphql`
    fragment ModalSectionContributors_contributors on PlatformAnalyticsContributors {
        totalCount
        values {
            key
            totalCount
        }
    }
`;

const ANONYMOUS_CONTRIBUTORS_FRAGMENT = graphql`
    fragment ModalSectionContributors_anonymousContributors on PlatformAnalyticsAnonymousContributors {
        totalCount
        values {
            key
            totalCount
        }
    }
`;

const ModalSectionContributors: FC<ModalSectionContributorsProps> = ({
    show,
    onClose,
    contributors: contributorsFragment,
    anonymousContributors: anonymousContributorsFragment,
}) => {
    const contributors = useFragment(CONTRIBUTORS_FRAGMENT, contributorsFragment);
    const anonymousContributors = useFragment(
        ANONYMOUS_CONTRIBUTORS_FRAGMENT,
        anonymousContributorsFragment,
    );
    const intl = useIntl();

    if (!contributors && !anonymousContributors) return null;

    const totalContributorsCount =
        (contributors?.totalCount || 0) + (anonymousContributors?.totalCount || 0);

    const totalContributorsValues = [
        ...(contributors?.values || []),
        ...(anonymousContributors?.values || []),
    ];

    return (
        <Modal
            show={show}
            onClose={onClose}
            id="modal-section-contributors"
            ariaLabel={intl.formatMessage(
                { id: 'global.contributor.dynamic' },
                { num: totalContributorsCount },
            )}>
            <Modal.Header>
                <Heading as="h4" color="blue.900">
                    {totalContributorsCount}{' '}
                    {intl.formatMessage(
                        { id: 'global.contributor.dynamic' },
                        { num: totalContributorsCount },
                    )}
                </Heading>
            </Modal.Header>
            <Modal.Body spacing={5}>
                <ProjectPeriod />

                <InfoMessage variant="info">
                    <InfoMessage.Title>
                        {intl.formatMessage({ id: 'additional-information' })}
                    </InfoMessage.Title>
                    <InfoMessage.Content>
                        {intl.formatMessage({ id: 'definition-participant-word' })}
                    </InfoMessage.Content>
                </InfoMessage>

                <LineChart
                    data={formatValues(totalContributorsValues, intl)}
                    label={intl.formatMessage(
                        { id: 'global.contributor.dynamic' },
                        { num: totalContributorsCount },
                    )}
                    height="270px"
                    withAxis
                    withGrid
                />
            </Modal.Body>
        </Modal>
    );
};

export default ModalSectionContributors;
