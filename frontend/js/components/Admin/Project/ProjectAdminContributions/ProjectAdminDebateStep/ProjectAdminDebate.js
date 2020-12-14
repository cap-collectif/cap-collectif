// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import Accordion from '~ds/Accordion';
import { type ProjectAdminDebate_step } from '~relay/ProjectAdminDebate_step.graphql';
import FaceToFace from './FaceToFace/FaceToFace';

type Props = {|
  hasContributionsStep: boolean,
  baseUrl: string,
  step: ProjectAdminDebate_step,
|};

export const ProjectAdminDebate = ({ hasContributionsStep, baseUrl, step }: Props) => {
  const { debate } = step;
  const history = useHistory();

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
          <Accordion.Button>0 argument</Accordion.Button>
          <Accordion.Panel>WIP</Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item id="vote">
          <Accordion.Button>0 vote</Accordion.Button>
          <Accordion.Panel>WIP</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Flex>
  );
};

export default createFragmentContainer(ProjectAdminDebate, {
  step: graphql`
    fragment ProjectAdminDebate_step on DebateStep {
      debate {
        ...FaceToFace_debate
      }
    }
  `,
});
