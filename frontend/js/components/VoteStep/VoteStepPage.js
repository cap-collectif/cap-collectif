// @flow
import { Flex } from '@cap-collectif/ui';
import * as React from 'react';
import ProjectStepHeader, { BACKGROUND_COLOR } from './ProjectStepHeader';
import useIsMobile from '~/utils/hooks/useIsMobile';
import VoteStepPageWebLayout from './VoteStepPageWebLayout';
import VoteStepPageMobileLayout from './VoteStepPageMobileLayout';
import useUrlState from '~/utils/hooks/useUrlState';

type Props = {|
  +stepId: string,
  +projectId: string,
  +isMapView: boolean,
|};

export const VoteStepPage = ({ stepId, isMapView }: Props) => {
  const isMobile = useIsMobile();
  // TODO : use a context for filters
  const [latlng, setLatlng] = useUrlState('latlng', '');

  React.useEffect(() => {
    const html = document.querySelector('html');
    if (html) html.classList.remove('has-vote-widget');
  }, []);

  return (
    <Flex direction="column" position="relative">
      <React.Suspense fallback={<Flex bg={BACKGROUND_COLOR} width="100%" p={9} />}>
        <ProjectStepHeader stepId={stepId} />
      </React.Suspense>
      {isMobile ? (
        <VoteStepPageMobileLayout
          stepId={stepId}
          setLatlng={setLatlng}
          latlng={latlng}
          isMapView={isMapView}
        />
      ) : (
        <VoteStepPageWebLayout
          stepId={stepId}
          setLatlng={setLatlng}
          latlng={latlng}
          isMapView={isMapView}
        />
      )}
    </Flex>
  );
};

export default VoteStepPage;
