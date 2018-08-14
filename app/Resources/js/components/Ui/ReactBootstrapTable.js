// @flow
import * as React from 'react';
import styled from 'styled-components';
import { Label, Table } from 'react-bootstrap';
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
  overflow-x: auto;
  border: 1px solid #e3e3e3;
  margin-bottom: 20px;

  .table {
    table-layout: fixed;
    margin-bottom: 0;
    border: none;
  }

  thead > tr > th {
    background-color: #f6f6f6;
    border-bottom-width: 1px;
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

type Column = {
  style: Object,
  hidden: ?boolean,
  text: string,
  key: number,
};

type Cell = {
  text: string,
  value: any,
  width?: string,
};

export class ReactBootstrapTable extends React.Component<Props> {
  getColumns = (): Array<Column> => {
    const { data } = this.props;

    const columnsName = Object.keys(data[0]);
    const firstData = data[0];

    const isHidden = cellName => {
      return (
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
        }).length === 0
      );
    };

    const column = columnsName.map((columnName, key) => {
      return {
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
      };
    });

    return column;
  };

  getCell = (rows: { [string]: Cell }) => {
    const columns = this.getColumns();

    const hiddenColumnKey = columns
      .filter(column => column.hidden === true)
      .reduce((prev, curr) => [...prev, curr.key], []);

    return Object.entries(rows).map(([keyName, cell], key) => {
      const value = cell && cell.value;

      if (hiddenColumnKey.includes(key)) {
        return null;
      }

      if (keyName === 'title' && value) {
        return (
          <td key={key}>
            <a href={value.url}>{value.displayTitle}</a>
          </td>
        );
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
          <td className="m-auto" key={key}>
            <div className="mb-10">
              <span>{value.title}</span>
            </div>
            <ProgressList progressListItem={list} className="mt-10" />
          </td>
        );
      }

      if (keyName === 'status' && value) {
        return (
          <td key={key}>
            <Label bsStyle={value.color} className="badge-pill">
              {value.name}
            </Label>
          </td>
        );
      }

      if (keyName === 'author' && value) {
        return (
          <td key={key}>
            <div className="d-flex align-items-center">
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
          </td>
        );
      }

      if (keyName === 'priceEstimation' && value) {
        return <td key={key}>{value} €</td>;
      }

      if (keyName === 'lastActivity' && value) {
        if (value.date) {
          if (value.user) {
            return (
              <td key={key}>
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
            <InlineList className="mb-0">
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

      return <td key={key}>{value}</td>;
    });
  };

  render() {
    const { data } = this.props;
    const columns = this.getColumns();

    return (
      <Container>
        <Table bordered hover>
          <thead>
            <tr>
              {columns.map((column, key) => (
                <th
                  style={{
                    width: column.style.width ? column.style.width : '200px',
                    display: column.hidden === true ? 'none' : 'table-cell',
                  }}
                  key={key}>
                  <FormattedMessage id={column.text || 'global.non_applicable'} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((rows, key) => {
              return <tr key={key}>{this.getCell(rows)}</tr>;
            })}
          </tbody>
        </Table>
      </Container>
    );
  }
}

export default ReactBootstrapTable;
