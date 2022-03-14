import type { FC } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { Modal, Heading, InfoMessage, CapUIModalSize } from '@cap-collectif/ui';
import type { ModalSectionPageViews_pageViews$key } from '@relay/ModalSectionPageViews_pageViews.graphql';
import LineChart from '@ui/Charts/LineChart/LineChart';
import formatValues from '../../formatValues';
import ProjectPeriod from '../../ProjectPeriod';

interface ModalSectionPageViewsProps {
    show: boolean;
    onClose: () => void;
    pageViews: ModalSectionPageViews_pageViews$key;
}

const FRAGMENT = graphql`
    fragment ModalSectionPageViews_pageViews on PlatformAnalyticsPageViews {
        totalCount
        values {
            key
            totalCount
        }
    }
`;

const ModalSectionPageViews: FC<ModalSectionPageViewsProps> = ({
    show,
    onClose,
    pageViews: pageViewsFragment,
}) => {
    const pageViews = useFragment(FRAGMENT, pageViewsFragment);
    const intl = useIntl();

    return (
        <Modal
            show={show}
            onClose={onClose}
            ariaLabel={intl.formatMessage(
                { id: 'global.page.views.dynamic' },
                { num: pageViews.totalCount },
            )}
            size={CapUIModalSize.Lg}>
            <Modal.Header>
                <Heading as="h4" color="blue.900">
                    {pageViews.totalCount}{' '}
                    {intl.formatMessage(
                        { id: 'global.page.views.dynamic' },
                        { num: pageViews.totalCount },
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
                        {intl.formatMessage({ id: 'definition-page-views-word' })}
                    </InfoMessage.Content>
                </InfoMessage>

                <LineChart
                    data={formatValues(pageViews.values, intl)}
                    label={intl.formatMessage(
                        { id: 'global.page.views.dynamic' },
                        { num: pageViews.totalCount },
                    )}
                    height="270px"
                    withAxis
                    withGrid
                />
            </Modal.Body>
        </Modal>
    );
};

export default ModalSectionPageViews;
