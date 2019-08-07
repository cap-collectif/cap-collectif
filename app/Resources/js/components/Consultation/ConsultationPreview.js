// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { ConsultationPreview_consultation } from '~relay/ConsultationPreview_consultation.graphql';

type RelayProps = {|
  +consultation: ConsultationPreview_consultation
|}

type Props = {|
  ...RelayProps,
|}


const ConsultationPreview = ({consultation}: Props) => {
  return (
    <div>
      Preview
    </div>
  );
};

export default createFragmentContainer(ConsultationPreview, {
  consultation: graphql`
    fragment ConsultationPreview_consultation on Consultation {
        title
        contributions {
            totalCount
        }
        contributors {
            totalCount
        }
        votesCount
    }
  `
})
