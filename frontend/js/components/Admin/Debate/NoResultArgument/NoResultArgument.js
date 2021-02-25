// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useIntl, type IntlShape } from 'react-intl';
import Text from '~ui/Primitives/Text';
import { useProjectAdminDebateContext } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.context';
import Flex from '~ui/Primitives/Layout/Flex';
import type { ArgumentState } from '~/components/Admin/Project/ProjectAdminContributions/ProjectAdminDebate/ProjectAdminDebate.reducer';
import { type ForOrAgainstValue } from '~relay/DebateArgument_argument.graphql';
import Tag from '~ds/Tag/Tag';
import { FontWeight } from '~ui/Primitives/constants';
import { type NoResultArgument_debate } from '~relay/NoResultArgument_debate.graphql';
import SpotIcon, { SPOT_ICON_NAME, SPOT_ICON_SIZE } from '~ds/SpotIcon/SpotIcon';

type Props = {|
  +debate: NoResultArgument_debate,
|};

const getSpotIconName = (state: ArgumentState) => {
  switch (state) {
    case 'PUBLISHED':
      return SPOT_ICON_NAME.PENCIL_SOFTWARE;
    case 'WAITING':
      return SPOT_ICON_NAME.EMAIL_TIMEOUT;
    case 'TRASHED':
      return SPOT_ICON_NAME.DELETE;
    default:
      // eslint-disable-next-line no-unused-expressions
      (state: empty);
      throw Error(`state ${state} is not a valid state`);
  }
};

const getWordingTitle = (
  state: ArgumentState,
  type: ForOrAgainstValue[],
  hasArgumentForOrAgainst: boolean,
  intl: IntlShape,
) => {
  if (state === 'PUBLISHED') {
    if (!hasArgumentForOrAgainst)
      return intl.formatMessage({ id: 'arguments-waiting-email-confirmation-display' });
    if (type.includes('AGAINST'))
      return intl.formatMessage({ id: 'no-argument-against-published' });
    if (type.includes('FOR')) return intl.formatMessage({ id: 'no-argument-for-published' });
  }

  if (state === 'WAITING') {
    if (!hasArgumentForOrAgainst)
      return intl.formatMessage({ id: 'arguments-waiting-email-confirmation-display' });
    if (type.includes('AGAINST')) return intl.formatMessage({ id: 'no-argument-against-pending' });
    if (type.includes('FOR')) return intl.formatMessage({ id: 'no-argument-for-pending' });
  }

  if (state === 'TRASHED') {
    if (!hasArgumentForOrAgainst) return intl.formatMessage({ id: 'arguments-moderate-display' });
    if (type.includes('AGAINST')) return intl.formatMessage({ id: 'no-argument-against-moderate' });
    if (type.includes('FOR')) return intl.formatMessage({ id: 'no-argument-for-moderate' });
  }
};

export const NoResultArgument = ({ debate }: Props) => {
  const { debateArgumentsFor, debateArgumentsAgainst } = debate;
  const { parameters, dispatch } = useProjectAdminDebateContext();
  const intl = useIntl();
  const hasArgumentForOrAgainst =
    debateArgumentsFor.totalCount > 0 || debateArgumentsAgainst.totalCount > 0;

  return (
    <Flex
      direction="column"
      spacing={2}
      align="center"
      textAlign="center"
      mt={parameters.filters.argument.state === 'WAITING' && hasArgumentForOrAgainst ? 12 : 0}>
      <SpotIcon
        name={getSpotIconName(parameters.filters.argument.state)}
        size={SPOT_ICON_SIZE.LG}
      />
      <Text
        fontWeight={hasArgumentForOrAgainst ? FontWeight.Semibold : FontWeight.Normal}
        color="gray.500"
        maxWidth="400px">
        {getWordingTitle(
          parameters.filters.argument.state,
          parameters.filters.argument.type,
          hasArgumentForOrAgainst,
          intl,
        )}
      </Text>

      {hasArgumentForOrAgainst && (
        <Flex direction="row">
          <Text color="gray.500">{intl.formatMessage({ id: 'consult-arguments' })}</Text>

          <Tag
            ml={3}
            variant={parameters.filters.argument.type.includes('FOR') ? 'red' : 'green'}
            onClick={() =>
              dispatch({
                type: 'CHANGE_ARGUMENT_TYPE',
                payload: parameters.filters.argument.type.includes('FOR') ? ['AGAINST'] : ['FOR'],
              })
            }>
            {intl.formatMessage({
              id: parameters.filters.argument.type.includes('FOR')
                ? 'argument.show.type.against'
                : 'argument.show.type.for',
            })}
          </Tag>
        </Flex>
      )}
    </Flex>
  );
};

export default createFragmentContainer(NoResultArgument, {
  debate: graphql`
    fragment NoResultArgument_debate on Debate
      @argumentDefinitions(isPublished: { type: "Boolean!" }, isTrashed: { type: "Boolean!" }) {
      debateArgumentsFor: arguments(value: FOR, isPublished: $isPublished, isTrashed: $isTrashed) {
        totalCount
      }
      debateArgumentsAgainst: arguments(
        value: AGAINST
        isPublished: $isPublished
        isTrashed: $isTrashed
      ) {
        totalCount
      }
    }
  `,
});
