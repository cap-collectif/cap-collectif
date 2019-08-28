// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import moment from 'moment';
import { Label } from 'react-bootstrap';
import { FormattedDate, FormattedMessage } from 'react-intl';
import type { ProposalListTable_proposals } from '~relay/ProposalListTable_proposals.graphql';
import type { ProposalListTable_step } from '~relay/ProposalListTable_step.graphql';
import type { ImplementationStepTitle_progressSteps } from '~relay/ImplementationStepTitle_progressSteps.graphql';
import Table from '../../Ui/Table/Table';
import ProposalListTableMobile from './ProposalListTableMobile';
import ImplementationStepTitle from '../ImplementationStepTitle';
import ProgressList from '../../Ui/List/ProgressList';
import ProgressListItem from '../../Ui/List/ProgressListItem';
import UserAvatarDeprecated from '../../User/UserAvatarDeprecated';
import InlineList from '../../Ui/List/InlineList';

type Props = {
  proposals: ProposalListTable_proposals,
  step: ProposalListTable_step,
};

type State = {
  windowWidth: number,
};

type Cell = {
  text: string,
  value: any,
  width?: string,
};

type Column = {
  style: Object,
  hidden: ?boolean,
  text: string,
  key: number,
};

export class ProposalListTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      windowWidth: 0,
    };
  }

  componentDidMount() {
    this.setState({
      windowWidth: window.innerWidth,
    });

    window.addEventListener('resize', () => {
      this.setState({
        windowWidth: window.innerWidth,
      });
    });
  }

  getPhaseTitle = (progressSteps: ImplementationStepTitle_progressSteps) => (
    /* $FlowFixMe */
    <ImplementationStepTitle progressSteps={progressSteps} />
  );

  getFormattedData = (): ?Array<Object> => {
    const { proposals, step } = this.props;

    return (
      proposals &&
      proposals.edges &&
      proposals.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(node => {
          const getProposalTitle =
            node.title.length > 55 ? `${node.title.substring(0, 55)}…` : node.title;

          return {
            title: {
              text: step.form.isProposalForm ? 'admin.fields.selection.proposal' : 'question-title',
              value: { displayTitle: getProposalTitle, url: node.url && node.url },
              width: '250px',
            },
            implementationPhase: {
              text: 'implementation-phase',
              value: {
                list: node.progressSteps,
                title:
                  node.progressSteps &&
                  node.progressSteps.length > 0 &&
                  // $FlowFixMe
                  this.getPhaseTitle(node.progressSteps),
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
              hidden: step && step.form && !step.form.usingDistrict,
            },
            category: {
              text: 'proposal.category',
              value: node.category && node.category.name,
              hidden: step && step.form && !step.form.usingCategories,
            },
            theme: {
              text: 'proposal.theme',
              value: node.theme && node.theme.title,
              hidden: step && step.form && !step.form.usingThemes,
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
              text: 'project_download.label.updated',
              value: {
                date: node.updatedAt,
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

  getColumns = (): Array<Column> => {
    const data = this.getFormattedData();

    if (!data) return [];
    const columnsName = Object.keys(data[0]);
    const firstData = data[0];

    const isHidden = cellName =>
      data &&
      data.filter(row => {
        if (cellName === 'implementationPhase') {
          return row[cellName].value.list
            ? row[cellName].value.list.length !== 0
            : row[cellName].value;
        }
        if (cellName === 'lastActivity') {
          return row[cellName].value.date;
        }
        return Array.isArray(row[cellName] && row[cellName].value)
          ? row[cellName].value.length !== 0
          : row[cellName] && row[cellName].value;
      }).length === 0;

    const column = columnsName.map((columnName, key) => ({
      style: {
        width:
          firstData[columnName] && firstData[columnName].width
            ? firstData[columnName].width
            : '200px',
      },
      hidden:
        firstData[columnName] && firstData[columnName].hidden
          ? firstData[columnName].hidden
          : isHidden(columnName),
      text: firstData[columnName] && firstData[columnName].text,
      key,
    }));

    return column;
  };

  getCell = (rows: { [string]: Cell }) => {
    const columns = this.getColumns();

    const hiddenColumnKey = columns
      .filter(column => column.hidden === true)
      .reduce((prev, curr) => [...prev, curr.key], []);

    // $FlowFixMe Missing type annotation for U
    return Object.entries(rows).map(([keyName, cell], key) => {
      // $FlowFixMe
      const value = cell && cell.value;

      if (hiddenColumnKey.includes(key)) {
        return null;
      }

      if (keyName === 'title' && value) {
        return (
          <td key={key}>
            {/* $FlowFixMe */}
            <a href={value.url}>{value.displayTitle}</a>
          </td>
        );
      }

      if (keyName === 'implementationPhase' && value && value.list) {
        // $FlowFixMe
        const openSteps = value.list.filter(step => moment().isBetween(step.startAt, step.endAt));
        // $FlowFixMe
        const openTimelessSteps = value.list.filter(
          step => !step.endAt && moment().isAfter(step.startAt),
        );

        const list =
          value &&
          /* $FlowFixMe */
          value.list.map(step => {
            let isActive = false;

            if (step.endAt && moment().isAfter(step.endAt)) {
              isActive = true;
            }

            if (
              !step.endAt &&
              moment().isAfter(step.startAt) &&
              (openSteps.length !== 0 ||
                (openSteps.length === 0 &&
                  openTimelessSteps.length > 1 &&
                  openTimelessSteps[openTimelessSteps.length - 1].title !== step.title))
            ) {
              isActive = true;
            }

            return {
              title: step.title,
              isActive,
            };
          });

        return (
          <td className="m-auto" key={key}>
            <div className="mb-10">
              {/* $FlowFixMe */}
              <span>{value.title}</span>
            </div>
            <ProgressList className="mt-10">
              {list.map((item, liKey) => (
                <ProgressListItem key={liKey} item={item} />
              ))}
            </ProgressList>
          </td>
        );
      }

      if (keyName === 'status' && value) {
        return (
          <td key={key}>
            {/* $FlowFixMe */}
            <Label bsStyle={value.color} className="badge-pill">
              {/* $FlowFixMe */}
              {value.name}
            </Label>
          </td>
        );
      }

      if (keyName === 'author' && value) {
        return (
          <td key={key}>
            <div className="d-flex align-items-center text-ellipsis">
              <UserAvatarDeprecated
                /* $FlowFixMe */
                user={{ username: value.displayName, media: value.media, _links: {} }}
                defaultAvatar={null}
              />
              {value.url ? (
                <a href={value.url}>
                  {/* $FlowFixMe */}
                  <span>{value.displayName}</span>
                </a>
              ) : (
                /* $FlowFixMe */
                <span>{value.displayName}</span>
              )}
            </div>
          </td>
        );
      }

      if (keyName === 'priceEstimation' && value) {
        /* $FlowFixMe */
        return <td key={key}>{value} €</td>;
      }

      if (keyName === 'lastActivity' && value) {
        if (value.date) {
          return (
            <td key={key}>
              <FormattedDate value={moment(value.date).toDate()} />
            </td>
          );
        }

        return <td key={key} />;
      }

      if (keyName === 'likers' && value) {
        return (
          <td key={key}>
            <InlineList className="mb-0 excerpt">
              {/* $FlowFixMe */}
              {value.map((user, i) => (
                <li key={i}>{user.displayName}</li>
              ))}
            </InlineList>
          </td>
        );
      }

      if (keyName === 'publishedOn' && value) {
        return (
          <td key={key}>
            <FormattedDate value={moment(value).toDate()} />
          </td>
        );
      }

      if (!value) {
        return <td key={key} />;
      }

      // $FlowFixMe
      return <td key={key}>{value}</td>;
    });
  };

  render() {
    const { windowWidth } = this.state;

    const data = this.getFormattedData();
    if (!data) return null;
    const columns = this.getColumns();

    if (windowWidth < 992) {
      return <ProposalListTableMobile data={data} />;
    }

    return (
      <Table bordered hover tableLayoutFixed>
        <caption className="sr-only">
          <FormattedMessage id="project-list" />
        </caption>
        <thead>
          <tr>
            {columns.map((column, key) => (
              <th
                style={{
                  width: column.style.width ? column.style.width : '200px',
                  display: column.hidden === true ? 'none' : 'table-cell',
                }}
                key={key}
                scope="col">
                <FormattedMessage id={column.text || 'global.non_applicable'} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((rows, key) => (
            <tr key={key}>{this.getCell(rows)}</tr>
          ))}
        </tbody>
      </Table>
    );
  }
}

export default createFragmentContainer(ProposalListTable, {
  step: graphql`
    fragment ProposalListTable_step on ProposalStep {
      form {
        usingThemes
        usingDistrict
        usingCategories
        usingDescription
        usingSummary
        descriptionMandatory
        isProposalForm
      }
    }
  `,
  proposals: graphql`
    fragment ProposalListTable_proposals on ProposalConnection
      @argumentDefinitions(stepId: { type: "ID" }) {
      edges {
        node {
          id
          url
          title
          progressSteps {
            title
            startAt
            endAt
            ...ImplementationStepTitle_progressSteps
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
          publishedAt
        }
      }
    }
  `,
});
