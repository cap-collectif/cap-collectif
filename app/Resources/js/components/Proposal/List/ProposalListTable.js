import * as React from 'react';
import {createFragmentContainer} from "react-relay";
import {Label, ListGroup, ListGroupItem} from "react-bootstrap";
import {FormattedDate, FormattedMessage} from "react-intl";
import moment from "moment";
import * as graphql from "graphql";
import type { ProposalListTable_proposals } from './__generated__/ProposalListTable_proposals.graphql';
import type { ProposalListTable_step } from './__generated__/ProposalListTable_step.graphql';
import UserAvatar from "../../User/UserAvatar";
import ProgressList from "../../Ui/List/ProgressList";
import ReactBootstrapTable from "../../Ui/ReactBootstrapTable";
import InlineList from "../../Ui/List/InlineList";

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

  getPhaseTitle = (data) => {
    const openPhase = data.filter(e => moment().isBetween(e.startAt, e.endAt));
    const toComePhase = data.filter(e => moment().isBefore(e.startAt));
    const endPhase = data[data.length - 1];

    if(openPhase.length > 0) {
      return openPhase[0].title;
    }

    if(toComePhase.length > 0) {
      return toComePhase[0].title;
    }

    if(endPhase) {
      return endPhase.title;
    }
  };

  getTable = (tableWidth, columns, data) => {
    const { windowWidth } = this.state;

    window.addEventListener('resize', () => {
      this.setState({
        windowWidth: window.innerWidth,
      });
    });

    if (windowWidth > 992) {
      return <ReactBootstrapTable width={tableWidth} keyField="title" columns={columns} data={data} />;
    }

    return (
      <ListGroup className="list-group-custom">
        {data.map(item => {
          const list = item.implementationPhase && item.implementationPhase.map(e => {
            let isActive = false;

            if(moment().isSameOrAfter(e.startAt)) {
              isActive = true;
            }

            return (
              {
                title: e.title,
                isActive,
              }
            )
          });

          return (
            <ListGroupItem>
              <div>
                <div className="d-flex justify-content-between">
                  {item.title &&
                  <a href={item.title.url}>{item.title.value}</a>
                  }
                  {item.status &&
                  <div className="ml-5">
                    <Label bsStyle={item.status.color} className="badge-pill">
                      {item.status.name}
                    </Label>
                  </div>

                  }
                </div>
                {item.implementationPhase &&
                <div className="m-auto">
                  {this.getPhaseTitle(item.implementationPhase) &&
                  <div className="mb-5 mt-10">
                      <span>
                        {this.getPhaseTitle(item.implementationPhase)}
                      </span>
                  </div>
                  }
                  <ProgressList list={list}/>
                </div>
                }
              </div>
            </ListGroupItem>
          )

        })}
      </ListGroup>
    );
  };

  statusFormatter = (cell) => {
    if(cell){
      return (
        <Label bsStyle={cell.color} className="badge-pill">{cell.name}</Label>
      )
    }
  };

  titleFormatter = (cell) => {
    if (cell) {
      return (
        <a href={cell && cell.url}>
          {cell && cell.value}
        </a>
      )
    }
  };

  implementationPhaseFormatter = (cell) => {
    if(cell) {
      const list = cell && cell.map(e => {
        let isActive = false;

        if(moment().isSameOrAfter(e.startAt)) {
          isActive = true;
        }

        return (
          {
            title: e.title,
            isActive,
          }
        )
      });

      return (
        <div className="m-auto">
          {this.getPhaseTitle(cell) &&
          <div className="mb-10" >
              <span>
                {this.getPhaseTitle(cell)}
              </span>
          </div>
          }
          <ProgressList list={list} className="mt-10" />
        </div>
      )
    }
  };

  authorFormatter = (cell) => {
    if (cell) {
      return (
        <div className="d-flex align-items-baseline">
          <UserAvatar
            user={{username: cell.displayName, media: cell.media, _links: {}}}
            defaultAvatar={null}
          />
          {cell.displayName}
        </div>
      )
    }
  };

  estimationFormatter = (cell) => {
    if(cell) {
      return (
        <span>{cell} €</span>
      )
    }
  };

  likersFormatter = (cell) => {
    if(cell) {
      return (
        <InlineList className="mb-0">
          {cell.map((user, index) => <li key={index}>{user.displayName}</li>)}
        </InlineList>
      )
    }
  };

  lastActivityFormatter = (cell) => {
    if(cell && cell.user) {
      return (
        <FormattedMessage
          id="last-activity-date"
          values={{
            date: (
              <FormattedDate
                value={moment(cell.date).toDate()}
              />
            ),
            user: cell.user,
          }}
        />
      )
    }
    if(cell) {
      return (
        <FormattedDate
          value={moment(cell.date).toDate()}
        />
      )
    }
  };

  publishedOnFormatter = (cell) => {
    if(cell) {
      return (
        <FormattedDate
          value={moment(cell).toDate()}
        />
      )
    }
  };

  columnTitleFormatter = (column) => (
    <FormattedMessage id={column.text} />
  );

  render() {
    const { proposals } = this.props;

    const data =
      proposals.edges &&
      proposals.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map((node) => {
          // console.warn(node);

          return (
            {
              title: { value: node.title && node.title, url: node.url && node.url },
              implementationPhase: node.progressSteps && node.progressSteps,
              status: node.status && node.status,
              author: node.author && node.author,
              ref: node.reference && node.reference,
              district: node.district && node.district.name,
              category: node.category && node.category.name,
              theme: node.theme && node.theme.title,
              priceEstimation: node.estimation && node.estimation,
              likers: node.likers && node.likers,
              lastActivity: {
                date: node.updatedAt && node.updatedAt,
                user: node.updatedBy && node.updatedBy.displayName
              },
              publishedOn: node.createdAt && node.createdAt,
            }
          )
        });

    const isHidden = (element) => {
      return data && data.filter(e => Array.isArray(e[element]) ? e[element].length !==0 : e[element] ).length === 0
    };

    const columns = [
      { style: { width: '250px', verticalAlign: 'top' }, hidden: isHidden('title'), dataField: 'title', text: 'admin.fields.selection.proposal',headerFormatter: this.columnTitleFormatter, formatter: this.titleFormatter },
      { style: { width: '250px' }, hidden: isHidden('implementationPhase'), dataField: 'implementationPhase', text: 'implementation-phase', headerFormatter: this.columnTitleFormatter, formatter: this.implementationPhaseFormatter},
      { style: { width: '200px' }, hidden: isHidden('status'), dataField: 'status', text: 'admin.fields.theme.status', headerFormatter: this.columnTitleFormatter, formatter: this.statusFormatter },
      { style: { width: '200px' }, hidden: isHidden('author'), dataField: 'author', text: 'project_download.label.author', headerFormatter: this.columnTitleFormatter, formatter: this.authorFormatter },
      { style: { width: '150px' }, hidden: isHidden('ref'), dataField: 'ref', text: 'proposal.admin.reference', headerFormatter: this.columnTitleFormatter },
      { style: { width: '200px' }, hidden: isHidden('district'), dataField: 'district', text: 'proposal.district', headerFormatter: this.columnTitleFormatter },
      { style: { width: '200px' }, hidden: isHidden('category'), dataField: 'category', text: 'proposal.category', headerFormatter: this.columnTitleFormatter },
      { style: { width: '200px' }, hidden: isHidden('theme'), dataField: 'theme', text: 'proposal.theme', headerFormatter: this.columnTitleFormatter },
      { style: { width: '200px' }, hidden: isHidden('priceEstimation'), dataField: 'priceEstimation', text: 'proposal.estimation', headerFormatter: this.columnTitleFormatter, formatter: this.estimationFormatter },
      { style: { width: '250px' }, hidden: isHidden('likers'), dataField: 'likers', text: 'project_download.label.likers', headerFormatter: this.columnTitleFormatter, formatter: this.likersFormatter },
      { style: { width: '200px' }, hidden: isHidden('lastActivity'), dataField: 'lastActivity', text: 'last-activity', headerFormatter: this.columnTitleFormatter, formatter: this.lastActivityFormatter },
      { style: { width: '150px' }, hidden: isHidden('publishedOn'), dataField: 'publishedOn', text: 'published-on', headerFormatter: this.columnTitleFormatter, formatter: this.publishedOnFormatter },
    ];

    const tableWidth =
      columns
        .filter(column => column.hidden !== true)
        .reduce((accumulator, currentValue) => accumulator + parseInt(currentValue.style.width, 0), 0);

    return this.getTable(tableWidth, columns, data);
  }
}

export default createFragmentContainer(ProposalListTable, {
  step: graphql`
  fragment ProposalListTable_step on ProposalStep
    {
      form {
        usingThemes
        usingDistrict
        usingCategories
      }
    }
  `,
  proposals: graphql`
    fragment ProposalListTable_proposals on ProposalConnection
      @argumentDefinitions(
        stepId: { type: "ID", nonNull: false }
      ) {
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
