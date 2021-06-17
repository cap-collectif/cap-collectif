// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useDisclosure } from '@liinkiing/react-hooks';
import css from '@styled-system/css';
import { useIntl } from 'react-intl';
import type { SectionMostVisitedPages_mostVisitedPages$key } from '~relay/SectionMostVisitedPages_mostVisitedPages.graphql';
import ViewChart from '~ui/Dashboard/ViewChart';
import Section from '~ui/Dashboard/Section';
import ModalSectionMostVisitedPages from './ModalSectionMostVisitedPages';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  +mostVisitedPages: SectionMostVisitedPages_mostVisitedPages$key,
|};

const FRAGMENT = graphql`
  fragment SectionMostVisitedPages_mostVisitedPages on PlatformAnalyticsMostVisitedPages {
    totalCount
    values {
      key
      totalCount
    }
    ...ModalSectionMostVisitedPages_mostVisitedPages
  }
`;

const SectionMostVisitedPages = ({
  mostVisitedPages: mostVisitedPagesFragment,
}: Props): React.Node => {
  const mostVisitedPages = useFragment(FRAGMENT, mostVisitedPagesFragment);
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
        textAlign="left"
        css={css({
          '& > div': {
            height: '100%',
          },
        })}>
        <Section label={intl.formatMessage({ id: 'most-visited-pages' })}>
          {mostVisitedPages.values.slice(0, 3).map((value, idx) => (
            <ViewChart
              key={value.key}
              level={idx + 1}
              total={mostVisitedPages.totalCount}
              count={value.totalCount}
              label={value.key}
            />
          ))}
        </Section>
      </AppBox>

      <ModalSectionMostVisitedPages
        show={isOpen}
        onClose={onClose}
        mostVisitedPages={mostVisitedPages}
      />
    </>
  );
};

export default SectionMostVisitedPages;
