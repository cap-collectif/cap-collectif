// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import css from '@styled-system/css';
import { useDisclosure } from '@liinkiing/react-hooks';
import SmallChart from '~ui/Dashboard/SmallChart';
import type { SectionPageViews_pageViews$key } from '~relay/SectionPageViews_pageViews.graphql';
import formatValues from '../formatValues';
import ModalSectionPageViews from './ModalSectionPageViews';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  +pageViews: SectionPageViews_pageViews$key,
|};

const FRAGMENT = graphql`
  fragment SectionPageViews_pageViews on PlatformAnalyticsPageViews {
    totalCount
    values {
      key
      totalCount
    }
    ...ModalSectionPageViews_pageViews
  }
`;

const SectionPageViews = ({ pageViews: pageViewsFragment }: Props): React.Node => {
  const pageViews = useFragment(FRAGMENT, pageViewsFragment);
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);

  return (
    <>
      <AppBox
        as="button"
        type="button"
        bg="transparent"
        border="none"
        p={0}
        m={0}
        onClick={onOpen}
        css={css({
          '& > div': {
            height: '100%',
          },
        })}>
        <SmallChart
          count={pageViews.totalCount}
          label={intl.formatMessage(
            { id: 'global.page.views.dynamic' },
            { num: pageViews.totalCount },
          )}
          data={formatValues(pageViews.values, intl)}
        />
      </AppBox>

      <ModalSectionPageViews show={isOpen} onClose={onClose} pageViews={pageViews} />
    </>
  );
};

export default SectionPageViews;
