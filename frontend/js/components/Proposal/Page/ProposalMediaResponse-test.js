// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalMediaResponse } from './ProposalMediaResponse';
import { $refType } from '../../../mocks';

describe('<ProposalMediaResponse />', () => {
  const props = {
    medias: [
      { id: 'Media1', url: '/media/1.jpg', name: 'Media1', size: '2 Mo', $refType },
      { id: 'Media2', url: '/media/2.jpg', name: 'Media2', size: '2 Mo', $refType },
    ],
  };

  it('should render a list of files', () => {
    const wrapper = shallow(<ProposalMediaResponse {...props} />);
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find('Col')).toHaveLength(2);
    const link1 = wrapper
      .find('Col')
      .at(0)
      .find('a');
    const link2 = wrapper
      .find('Col')
      .at(1)
      .find('a');
    expect(link1.text()).toEqual('Media1 (2 Mo)');
    expect(link2.text()).toEqual('Media2 (2 Mo)');
    expect(link1.props().href).toEqual('/media/1.jpg');
    expect(link2.props().href).toEqual('/media/2.jpg');
  });

  it('should render nothin when no media', () => {
    const wrapper = shallow(<ProposalMediaResponse medias={[]} />);
    expect(wrapper.html()).toEqual(null);
  });
});
