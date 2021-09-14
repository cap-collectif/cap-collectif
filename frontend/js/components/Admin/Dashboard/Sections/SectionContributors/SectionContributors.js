// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import css from '@styled-system/css';
import { useDisclosure } from '@liinkiing/react-hooks';
import SmallChart from '~ui/Dashboard/SmallChart';
import type { SectionContributors_contributors$key } from '~relay/SectionContributors_contributors.graphql';
import type { SectionContributors_anonymousContributors$key } from '~relay/SectionContributors_anonymousContributors.graphql';
import formatValues from '../formatValues';
import ModalSectionContributors from './ModalSectionContributors';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  +contributors: ?SectionContributors_contributors$key,
  +anonymousContributors: ?SectionContributors_anonymousContributors$key,
|};

const CONTRIBUTORS_FRAGMENT = graphql`
  fragment SectionContributors_contributors on PlatformAnalyticsContributors {
    totalCount
    values {
      key
      totalCount
    }
    ...ModalSectionContributors_contributors
  }
`;

const ANONYMOUS_CONTRIBUTORS_FRAGMENT = graphql`
  fragment SectionContributors_anonymousContributors on PlatformAnalyticsAnonymousContributors {
    totalCount
    values {
      key
      totalCount
    }
    ...ModalSectionContributors_anonymousContributors
  }
`;

const SectionContributors = ({
  contributors: contributorsFragment,
  anonymousContributors: anonymousContributorsFragment,
}: Props): React.Node => {
  const contributors = useFragment(CONTRIBUTORS_FRAGMENT, contributorsFragment);
  const anonymousContributors = useFragment(
    ANONYMOUS_CONTRIBUTORS_FRAGMENT,
    anonymousContributorsFragment,
  );
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const contributorsTotalCount = contributors?.totalCount ?? 0;
  const anonymousContributorsTotalCount = anonymousContributors?.totalCount ?? 0;
  const contributorsValues = contributors?.values ?? [];
  const anonymousContributorsValues = anonymousContributors?.values ?? [];

  if (!contributors && !anonymousContributors) {
    return null;
  }

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
        })}
        flex={1}>
        <SmallChart
          count={contributorsTotalCount + anonymousContributorsTotalCount}
          label={intl.formatMessage(
            { id: 'global.contributor.dynamic' },
            { num: contributorsTotalCount + anonymousContributorsTotalCount },
          )}
          data={formatValues([...contributorsValues, ...anonymousContributorsValues], intl)}
        />
      </AppBox>

      <ModalSectionContributors
        show={isOpen}
        onClose={onClose}
        anonymousContributors={anonymousContributors}
        contributors={contributors}
      />
    </>
  );
};

export default SectionContributors;
