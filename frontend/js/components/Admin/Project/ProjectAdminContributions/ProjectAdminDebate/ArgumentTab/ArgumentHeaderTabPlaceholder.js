// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import InlineSelect from '~ds/InlineSelect';
import type { ArgumentState } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer';
import { ICON_NAME } from '~ds/Icon/Icon';
import Button from '~ds/Button/Button';

type Props = {|
  +state: ArgumentState,
|};

const ArgumentHeaderTabPlaceholder = ({ state }: Props) => {
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
        <InlineSelect.Choice value="TRASHED">
          {intl.formatMessage({ id: 'global.trash' })}
        </InlineSelect.Choice>
      </InlineSelect>

      <Flex direction="row" align="center" spacing={5}>
        <Button rightIcon={ICON_NAME.ARROW_DOWN_O} color="gray.500" disabled>
          {intl.formatMessage({ id: 'label_filters' })}
        </Button>

        <Button
          variant="primary"
          variantColor="primary"
          variantSize="small"
          disabled
          aria-label={intl.formatMessage({ id: 'global.export' })}>
          {intl.formatMessage({ id: 'global.export' })}
        </Button>
      </Flex>
    </Flex>
  );
};

export default ArgumentHeaderTabPlaceholder;
