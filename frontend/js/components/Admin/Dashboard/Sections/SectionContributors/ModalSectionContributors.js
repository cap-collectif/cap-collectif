// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import type { ModalSectionContributors_contributors$key } from '~relay/ModalSectionContributors_contributors.graphql';
import type { ModalSectionContributors_anonymousContributors$key } from '~relay/ModalSectionContributors_anonymousContributors.graphql';
import InfoMessage from '~ds/InfoMessage/InfoMessage';
import LineChart from '~ui/Dashboard/LineChart';
import formatValues from '~/components/Admin/Dashboard/Sections/formatValues';
import ProjectPeriod from '~/components/Admin/Dashboard/Sections/ProjectPeriod';

type Props = {|
  +show: boolean,
  +onClose: () => void,
  +contributors: ?ModalSectionContributors_contributors$key,
  +anonymousContributors: ?ModalSectionContributors_anonymousContributors$key,
|};

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

const ModalSectionContributors = ({
  show,
  onClose,
  contributors: contributorsFragment,
  anonymousContributors: anonymousContributorsFragment,
}: Props): React.Node => {
  const contributors = useFragment(CONTRIBUTORS_FRAGMENT, contributorsFragment);
  const anonymousContributors = useFragment(
    ANONYMOUS_CONTRIBUTORS_FRAGMENT,
    anonymousContributorsFragment,
  );
  const intl = useIntl();
  const contributorsTotalCount = contributors?.totalCount ?? 0;
  const anonymousContributorsTotalCount = anonymousContributors?.totalCount ?? 0;
  const anonymousContributorsValues = anonymousContributors?.values ?? [];
  const contributorsValues = contributors?.values ?? [];

  if (!(contributorsTotalCount > 0) && !(anonymousContributorsTotalCount > 0)) return null;

  return (
    <Modal
      show={show}
      onClose={onClose}
      id="modal-section-contributors"
      ariaLabel={intl.formatMessage(
        { id: 'global.contributor.dynamic' },
        { num: contributorsTotalCount + anonymousContributorsTotalCount },
      )}>
      <Modal.Header>
        <Heading as="h4" color="blue.900">
          {contributorsTotalCount + anonymousContributorsTotalCount}{' '}
          {intl.formatMessage(
            { id: 'global.contributor.dynamic' },
            { num: contributorsTotalCount + anonymousContributorsTotalCount },
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
          data={formatValues([...contributorsValues, ...anonymousContributorsValues], intl)}
          label={intl.formatMessage(
            { id: 'global.contributor.dynamic' },
            { num: contributorsTotalCount + anonymousContributorsTotalCount },
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
