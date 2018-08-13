// @flow
import * as React from 'react';
import styled from 'styled-components';
// import BootstrapTable from 'react-bootstrap-table-next';
import {Label, Table} from 'react-bootstrap';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import ProgressList from './List/ProgressList';
import UserAvatar from '../User/UserAvatar';
import InlineList from './List/InlineList';

type Props = {
  data: Array<Object>,
};

export const Container = styled.div`
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
`;

// type Cell = {
//   text: string,
//   value: ?any,
//   width?: string,
//   hidden?: boolean,
// };
//
// type Row = {};

export class ReactBootstrapTable extends React.Component<Props> {

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

  getCell = (rows) => {

    return Object.entries(rows).map(([keyName, cell], key) => {
      console.warn(keyName, cell);

      const value = cell.value;

      if (keyName === 'title' && value) {
        return (
          <td>
            <a href={value.url}>{value.displayTitle}</a>
          </td>
        )
      }

      if (keyName === 'implementationPhase' && value) {
        const list =
          value &&
          value.list.map(e => {
            let isActive = false;

            if (e.endAt && moment().isAfter(e.endAt)) {
              isActive = true;
            }

            return {
              title: e.title,
              isActive,
            };
          });

        return (
          <td className="m-auto">
            <div className="mb-10">
              <span>{value.title}</span>
            </div>
            <ProgressList progressListItem={list} className="mt-10" />
          </td>
        );
      }

      if (keyName === 'status' && value) {
        return (
          <td>
            <Label bsStyle={value.color} className="badge-pill">
              {value.name}
            </Label>
          </td>
        );
      }

      if (keyName === 'author' && value) {
        return (
          <td className="d-flex align-items-baseline">
            <UserAvatar
              user={{ username: value.displayName, media: value.media, _links: {} }}
              defaultAvatar={null}
            />
            {value.url ? (
              <a href={value.url}>{value.displayName}</a>
            ) : (
              <span>{value.displayName}</span>
            )}
          </td>
        );
      }

      if (keyName === 'priceEstimation' && value) {
        return <td>{value} €</td>;
      }

      if (keyName === 'lastActivity' && value) {
        if (value.user) {
          return (
            <td>
              <FormattedMessage
                id="last-activity-date"
                values={{
                  date: <FormattedDate value={moment(value.date).toDate()} />,
                  user: value.user,
                }}
              />
            </td>
          );
        }

        return <FormattedDate value={moment(value.date).toDate()} />;
      }

      if (keyName === 'likers' && value) {
        return (
          <td>
            <InlineList className="mb-0">
              {value.map((user, i) => <li key={i}>{user.displayName}</li>)}
            </InlineList>
          </td>
        );
      }

      if (keyName === 'publishedOn' && value) {
        return <td><FormattedDate value={moment(value).toDate()} /></td>;
      }

      return <td>{value}</td>;
    })

    // return <td>ici ma variable</td>
  };

  render() {
    const { data } = this.props;
    const columns = this.getColumns();

    return (
      <Container>
        <Table bordered hover>
          <thead>
            <tr>
              {columns.map(column => (
                <th style={{ width: column.width ? column.width : '200px' }}><FormattedMessage id={column.text} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
          {data.map((rows) => {
            return (
              <tr>
                {this.getCell(rows)}
              </tr>
            );
          })}
          </tbody>
        </Table>
      </Container>
    );
  }
}

export default ReactBootstrapTable;
