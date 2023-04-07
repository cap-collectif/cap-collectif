// @flow
import { Flex } from '@cap-collectif/ui';
import * as React from 'react';
import ProjectStepHeader, { BACKGROUND_COLOR } from './ProjectStepHeader';

type Props = {|
  +stepId: string,
  +projectId: string,
|};

export const VoteStepPage = ({ stepId }: Props) => {
  React.useEffect(() => {
    const html = document.querySelector('html');
    if (html) html.classList.remove('has-vote-widget');
  }, []);

  return (
    <Flex direction="column">
      <React.Suspense fallback={<Flex bg={BACKGROUND_COLOR} width="100%" p={9} />}>
        <ProjectStepHeader stepId={stepId} />
        {/** TODO : Page layouts for web and mobile */}
      </React.Suspense>
    </Flex>
  );
};

export default VoteStepPage;
