// @flow
import * as React from 'react';
import styled from 'styled-components';
import { Table } from 'react-bootstrap';

type Props = {
  children: Object,
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

export class ReactBootstrapTable extends React.Component<Props> {
  render() {
    const { children } = this.props;

    return (
      <Container>
        <Table bordered hover>
          <thead>
            <tr>{children[0]}</tr>
          </thead>
          <tbody>{children[1]}</tbody>
        </Table>
      </Container>
    );
  }
}

export default ReactBootstrapTable;
