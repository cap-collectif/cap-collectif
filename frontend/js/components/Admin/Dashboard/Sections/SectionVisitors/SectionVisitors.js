// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import css from '@styled-system/css';
import { useDisclosure } from '@liinkiing/react-hooks';
import SmallChart from '~ui/Dashboard/SmallChart';
import type { SectionVisitors_visitors$key } from '~relay/SectionVisitors_visitors.graphql';
import formatValues from '../formatValues';
import AppBox from '~ui/Primitives/AppBox';
import ModalSectionVisitors from '~/components/Admin/Dashboard/Sections/SectionVisitors/ModalSectionVisitors';

type Props = {|
  +visitors: SectionVisitors_visitors$key,
|};

const FRAGMENT = graphql`
  fragment SectionVisitors_visitors on PlatformAnalyticsVisitors {
    totalCount
    values {
      key
      totalCount
    }
    ...ModalSectionVisitors_visitors
  }
`;

const SectionVisitors = ({ visitors: visitorsFragment }: Props): React.Node => {
  const visitors = useFragment(FRAGMENT, visitorsFragment);
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
          count={visitors.totalCount}
          label={intl.formatMessage({ id: 'global.visitor.dynamic' }, { num: visitors.totalCount })}
          data={formatValues(visitors.values, intl)}
        />
      </AppBox>

      <ModalSectionVisitors show={isOpen} onClose={onClose} visitors={visitors} />
    </>
  );
};

export default SectionVisitors;
