// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import type { StepPropositionNavigation_step } from '~relay/StepPropositionNavigation_step.graphql';

type RelayProps = {|
  +step: StepPropositionNavigation_step
|}

type Props = {|
  ...RelayProps
|}

const StepNavigationTypeBackButton = ({ step }: { step: StepPropositionNavigation_step }) => {
  switch (step.__typename) {
    case 'ConsultationStep':
      return <Button href={step.url}>
        <FormattedMessage id="consultations-list"/>
      </Button>;
    default:
      return null;
  }
};

const StepNavigationTypeTitle = ({ step }: { step: StepPropositionNavigation_step }) => {
  switch (step.__typename) {
    case 'ConsultationStep':
      return <h2><FormattedMessage id="project.types.consultation"/></h2>;
    default:
      return null;
  }
};

const StepNavigationTypeShare = ({ step }: { step: StepPropositionNavigation_step }) => {
  switch (step.__typename) {
    case 'ConsultationStep':
      return step.consultation && <ShareButtonDropdown
        id="consultation-share-button"
        url={step.consultation.url}
        title={step.consultation.title}
      />;
    default:
      return null;
  }
};


const StepPropositionNavigation = ({ step }: Props) => {
  return (
    <React.Fragment>
      <StepNavigationTypeBackButton step={step}/>
      <StepNavigationTypeTitle step={step}/>
      <StepNavigationTypeShare step={step}/>
    </React.Fragment>
  );
};

export default createFragmentContainer(StepPropositionNavigation, {
  step: graphql`
      fragment StepPropositionNavigation_step on Step @argumentDefinitions(relatedSlug: { type: "String!" }) {
          __typename
          url
          ... on ConsultationStep {
              consultation(slug: $relatedSlug) {
                  url
                  title
              }
          }
      }
  `,
});
