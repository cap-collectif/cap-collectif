// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import styled, { css } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import type { StepPropositionNavigation_step } from '~relay/StepPropositionNavigation_step.graphql';
import { breakpoint } from '../../utils/mixins';

type RelayProps = {|
  +step: StepPropositionNavigation_step
|}

type Props = {|
  ...RelayProps
|}

const CONSULTATION_SHARE_BUTTON_ID = 'consultation-share-button';

const BackIcon = styled.i.attrs({
  className: 'cap-arrow-65 position-relative'
})`
  top: 2px
`;

const BackMessage = styled.span`
  display: none;
  ${breakpoint('medium', css`
    display: inline;
  `)}
`;

// The consultation span selector is a bit hacky but I have no way to control the ShareButtonDropdown
// component without redo some writing of the component to allow handle responsive cases
const ShareButtonDropdownInner = styled.span`
  #${CONSULTATION_SHARE_BUTTON_ID} > span > span:last-child {
    display: none;
    ${breakpoint('medium', css`
      display: inline;
    `)}
  }
`;

const StepNavigationTypeBackButton = ({ step }: { step: StepPropositionNavigation_step }) => {
  switch (step.__typename) {
    case 'ConsultationStep':
      return <Button href={step.url}>
        <BackIcon/>&nbsp;
        <BackMessage>
          <FormattedMessage id="consultations-list"/>
        </BackMessage>
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
      return step.consultation && <ShareButtonDropdownInner>
        <ShareButtonDropdown
          id={CONSULTATION_SHARE_BUTTON_ID}
          url={step.consultation.url}
          title={step.consultation.title}
        />
      </ShareButtonDropdownInner>;
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
