// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
// import { $refType } from '../../mocks';
import { ReactBootstrapTable } from './ReactBootstrapTable';

describe('<ReactBootstrapTable />', () => {
  it('renders table with all type of data', () => {
    const wrapper = shallow(
      <ReactBootstrapTable>
        <React.Fragment>
          <th>Titre</th>
          <th>Valeur</th>
        </React.Fragment>
        <React.Fragment>
          <tr>
            <td>1</td>
            <td>2</td>
          </tr>
          <tr>
            <td>1</td>
            <td>2</td>
          </tr>
        </React.Fragment>
      </ReactBootstrapTable>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
