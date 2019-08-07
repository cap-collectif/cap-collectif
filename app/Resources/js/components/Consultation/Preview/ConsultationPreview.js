// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { ConsultationPreview_consultation } from '~relay/ConsultationPreview_consultation.graphql';
import Card from '../../Ui/Card/Card';
import DefaultProjectImage from '../../Project/Preview/DefaultProjectImage';
import { Col } from "react-bootstrap";

type RelayProps = {|
  +consultation: ConsultationPreview_consultation
|}

type Props = {|
  ...RelayProps,
|}


const ConsultationPreview = ({consultation}: Props) => {
  const { id, url, title, illustration } = consultation
  return (
    <Col xs={12} sm={6} md={4} lg={3} className="d-flex">
      <Card id={id} className="consultation-preview">
        <Card.Cover>
          <a href={url} alt={title}>
            {illustration && illustration.url ? (
              <img src={illustration.url} alt={title} className="img-responsive" />
            ) : (
              <div className="bg--project"><DefaultProjectImage/></div>
            )}
          </a>
        </Card.Cover>
      </Card>
    </Col>
    );
};

export default createFragmentContainer(ConsultationPreview, {
  consultation: graphql`
    fragment ConsultationPreview_consultation on Consultation {
        id
        title
        illustration {
            url
        }
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
