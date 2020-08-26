// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Col } from 'react-bootstrap';
import type { ProposalViewMode } from '~/redux/modules/proposal';
import type { ProposalListToggleViewBtn_step } from '~relay/ProposalListToggleViewBtn_step.graphql';

type Props = {
  showMapButton: boolean,
  setDisplayMode: (displayMode: ProposalViewMode) => void,
  displayMode: ProposalViewMode,
  step: ProposalListToggleViewBtn_step,
};

const getDisplayModeEnabled = (step: ProposalListToggleViewBtn_step) => {
  if (step.__typename === 'CollectStep') {
    return {
      isGridViewEnabled: step.form?.isGridViewEnabled,
      isListViewEnabled: step.form?.isListViewEnabled,
      isMapViewEnabled: step.form?.isMapViewEnabled,
    };
  }

  if (step.__typename === 'SelectionStep') {
    return {
      isGridViewEnabled: step?.project?.firstCollectStep?.form?.isGridViewEnabled,
      isListViewEnabled: step?.project?.firstCollectStep?.form?.isListViewEnabled,
      isMapViewEnabled: step?.project?.firstCollectStep?.form?.isMapViewEnabled,
    };
  }

  return {
    isGridViewEnabled: true,
    isListViewEnabled: true,
    isMapViewEnabled: true,
  };
};

const getCountDisplayModeEnabled = (displayModeEnabled, showMapButtonEnabled: boolean) => {
  let count = 0;
  if (displayModeEnabled.isGridViewEnabled) count++;
  if (displayModeEnabled.isListViewEnabled) count++;
  if (displayModeEnabled.isMapViewEnabled && showMapButtonEnabled) count++;
  return count;
};

export const ProposalListToggleViewBtn = ({
  displayMode,
  setDisplayMode,
  showMapButton,
  step,
}: Props) => {
  const intl = useIntl();
  const displayModeEnabled = getDisplayModeEnabled(step);
  const countDisplayModeEnabled = getCountDisplayModeEnabled(displayModeEnabled, showMapButton);

  return countDisplayModeEnabled > 1 ? (
    <Col xs={12} sm={6} md={4} lg={3}>
      <div
        id="step-view-toggle"
        className="btn-group d-flex mb-15"
        style={{ width: '100%' }}
        role="group"
        aria-label={intl.formatMessage({ id: 'global.filter.chose.display.type' })}>
        {displayModeEnabled.isListViewEnabled && (
          <Button
            bsStyle="default"
            active={displayMode === 'list'}
            role="checkbox"
            aria-checked={displayMode === 'list'}
            title={displayMode === 'list' ? intl.formatMessage({ id: 'table-selected' }) : null}
            style={{ flex: '1 0 auto' }}
            onClick={() => setDisplayMode('list')}>
            <i className="cap cap-android-menu" /> <FormattedMessage id="global.list" />
          </Button>
        )}

        {displayModeEnabled.isGridViewEnabled && (
          <Button
            bsStyle="default"
            active={displayMode === 'grid'}
            role="checkbox"
            aria-checked={displayMode === 'grid'}
            title={displayMode === 'grid' ? intl.formatMessage({ id: 'mosaic-selected' }) : null}
            style={{ flex: '1 0 auto' }}
            onClick={() => setDisplayMode('grid')}>
            <i className="cap cap-th-large" /> <FormattedMessage id="grid" />
          </Button>
        )}

        {displayModeEnabled.isMapViewEnabled && showMapButton && (
          <Button
            bsStyle="default"
            style={{ flex: '1 0 auto' }}
            role="checkbox"
            aria-checked={displayMode === 'map'}
            title={displayMode === 'map' ? intl.formatMessage({ id: 'map-selected' }) : null}
            active={displayMode === 'map'}
            onClick={() => setDisplayMode('map')}>
            <i className="cap cap-map-location" />
            <FormattedMessage id="capco.module.display_map" />
          </Button>
        )}
      </div>
    </Col>
  ) : null;
};

export default createFragmentContainer(ProposalListToggleViewBtn, {
  step: graphql`
    fragment ProposalListToggleViewBtn_step on Step {
      __typename
      ... on CollectStep {
        form {
          isGridViewEnabled
          isListViewEnabled
          isMapViewEnabled
        }
      }
      ... on SelectionStep {
        project {
          firstCollectStep {
            form {
              isGridViewEnabled
              isListViewEnabled
              isMapViewEnabled
            }
          }
        }
      }
    }
  `,
});
