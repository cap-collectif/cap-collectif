// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import type { ModalSectionContributors_contributors$key } from '~relay/ModalSectionContributors_contributors.graphql';
import InfoMessage from '~ds/InfoMessage/InfoMessage';
import LineChart from '~ui/Dashboard/LineChart';
import formatValues from '~/components/Admin/Dashboard/Sections/formatValues';
import ProjectPeriod from '~/components/Admin/Dashboard/Sections/ProjectPeriod';

type Props = {|
  +show: boolean,
  +onClose: () => void,
  +contributors: ModalSectionContributors_contributors$key,
|};

const FRAGMENT = graphql`
  fragment ModalSectionContributors_contributors on PlatformAnalyticsContributors {
    totalCount
    values {
      key
      totalCount
    }
  }
`;

const ModalSectionContributors = ({
  show,
  onClose,
  contributors: contributorsFragment,
}: Props): React.Node => {
  const contributors = useFragment(FRAGMENT, contributorsFragment);
  const intl = useIntl();

  return (
    <Modal
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage(
        { id: 'global.contributor.dynamic' },
        { num: contributors.totalCount },
      )}>
      <Modal.Header>
        <Heading as="h4" color="blue.900">
          {contributors.totalCount}{' '}
          {intl.formatMessage(
            { id: 'global.contributor.dynamic' },
            { num: contributors.totalCount },
          )}
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
          data={formatValues(contributors.values, intl)}
          label={intl.formatMessage(
            { id: 'global.contributor.dynamic' },
            { num: contributors.totalCount },
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
