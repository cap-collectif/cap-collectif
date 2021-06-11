// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import css from '@styled-system/css';
import { useDisclosure } from '@liinkiing/react-hooks';
import SmallChart from '~ui/Dashboard/SmallChart';
import type { SectionContributors_contributors$key } from '~relay/SectionContributors_contributors.graphql';
import formatValues from '../formatValues';
import ModalSectionContributors from './ModalSectionContributors';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  +contributors: SectionContributors_contributors$key,
|};

const FRAGMENT = graphql`
  fragment SectionContributors_contributors on PlatformAnalyticsContributors {
    totalCount
    values {
      key
      totalCount
    }
    ...ModalSectionContributors_contributors
  }
`;

const SectionContributors = ({ contributors: contributorsFragment }: Props): React.Node => {
  const contributors = useFragment(FRAGMENT, contributorsFragment);
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
          count={contributors.totalCount}
          label={intl.formatMessage(
            { id: 'global.contributor.dynamic' },
            { num: contributors.totalCount },
          )}
          data={formatValues(contributors.values, intl)}
        />
      </AppBox>

      <ModalSectionContributors show={isOpen} onClose={onClose} contributors={contributors} />
    </>
  );
};

export default SectionContributors;
