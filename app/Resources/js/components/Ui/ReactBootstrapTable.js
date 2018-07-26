// @flow
import * as React from 'react';
import styled from 'styled-components';
import BootstrapTable from 'react-bootstrap-table-next';
import { Label } from 'react-bootstrap';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import ProgressList from './List/ProgressList';
import UserAvatar from '../User/UserAvatar';
import InlineList from './List/InlineList';

type Props = {
  data: Array<Object>,
};

export const Container = styled.div`
  .react-bootstrap-table {
    color: #333333;
    overflow-x: scroll;
    border: 1px solid #e3e3e3;
    margin-bottom: 20px;

    .table {
      max-width: none;
      margin-bottom: 0;
      border: none;
      width: ${props => props.width}px;
    }

    thead > tr > th {
      word-break: keep-all;
      vertical-align: middle;
      background-color: #f6f6f6;
      border-bottom-width: 1px;

      &:hover {
        background-color: #dddddd;
      }
    }

    tbody > tr:last-child td {
      border-bottom: none;
    }

    thead > tr > th,
    tbody > tr > td {
      padding: 10px 15px;
      vertical-align: middle;

      &:first-child {
        border-left: none;
      }

      &:last-child {
        border-right: none;
      }
    }

    td:not(:first-child) {
      font-weight: 500;
    }

    span.badge-pill {
      font-size: 13px;
      font-weight: 400;
    }

    ul {
      color: #333333;
      font-weight: 500;
    }
  }
`;

export class ReactBootstrapTable extends React.Component<Props> {
  getFormatter = (cell: Object, row: Object, index: number, key: string) => {
    const value = cell.value;

    if (key === 'title' && value) {
      return <a href={value.url}>{value.displayTitle}</a>;
    }

    if (key === 'implementationPhase' && value) {
      const list =
        value &&
        value.list.map(e => {
          let isActive = false;

          if (e.startAt && moment().isSameOrAfter(e.startAt)) {
            isActive = true;
          }

          return {
            title: e.title,
            isActive,
          };
        });

      return (
        <div className="m-auto">
          <div className="mb-10">
            <span>{value.title}</span>
          </div>
          <ProgressList list={list} className="mt-10" />
        </div>
      );
    }

    if (key === 'status' && value) {
      return (
        <Label bsStyle={value.color} className="badge-pill">
          {value.name}
        </Label>
      );
    }

    if (key === 'author' && value) {
      return (
        <div className="d-flex align-items-baseline">
          <UserAvatar
            user={{ username: value.displayName, media: value.media, _links: {} }}
            defaultAvatar={null}
          />
          {value.url ? (
            <a href={value.url}>{value.displayName}</a>
          ) : (
            <span>{value.displayName}</span>
          )}
        </div>
      );
    }

    if (key === 'priceEstimation' && value) {
      return <span>{value} €</span>;
    }

    if (key === 'lastActivity' && value) {
      if (value.user) {
        return (
          <FormattedMessage
            id="last-activity-date"
            values={{
              date: <FormattedDate value={moment(value.date).toDate()} />,
              user: value.user,
            }}
          />
        );
      }

      return <FormattedDate value={moment(value.date).toDate()} />;
    }

    if (key === 'likers' && value) {
      return (
        <InlineList className="mb-0">
          {value.map((user, i) => <li key={i}>{user.displayName}</li>)}
        </InlineList>
      );
    }

    if (key === 'publishedOn' && value) {
      return <FormattedDate value={moment(value).toDate()} />;
    }

    return <div>{value}</div>;
  };

  getColumns = () => {
    const { data } = this.props;

    const columnsName = Object.keys(data[0]);
    const firstData = data[0];

    const isHidden = element => {
      return (
        data &&
        data.filter(
          e => (Array.isArray(e[element].value) ? e[element].value.length !== 0 : e[element].value),
        ).length === 0
      );
    };

    const column: Array<Object> = columnsName.map(columnName => {
      return {
        style: { width: firstData[columnName].width ? firstData[columnName].width : '200px' },
        hidden: firstData[columnName].hidden ? firstData[columnName].hidden : isHidden(columnName),
        dataField: columnName,
        text: firstData[columnName] && firstData[columnName].text,
        formatter: this.getFormatter,
        formatExtraData: columnName,
        headerFormatter: this.columnTitleFormatter,
      };
    });

    return column;
  };

  getTableWidth = () => {
    const tableWidth = this.getColumns()
      .filter(column => column.hidden !== true)
      .reduce(
        (accumulator, currentValue) => accumulator + parseInt(currentValue.style.width, 0),
        0,
      );

    return tableWidth.toString();
  };

  columnTitleFormatter = (column: Object, index: number, { sortElement }: Object) => {
    return (
      <React.Fragment>
        <FormattedMessage id={column.text} />
        {sortElement}
      </React.Fragment>
    );
  };

  render() {
    const { data } = this.props;

    return (
      <Container width={this.getTableWidth()}>
        <BootstrapTable keyField="title" columns={this.getColumns()} data={data} />
      </Container>
    );
  }
}

export default ReactBootstrapTable;
