import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import { Label, ListGroup, ListGroupItem } from 'react-bootstrap';
import moment from 'moment';
import * as graphql from 'graphql';
import type { ProposalListTable_proposals } from './__generated__/ProposalListTable_proposals.graphql';
import type { ProposalListTable_step } from './__generated__/ProposalListTable_step.graphql';
import ProgressList from '../../Ui/List/ProgressList';
import ReactBootstrapTable from '../../Ui/ReactBootstrapTable';

type Props = {
  proposals: ProposalListTable_proposals,
  step: ProposalListTable_step,
};

type State = {
  windowWidth: number,
};

export class ProposalListTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      windowWidth: window.innerWidth,
    };
  }

  getPhaseTitle = data => {
    const openPhase = data.filter(e => moment().isBetween(e.startAt, e.endAt));
    const toComePhase = data.filter(e => moment().isBefore(e.startAt));
    const endPhase = data[data.length - 1];

    if (openPhase.length > 0) {
      return openPhase[0].title;
    }

    if (toComePhase.length > 0) {
      return toComePhase[0].title;
    }

    if (endPhase) {
      return endPhase.title;
    }
  };

  getData = () => {
    const { proposals, step } = this.props;

    return (
      proposals.edges &&
      proposals.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(node => ({
          title: {
            text: 'admin.fields.selection.proposal',
            value: { displayTitle: node.title && node.title, url: node.url && node.url },
            width: '250px',
          },
          implementationPhase: {
            text: 'implementation-phase',
            value: {
              list: node.progressSteps && node.progressSteps,
              title: this.getPhaseTitle(node.progressSteps),
            },
            width: '250px',
          },
          status: { text: 'admin.fields.theme.status', value: node.status && node.status },
          author: { text: 'project_download.label.author', value: node.author && node.author },
          ref: {
            text: 'proposal.admin.reference',
            value: node.reference && node.reference,
            width: '150px',
          },
          district: {
            text: 'proposal.district',
            value: node.district && node.district.name,
            hidden: step && !step.form.usingDistrict,
          },
          category: {
            text: 'proposal.category',
            value: node.category && node.category.name,
            hidden: step && !step.form.usingCategories,
          },
          theme: {
            text: 'proposal.theme',
            value: node.theme && node.theme.title,
            hidden: step && !step.form.usingThemes,
          },
          priceEstimation: {
            text: 'proposal.estimation',
            value: node.estimation && node.estimation,
          },
          likers: {
            text: 'project_download.label.likers',
            value: node.likers && node.likers,
            width: '250px',
          },
          lastActivity: {
            text: 'last-activity',
            value: {
              date: node.updatedAt && node.updatedAt,
              user: node.updatedBy && node.updatedBy.displayName,
            },
          },
          publishedOn: {
            text: 'published-on',
            value: node.createdAt && node.createdAt,
            width: '150px',
          },
        }))
    );
  };

  getTable = () => {
    const { windowWidth } = this.state;

    window.addEventListener('resize', () => {
      this.setState({
        windowWidth: window.innerWidth,
      });
    });

    if (windowWidth > 992) {
      return <ReactBootstrapTable data={this.getData()} />;
    }

    return (
      <ListGroup className="list-group-custom">
        {this.getData().map(item => {
          const list =
            item.implementationPhase.value &&
            item.implementationPhase.value.list.map(e => {
              let isActive = false;

              if (moment().isSameOrAfter(e.startAt)) {
                isActive = true;
              }

              return {
                title: e.title,
                isActive,
              };
            });

          return (
            <ListGroupItem>
              <div>
                <div className="d-flex justify-content-between">
                  {item.title.value && (
                    <a href={item.title.value.url}>{item.title.value.displayTitle}</a>
                  )}
                  {item.status.value && (
                    <div className="ml-5">
                      <Label bsStyle={item.status.value.color} className="badge-pill">
                        {item.status.value.name}
                      </Label>
                    </div>
                  )}
                </div>
                {item.implementationPhase.value && (
                  <div className="m-auto">
                    {this.getPhaseTitle(item.implementationPhase.value.list) && (
                      <div className="mb-5 mt-10">
                        <span>{this.getPhaseTitle(item.implementationPhase.value.list)}</span>
                      </div>
                    )}
                    <ProgressList list={list} />
                  </div>
                )}
              </div>
            </ListGroupItem>
          );
        })}
      </ListGroup>
    );
  };

  render() {
    return this.getTable();
  }
}

export default createFragmentContainer(ProposalListTable, {
  step: graphql`
    fragment ProposalListTable_step on ProposalStep {
      form {
        usingThemes
        usingDistrict
        usingCategories
      }
    }
  `,
  proposals: graphql`
    fragment ProposalListTable_proposals on ProposalConnection
      @argumentDefinitions(stepId: { type: "ID", nonNull: false }) {
      edges {
        node {
          id
          url
          title
          progressSteps {
            title
            startAt
            endAt
          }
          currentVotableStep {
            title
          }
          status(step: $stepId) {
            name
            color
          }
          author {
            displayName
            url
            media {
              url
            }
          }
          reference
          district {
            name
          }
          category {
            name
          }
          theme {
            title
          }
          estimation
          likers {
            displayName
          }
          updatedAt
          updatedBy {
            displayName
          }
          createdAt
        }
      }
    }
  `,
});
