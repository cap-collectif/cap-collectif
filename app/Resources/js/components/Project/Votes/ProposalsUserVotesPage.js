// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { graphql, createFragmentContainer, type RelayRefetchProp } from 'react-relay';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import ProposalsUserVotesTable from "./ProposalsUserVotesTable";

type Props = {
  project: Object,
  relay: RelayRefetchProp,
};

class ProposalsUserVotesPage extends React.Component<Props, State> {
  render() {
    const { project } = this.props;

    return (
      <div>
        <div className="container container--custom text-center">
          <h1 className="mb-0">{<FormattedMessage id="project.votes.title" />}</h1>
        </div>
        <div className="container container--custom">
          {project.votableSteps.length > 0 ? (
            project.votableSteps.map((step, index) => (
              // faire un composant ici
              <div key={index} className="block">
                {project.votableSteps.length > 1 ? (
                  <h2>
                    <a
                      className="pull-left btn btn-default"
                      href={step.show_url}
                      style={{ marginRight: '15px' }}>
                      <i className="cap cap-arrow-1-1" />
                      <span>
                        {' '}
                        <FormattedMessage id="project.votes.back" />
                      </span>
                    </a>
                    {`${step.title} `}
                    {step.voteType === 'BUDGET' ? (
                      <FormattedMessage id="project.votes.type.budget" />
                    ) : (
                      <FormattedMessage id="project.votes.type.simple" />
                    )}
                  </h2>
                ) : (
                  <p>
                    <a className="btn btn-default" href={step.show_url}>
                      <i className="cap cap-arrow-1-1" />
                      <span>
                        {' '}
                        <FormattedMessage id="project.votes.back" />
                      </span>
                    </a>
                  </p>
                )}
                <div className="well mb-0 mt-10">
                  <p>
                    <b>
                      <FormattedMessage
                        id="admin.fields.step.votesHelpText"
                      />
                    </b>
                  </p>
                  <p>
                    <FormattedMessage
                      id="modal-vote-ranking-explanations"
                    />
                  </p>
                </div>

                <h3 className="d-ib mr-10 mb-10">
                  <FormattedMessage
                    id="modal-ranking"
                  />
                </h3>
                <h4 className="excerpt d-ib">
                  <FormattedMessage
                    id="project.votes.nb"
                    values={{
                      num: step.viewerVotes.totalCount,
                    }}
                  />
                </h4>
                <ProposalsUserVotesTable step={step} />
              </div>
            ))
          ) : (
            <p>
              <FormattedMessage id="project.votes.no_active_step" />
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(ProposalsUserVotesPage, {
  project: graphql`
    fragment ProposalsUserVotesPage_project on Project {
      id
      votableSteps {
        ... on CollectStep {
          id
          title
          voteType
          votesRanking
          votesHelpText
          open
          show_url
          viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
            totalCount
            edges {
              node {
                proposal {
                  id
                  title
                  show_url
                  estimation
                  district {
                    name
                  }
                  author {
                    id
                    displayName
                    show_url
                  }
                }
              }
            }
          }
        }
        ... on SelectionStep {
          id
          title
          voteType
          votesRanking
          votesHelpText
          show_url
          viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
            totalCount
            edges {
              node {
                proposal {
                  id
                  title
                  estimation
                  show_url
                  district {
                    name
                  }
                  author {
                    id
                    displayName
                    show_url
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
});
