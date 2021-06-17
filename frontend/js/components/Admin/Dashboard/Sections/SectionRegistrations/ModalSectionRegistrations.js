// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import type { ModalSectionRegistrations_registrations$key } from '~relay/ModalSectionRegistrations_registrations.graphql';
import LineChart from '~ui/Dashboard/LineChart';
import formatValues from '~/components/Admin/Dashboard/Sections/formatValues';
import ProjectPeriod from '~/components/Admin/Dashboard/Sections/ProjectPeriod';

type Props = {|
  +show: boolean,
  +onClose: () => void,
  +registrations: ModalSectionRegistrations_registrations$key,
|};

const FRAGMENT = graphql`
  fragment ModalSectionRegistrations_registrations on PlatformAnalyticsRegistrations {
    totalCount
    values {
      key
      totalCount
    }
  }
`;

const ModalSectionRegistrations = ({
  show,
  onClose,
  registrations: registrationsFragment,
}: Props): React.Node => {
  const registrations = useFragment(FRAGMENT, registrationsFragment);
  const intl = useIntl();

  return (
    <Modal
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage(
        { id: 'global.registration.dynamic' },
        { num: registrations.totalCount },
      )}>
      <Modal.Header>
        <Heading as="h4" color="blue.900">
          {registrations.totalCount}{' '}
          {intl.formatMessage(
            { id: 'global.registration.dynamic' },
            { num: registrations.totalCount },
          )}
        </Heading>
      </Modal.Header>
      <Modal.Body spacing={5}>
        <ProjectPeriod />

        <LineChart
          data={formatValues(registrations.values, intl)}
          label={intl.formatMessage(
            { id: 'global.registration.dynamic' },
            { num: registrations.totalCount },
          )}
          height="270px"
          withAxis
          withGrid
        />
      </Modal.Body>
    </Modal>
  );
};

export default ModalSectionRegistrations;
