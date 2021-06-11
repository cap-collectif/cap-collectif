// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import type { ModalSectionVisitors_visitors$key } from '~relay/ModalSectionVisitors_visitors.graphql';
import InfoMessage from '~ds/InfoMessage/InfoMessage';
import LineChart from '~ui/Dashboard/LineChart';
import formatValues from '~/components/Admin/Dashboard/Sections/formatValues';
import ProjectPeriod from '~/components/Admin/Dashboard/Sections/ProjectPeriod';

type Props = {|
  +show: boolean,
  +onClose: () => void,
  +visitors: ModalSectionVisitors_visitors$key,
|};

const FRAGMENT = graphql`
  fragment ModalSectionVisitors_visitors on PlatformAnalyticsVisitors {
    totalCount
    values {
      key
      totalCount
    }
  }
`;

const ModalSectionVisitors = ({ show, onClose, visitors: visitorsFragment }: Props): React.Node => {
  const visitors = useFragment(FRAGMENT, visitorsFragment);
  const intl = useIntl();

  return (
    <Modal
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage(
        { id: 'global.visitor.dynamic' },
        { num: visitors.totalCount },
      )}>
      <Modal.Header>
        <Heading as="h4" color="blue.900">
          {visitors.totalCount}{' '}
          {intl.formatMessage({ id: 'global.visitor.dynamic' }, { num: visitors.totalCount })}
        </Heading>
      </Modal.Header>
      <Modal.Body spacing={5}>
        <ProjectPeriod />

        <InfoMessage variant="info">
          <InfoMessage.Content>
            {intl.formatMessage({ id: 'definition-visitor-word' })}
          </InfoMessage.Content>
        </InfoMessage>

        <LineChart
          data={formatValues(visitors.values, intl)}
          label={intl.formatMessage({ id: 'global.visitor.dynamic' }, { num: visitors.totalCount })}
          height="270px"
          withAxis
          withGrid
        />
      </Modal.Body>
    </Modal>
  );
};

export default ModalSectionVisitors;
