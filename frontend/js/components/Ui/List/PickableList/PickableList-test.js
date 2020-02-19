/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import PickableList from '~ui/List/PickableList';

const items = [
  {
    id: 'item1',
    title: 'Je suis un bel item #1',
  },
  {
    id: 'item2',
    title: 'Je suis un bel item #2',
  },
  {
    id: 'item3',
    title: 'Je suis un bel item #3',
  },
  {
    id: 'item4',
    title: 'Je suis un bel item #4',
  },
  {
    id: 'item5',
    title: 'Je suis un bel item #5',
  },
];

describe('<PickableList />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <PickableList.Provider>
        <PickableList>
          <PickableList.Header>
            <p>Items</p>
          </PickableList.Header>
          <PickableList.Body>
            {items.map(i => (
              <PickableList.Row key={i.id} rowId={i.id}>
                <p>{i.title}</p>
              </PickableList.Row>
            ))}
          </PickableList.Body>
        </PickableList>
        );
      </PickableList.Provider>,
    );
    expect(wrapper.render()).toMatchSnapshot();
  });

  it('should render correctly without header', () => {
    const wrapper = shallow(
      <PickableList.Provider>
        <PickableList>
          <PickableList.Body>
            {items.map(i => (
              <PickableList.Row key={i.id} rowId={i.id}>
                <p>{i.title}</p>
              </PickableList.Row>
            ))}
          </PickableList.Body>
        </PickableList>
      </PickableList.Provider>,
    );
    expect(wrapper.render()).toMatchSnapshot();
  });
});
