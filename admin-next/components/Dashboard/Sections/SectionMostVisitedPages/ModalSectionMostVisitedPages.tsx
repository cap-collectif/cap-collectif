import type { FC } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { Modal, Heading, CapUIModalSize } from '@cap-collectif/ui';
import type { ModalSectionMostVisitedPages_mostVisitedPages$key } from '@relay/ModalSectionMostVisitedPages_mostVisitedPages.graphql';
import ViewChart from '@ui/Charts/ViewChart/ViewChart';

interface ModalSectionMostVisitedPagesProps {
    show: boolean;
    onClose: () => void;
    mostVisitedPages: ModalSectionMostVisitedPages_mostVisitedPages$key;
}

const FRAGMENT = graphql`
    fragment ModalSectionMostVisitedPages_mostVisitedPages on PlatformAnalyticsMostVisitedPages {
        totalCount
        values {
            key
            totalCount
        }
    }
`;

export const formatLabel = (label: string): string => {
    const labelSplitted = label.split('/');
    return labelSplitted[labelSplitted.length - 1];
};

const ModalSectionMostVisitedPages: FC<ModalSectionMostVisitedPagesProps> = ({
    show,
    onClose,
    mostVisitedPages: mostVisitedPagesFragment,
}) => {
    const mostVisitedPages = useFragment(FRAGMENT, mostVisitedPagesFragment);
    const intl = useIntl();

    return (
        <Modal
            show={show}
            onClose={onClose}
            id="modal-section-most-visited-pages"
            ariaLabel={intl.formatMessage({ id: 'most-visited-pages' })}
            size={CapUIModalSize.Lg}>
            <Modal.Header>
                <Heading as="h4" color="blue.900">
                    {intl.formatMessage({ id: 'most-visited-pages' })}
                </Heading>
            </Modal.Header>
            <Modal.Body spacing={5}>
                {mostVisitedPages.values.map((value, idx) => (
                    <ViewChart
                        key={value.key}
                        level={idx + 1}
                        total={mostVisitedPages.totalCount}
                        count={value.totalCount}
                        label={
                            value.key === '/'
                                ? intl.formatMessage({ id: 'navbar.homepage' })
                                : `/${formatLabel(value.key)}`
                        }
                        url={value.key}
                    />
                ))}
            </Modal.Body>
        </Modal>
    );
};

export default ModalSectionMostVisitedPages;
