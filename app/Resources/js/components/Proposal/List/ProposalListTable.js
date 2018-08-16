import * as React from 'react';
import { createFragmentContainer } from 'react-relay';
import * as graphql from 'graphql';
import type { ProposalListTable_proposals } from './__generated__/ProposalListTable_proposals.graphql';
import type { ProposalListTable_step } from './__generated__/ProposalListTable_step.graphql';
import ReactBootstrapTable from '../../Ui/ReactBootstrapTable';
import ProposalListTableMobile from './ProposalListTableMobile';
import ImplementationPhaseTitle from '../ImplementationPhaseTitle';

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
      windowWidth: 0,
    };
  }

  componentDidMount() {
    // eslint-disable-next-line
    this.setState({
      windowWidth: window.innerWidth,
    });
  }

  getPhaseTitle = (phases: Array<Object>): string => {
    return <ImplementationPhaseTitle phases={phases} />;
  };

  getFormattedData = () => {
    const { proposals, step } = this.props;

    return (
      proposals.edges &&
      proposals.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(node => {
          const getProposalTitle =
            node.title.length > 55 ? `${node.title.substring(0, 55)}...` : node.title;

          return {
            title: {
              text: 'admin.fields.selection.proposal',
              value: { displayTitle: getProposalTitle, url: node.url && node.url },
              width: '250px',
            },
            implementationPhase: {
              text: 'implementation-phase',
              value: {
                list: node.progressSteps && node.progressSteps,
                title: node.progressSteps.length > 0 && this.getPhaseTitle(node.progressSteps),
              },
              width: '250px',
            },
            status: { text: 'admin.fields.theme.status', value: node.status && node.status },
            author: {
              text: 'project_download.label.author',
              value: node.author && node.author,
              width: '250px',
            },
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
                date: node.updatedAt,
                user: node.updatedBy && node.updatedBy.displayName,
              },
            },
            publishedOn: {
              text: 'published-on',
              value: node.publishedAt && node.publishedAt,
              width: '150px',
            },
          };
        })
    );
  };

  getTable = () => {
    const { windowWidth } = this.state;

    window.addEventListener('resize', () => {
      this.setState({
        windowWidth: window.innerWidth,
      });
    });

    if (windowWidth < 992) {
      return <ProposalListTableMobile data={this.getFormattedData()} />;
    }

    return <ReactBootstrapTable data={this.getFormattedData()} />;
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
          publishedAt
        }
      }
    }
  `,
});
