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
import ArgumentTabQuery from './ArgumentTab/ArgumentTabQuery';
import VoteTabQuery from './VoteTab/VoteTabQuery';
import Heading from '~ui/Primitives/Heading';

type Props = {|
  hasContributionsStep: boolean,
  baseUrl: string,
  debate: ProjectAdminDebate_debate,
|};

export const ProjectAdminDebate = ({ hasContributionsStep, baseUrl, debate }: Props) => {
  const history = useHistory();
  const { allArguments, votes } = debate;

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
            <Heading as="h4">
              <FormattedMessage id="the.face-to-face" tagName={React.Fragment} />
            </Heading>
          </Accordion.Button>

          <Accordion.Panel>
            <FaceToFace debate={debate} />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item id="argument">
          <Accordion.Button>
            <Heading as="h4">
              <FormattedMessage
                id="argument-count"
                values={{ count: allArguments.totalCount }}
                tagName={React.Fragment}
              />
            </Heading>
          </Accordion.Button>

          <Accordion.Panel>
            <ArgumentTabQuery debate={debate} />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item id="vote">
          <Accordion.Button>
            <Heading as="h4">
              <FormattedMessage
                id="votes-count"
                values={{ num: votes.totalCount }}
                tagName={React.Fragment}
              />
            </Heading>
          </Accordion.Button>
          <Accordion.Panel>
            <VoteTabQuery debate={debate} />
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
      allArguments: arguments(first: 0, isPublished: null, isTrashed: null) {
        totalCount
      }
      votes {
        totalCount
      }
      ...FaceToFace_debate
      ...ArgumentTabQuery_debate
        @arguments(
          count: $countArgumentPagination
          cursor: $cursorArgumentPagination
          value: $argumentType
          isPublished: $isPublishedArgument
          isTrashed: $isTrashedArgument
        )
      ...VoteTabQuery_debate @arguments(count: $countVotePagination, cursor: $cursorVotePagination)
    }
  `,
});
