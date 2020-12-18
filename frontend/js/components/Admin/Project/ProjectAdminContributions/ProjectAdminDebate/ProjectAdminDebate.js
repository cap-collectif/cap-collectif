// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import Accordion from '~ds/Accordion';
import { type ProjectAdminDebate_debate } from '~relay/ProjectAdminDebate_debate.graphql';
import FaceToFace from './FaceToFace/FaceToFace';
import ArgumentTab from './ArgumentTab/ArgumentTab';
import VoteTab from './VoteTab/VoteTab';

type Props = {|
  hasContributionsStep: boolean,
  baseUrl: string,
  debate: ProjectAdminDebate_debate,
|};

export const ProjectAdminDebate = ({ hasContributionsStep, baseUrl, debate }: Props) => {
  const history = useHistory();
  const { argumentsPublished, argumentsWaiting, argumentsTrashed, votes } = debate;

  const sumCountArguments: number =
    argumentsPublished.totalCount + argumentsWaiting.totalCount + argumentsTrashed.totalCount;

  return (
    <Flex direction="column">
      {hasContributionsStep && baseUrl && (
        <Button
          variant="tertiary"
          onClick={() => history.push(baseUrl)}
          leftIcon={ICON_NAME.LONG_ARROW_LEFT}
          size="small"
          mb={8}>
          <FormattedMessage id="global.steps" />
        </Button>
      )}

      <Accordion spacing={2} defaultAccordion="face-to-face">
        <Accordion.Item id="face-to-face">
          <Accordion.Button>
            <FormattedMessage id="the.face-to-face" />
          </Accordion.Button>

          <Accordion.Panel>
            <FaceToFace debate={debate} />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item id="argument">
          <Accordion.Button>
            <FormattedMessage id="argument-count" values={{ count: sumCountArguments }} />
          </Accordion.Button>

          <Accordion.Panel>
            <ArgumentTab debate={debate} />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item id="vote">
          <Accordion.Button>
            <FormattedMessage id="votes-count" values={{ num: votes.totalCount }} />
          </Accordion.Button>
          <Accordion.Panel>
            <VoteTab debate={debate} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Flex>
  );
};

export default createFragmentContainer(ProjectAdminDebate, {
  debate: graphql`
    fragment ProjectAdminDebate_debate on Debate
      @argumentDefinitions(
        countArgumentPagination: { type: "Int!" }
        cursorArgumentPagination: { type: "String" }
        argumentType: { type: "ForOrAgainstValue", defaultValue: null }
        isPublishedArgument: { type: "Boolean!" }
        isTrashedArgument: { type: "Boolean!" }
        countVotePagination: { type: "Int!" }
        cursorVotePagination: { type: "String" }
      ) {
      argumentsPublished: arguments(isPublished: true, isTrashed: false) {
        totalCount
      }
      argumentsWaiting: arguments(isPublished: false) {
        totalCount
      }
      argumentsTrashed: arguments(isTrashed: true) {
        totalCount
      }
      votes {
        totalCount
      }
      ...FaceToFace_debate
      ...ArgumentTab_debate
        @arguments(
          count: $countArgumentPagination
          cursor: $cursorArgumentPagination
          value: $argumentType
          isPublished: $isPublishedArgument
          isTrashed: $isTrashedArgument
        )
      ...VoteTab_debate @arguments(count: $countVotePagination, cursor: $cursorVotePagination)
    }
  `,
});
