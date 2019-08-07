// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { ConsultationListView_consultations } from '~relay/ConsultationListView_consultations.graphql';
import ConsultationPreview from './ConsultationPreview';

type RelayProps = {|
  +consultations: ConsultationListView_consultations
|}

type Props = {|
  ...RelayProps,
|}


const ConsultationListView = ({consultations}: Props) => {
  return (
    <div className="row">
      <div className="d-flex flex-wrap">
        {consultations.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map((consultation) => (
            /* $FlowFixMe $fragmentRefs */
            <ConsultationPreview key={consultation.id} consultation={consultation} />
          ))}
      </div>
    </div>
  );
};

export default createFragmentContainer(ConsultationListView, {
  consultations: graphql`
      fragment ConsultationListView_consultations on ConsultationConnection {
          edges {
              node {
                  id
                  ...ConsultationPreview_consultation
              }
          }
      }
  `,
});
