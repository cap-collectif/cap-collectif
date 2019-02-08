// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import ListGroupFlush from '../Ui/List/ListGroupFlush';
import type { QuestionnaireAdminResultsText_simpleQuestion } from './__generated__/QuestionnaireAdminResultsText_simpleQuestion.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {
  simpleQuestion: QuestionnaireAdminResultsText_simpleQuestion,
};

export class QuestionnaireAdminResultsText extends React.Component<Props> {
  render() {
    const { simpleQuestion } = this.props;

    return (
      <ListGroupFlush>
        {simpleQuestion.responses &&
          simpleQuestion.responses.edges &&
          simpleQuestion.responses.edges.map(response => (
            <ListGroupItem>
              <WYSIWYGRender value={response && response.node && response.node.value} />
            </ListGroupItem>
          ))}
      </ListGroupFlush>
    );
  }
}

export default createFragmentContainer(QuestionnaireAdminResultsText, {
  simpleQuestion: graphql`
    fragment QuestionnaireAdminResultsText_simpleQuestion on SimpleQuestion {
      title
      responses {
        totalCount
        edges {
          node {
            id
            ... on ValueResponse {
              value
            }
          }
        }
      }
    }
  `,
});
