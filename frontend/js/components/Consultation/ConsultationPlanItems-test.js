// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationPlanItems } from './ConsultationPlanItems';

describe('<ConsultationPlanItems />', () => {
  const props = {
    section: {
      contribuable: true,
      contributionsCount: 0,
      slug: 'title1',
      subtitle: 'subtitle',
      title: 'Title1',
      sections: [
        {
          contribuable: true,
          contributionsCount: 0,
          slug: 'chapter1',
          subtitle: 'subtitle',
          title: 'Chapter1',
        },
      ],
    },
    level: 0,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationPlanItems {...props} />);
    wrapper.setState({ isOpen: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with close section', () => {
    const wrapper = shallow(<ConsultationPlanItems {...props} />);
    const collapse = wrapper.find('Collapse');
    expect(collapse.props().in).toEqual(false);
  });
});
