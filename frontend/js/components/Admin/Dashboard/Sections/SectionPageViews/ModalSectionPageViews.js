// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Modal from '~ds/Modal/Modal';
import Heading from '~ui/Primitives/Heading';
import type { ModalSectionPageViews_pageViews$key } from '~relay/ModalSectionPageViews_pageViews.graphql';
import InfoMessage from '~ds/InfoMessage/InfoMessage';
import LineChart from '~ui/Dashboard/LineChart';
import formatValues from '~/components/Admin/Dashboard/Sections/formatValues';
import ProjectPeriod from '~/components/Admin/Dashboard/Sections/ProjectPeriod';

type Props = {|
  +show: boolean,
  +onClose: () => void,
  +pageViews: ModalSectionPageViews_pageViews$key,
|};

const FRAGMENT = graphql`
  fragment ModalSectionPageViews_pageViews on PlatformAnalyticsPageViews {
    totalCount
    values {
      key
      totalCount
    }
  }
`;

const ModalSectionPageViews = ({
  show,
  onClose,
  pageViews: pageViewsFragment,
}: Props): React.Node => {
  const pageViews = useFragment(FRAGMENT, pageViewsFragment);
  const intl = useIntl();

  return (
    <Modal
      show={show}
      onClose={onClose}
      ariaLabel={intl.formatMessage(
        { id: 'global.page.views.dynamic' },
        { num: pageViews.totalCount },
      )}>
      <Modal.Header>
        <Heading as="h4" color="blue.900">
          {pageViews.totalCount}{' '}
          {intl.formatMessage({ id: 'global.page.views.dynamic' }, { num: pageViews.totalCount })}
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
