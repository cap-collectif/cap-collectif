// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import InlineSelect from '~ds/InlineSelect';
import type { VoteState } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer';
import Button from '~ds/Button/Button';

type Props = {|
  +state: VoteState,
|};

const VoteHeaderTabPlaceholder = ({ state }: Props) => {
  const intl = useIntl();

  return (
    <Flex direction="row" justify="space-between" mb={8}>
      <InlineSelect value={state}>
        <InlineSelect.Choice value="PUBLISHED">
          {intl.formatMessage({ id: 'filter.count.status.published-masculine' }, { num: 0 })}
        </InlineSelect.Choice>
        <InlineSelect.Choice value="WAITING">
          {intl.formatMessage(
            {
              id: 'filter.count.status.awaiting',
            },
            { num: 0 },
          )}
        </InlineSelect.Choice>
      </InlineSelect>

      <Button
        variant="primary"
        variantColor="primary"
        variantSize="small"
        disabled
        aria-label={intl.formatMessage({ id: 'global.export' })}>
        {intl.formatMessage({ id: 'global.export' })}
      </Button>
    </Flex>
  );
};

export default VoteHeaderTabPlaceholder;
