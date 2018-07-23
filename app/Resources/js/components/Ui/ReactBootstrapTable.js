// @flow
import * as React from 'react';
import styled from 'styled-components';
import BootstrapTable from 'react-bootstrap-table-next';

type Props = {
  keyField: string,
  columns: Array<Object>,
  data: Array<Object>,
  width: number
};

export const Container = styled.div`
  .react-bootstrap-table {
    color: #333333;
    overflow-x: scroll;
    border: 1px solid #e3e3e3;
  
    .table {
        max-width: none;
        margin-bottom: 0;
        width : ${props => props.width}px;
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
  
    thead > tr > th,
    tbody > tr > td {
        padding: 10px 15px;
        vertical-align: middle;
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
  render() {
    const { keyField, columns, data, width } = this.props;

    return (
      <Container width={width.toString()}>
        <BootstrapTable keyField={keyField} columns={columns} data={data} />
      </Container>
    );
  }
}

export default ReactBootstrapTable;
