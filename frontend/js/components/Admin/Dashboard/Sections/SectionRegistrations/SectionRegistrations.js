// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import css from '@styled-system/css';
import { useDisclosure } from '@liinkiing/react-hooks';
import SmallChart from '~ui/Dashboard/SmallChart';
import type { SectionRegistrations_registrations$key } from '~relay/SectionRegistrations_registrations.graphql';
import formatValues from '../formatValues';
import AppBox from '~ui/Primitives/AppBox';
import ModalSectionRegistrations from './ModalSectionRegistrations';

type Props = {|
  +registrations: SectionRegistrations_registrations$key,
|};

const FRAGMENT = graphql`
  fragment SectionRegistrations_registrations on PlatformAnalyticsRegistrations {
    totalCount
    values {
      key
      totalCount
    }
    ...ModalSectionRegistrations_registrations
  }
`;

const SectionRegistrations = ({ registrations: registrationsFragment }: Props): React.Node => {
  const registrations = useFragment(FRAGMENT, registrationsFragment);
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
          count={registrations.totalCount}
          label={intl.formatMessage(
            { id: 'global.registration.dynamic' },
            { num: registrations.totalCount },
          )}
          data={formatValues(registrations.values, intl)}
        />
      </AppBox>

      <ModalSectionRegistrations show={isOpen} onClose={onClose} registrations={registrations} />
    </>
  );
};

export default SectionRegistrations;
