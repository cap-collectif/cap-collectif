// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import classNames from 'classnames';
import { Row } from 'react-bootstrap';
import ProposalPreview from '../Preview/ProposalPreview';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import DraftBox from '../../Utils/DraftBox';
import Loader from '../../Utils/Loader';

type Props = {
  step: Object,
  showThemes: boolean,
};

export default class DraftProposalList extends React.Component<Props> {
  render() {
    return (
      <div>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query DraftProposalListQuery($stepId: ID!) {
              draftProposalsForUserInStep(stepId: $stepId) {
                id
                title
                summaryOrBodyExcerpt
                status {
                  name
                }
                votesCountByStepId
                commentsCount
                form {
                  step {
                    id
                  }
                }
                theme {
                  title
                }
                category {
                  name
                }
                district {
                  name
                }
                likers {
                  id
                }
                show_url
                createdAt
                author {
                  displayName
                  media {
                    url
                  }
                  show_url
                  vip
                }
                selections {
                  step {
                    id
                  }
                }
              }
            }
          `}
          variables={{
            stepId: this.props.step.id,
          }}
          render={({ error, props }: { error: ?Error, props: any }) => {
            if (error) {
              console.log(error); // eslint-disable-line no-console
              return graphqlError;
            }

            if (props) {
              const classes = classNames({
                'media-list': true,
                'proposal-preview-list': true,
                opinion__list: true,
              });

              if (props.draftProposalsForUserInStep.length === 0) {
                return null;
              }

              return (
                <DraftBox>
                  <Row componentClass="ul" className={classes}>
                    {props.draftProposalsForUserInStep.map((proposal, i) => (
                      <ProposalPreview
                        key={`draft-proposal-${i}`}
                        proposal={proposal}
                        step={proposal.form.step}
                        showThemes={this.props.showThemes}
                      />
                    ))}
                  </Row>
                </DraftBox>
              );
            }
            return <Loader />;
          }}
          showThemes={this.props.showThemes}
        />
      </div>
    );
  }
}
