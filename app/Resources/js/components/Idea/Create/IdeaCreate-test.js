/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { IdeaCreate } from './IdeaCreate';

describe('<IdeaCreate />', () => {
  it('should render a div with correct classes, an idea create button and a modal with an idea form', () => {
    const wrapper = shallow(
      <IdeaCreate
        dispatch={jest.fn()}
        show
        submitting={false}
        className="css-class"
        themes={[]}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
