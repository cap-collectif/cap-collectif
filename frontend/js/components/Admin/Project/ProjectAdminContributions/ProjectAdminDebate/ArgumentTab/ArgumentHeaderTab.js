// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { createFragmentContainer } from 'react-relay';
import { graphql } from 'relay-hooks';
import InlineSelect from '~ds/InlineSelect';
import type { ArgumentState } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer';
import Flex from '~ui/Primitives/Layout/Flex';
import Menu from '~ds/Menu/Menu';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import type { ForOrAgainstValue } from '~relay/DebateArgument_argument.graphql';
import Text from '~ui/Primitives/Text';
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context';
import { type ArgumentHeaderTab_debate } from '~relay/ArgumentHeaderTab_debate.graphql';

type Props = {|
  debate: ArgumentHeaderTab_debate,
|};

const ArgumentHeaderTab = ({ debate }: Props) => {
  const { parameters, dispatch } = useProjectAdminDebateContext();
  const intl = useIntl();
  const { debateArgumentsPublished, debateArgumentsWaiting, debateArgumentsTrashed } = debate;
  const exportUrl = `/debate/${debate.id}/download/arguments`;

  return (
    <Flex direction="row" justify="space-between" align="center">
      <InlineSelect
        value={parameters.filters.argument.state}
        onChange={value =>
          dispatch({ type: 'CHANGE_ARGUMENT_STATE', payload: ((value: any): ArgumentState) })
        }>
        <InlineSelect.Choice value="PUBLISHED">
          {intl.formatMessage(
            { id: 'filter.count.status.published' },
            { num: debateArgumentsPublished.totalCount },
          )}
        </InlineSelect.Choice>
        <InlineSelect.Choice value="WAITING">
          {intl.formatMessage(
            { id: 'filter.count.status.awaiting' },
            { count: debateArgumentsWaiting.totalCount },
          )}
        </InlineSelect.Choice>
        <InlineSelect.Choice value="TRASHED">
          {intl.formatMessage(
            { id: 'filter.count.status.trash' },
            { num: debateArgumentsTrashed.totalCount },
          )}
        </InlineSelect.Choice>
      </InlineSelect>

      <Flex direction="row" align="center" spacing={5}>
        <Menu>
          <Menu.Button as={React.Fragment}>
            <Button rightIcon={ICON_NAME.ARROW_DOWN_O} color="gray.500">
              {intl.formatMessage({ id: 'label_filters' })}
            </Button>
          </Menu.Button>

          <Menu.List>
            <Menu.OptionGroup
              value={((parameters.filters.argument.type: any): string[])}
              onChange={value =>
                dispatch({
                  type: 'CHANGE_ARGUMENT_TYPE',
                  payload: ((value: any): ForOrAgainstValue[]),
                })
              }
              type="checkbox"
              title={intl.formatMessage({ id: 'filter-arguments' })}>
              <Menu.OptionItem value="FOR">
                <Text color="gray.900">{intl.formatMessage({ id: 'global.for' })}</Text>
              </Menu.OptionItem>
              <Menu.OptionItem value="AGAINST">
                <Text color="gray.900">{intl.formatMessage({ id: 'global.against' })}</Text>
              </Menu.OptionItem>
            </Menu.OptionGroup>
          </Menu.List>
        </Menu>

        <Button
          variant="primary"
          variantColor="primary"
          variantSize="small"
          onClick={() => {
            window.location.href = exportUrl;
          }}
          aria-label={intl.formatMessage({ id: 'global.export' })}>
          {intl.formatMessage({ id: 'global.export' })}
        </Button>
      </Flex>
    </Flex>
  );
};

export default createFragmentContainer(ArgumentHeaderTab, {
  debate: graphql`
    fragment ArgumentHeaderTab_debate on Debate {
      id
      debateArgumentsPublished: arguments(first: 0, isPublished: true, isTrashed: false) {
        totalCount
      }
      debateArgumentsWaiting: arguments(first: 0, isPublished: false, isTrashed: false) {
        totalCount
      }
      debateArgumentsTrashed: arguments(first: 0, isPublished: true, isTrashed: true) {
        totalCount
      }
    }
  `,
});
