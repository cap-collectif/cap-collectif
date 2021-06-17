// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import type { ModalSectionMostVisitedPages_mostVisitedPages$key } from '~relay/ModalSectionMostVisitedPages_mostVisitedPages.graphql';
import ViewChart from '~ui/Dashboard/ViewChart';

type Props = {|
  +show: boolean,
  +onClose: () => void,
  +mostVisitedPages: ModalSectionMostVisitedPages_mostVisitedPages$key,
|};

const FRAGMENT = graphql`
  fragment ModalSectionMostVisitedPages_mostVisitedPages on PlatformAnalyticsMostVisitedPages {
    totalCount
    values {
      key
      totalCount
    }
  }
`;

const ModalSectionMostVisitedPages = ({
  show,
  onClose,
  mostVisitedPages: mostVisitedPagesFragment,
}: Props): React.Node => {
  const mostVisitedPages = useFragment(FRAGMENT, mostVisitedPagesFragment);
  const intl = useIntl();

  return (
    <Modal
      show={show}
      onClose={onClose}
      id="modal-section-contributors"
      ariaLabel={intl.formatMessage({ id: 'most-visited-pages' })}>
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
            label={value.key}
          />
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default ModalSectionMostVisitedPages;
