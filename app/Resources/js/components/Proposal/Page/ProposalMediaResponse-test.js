/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { ProposalMediaResponse } from './ProposalMediaResponse';
import IntlData from '../../../translations/FR';

describe('<ProposalMediaResponse />', () => {
  const props = {
    medias: [
      { url: '/media/1.jpg', name: 'Media1', size: '2 Mo' },
      { url: '/media/2.jpg', name: 'Media2', size: '2 Mo' },
    ],
  };

  it('should render a list of files', () => {
    const wrapper = shallow(<ProposalMediaResponse {...props} {...IntlData} />);
    expect(wrapper.find('Row')).to.have.length(1);
    expect(wrapper.find('Col')).to.have.length(2);
    const link1 = wrapper.find('Col').at(0).find('a');
    const link2 = wrapper.find('Col').at(1).find('a');
    expect(link1.text()).to.equal('Media1 (2 Mo)');
    expect(link2.text()).to.equal('Media2 (2 Mo)');
    expect(link1.props().href).to.equal('/media/1.jpg');
    expect(link2.props().href).to.equal('/media/2.jpg');
  });

  it('should render nothin when no media', () => {
    const wrapper = shallow(<ProposalMediaResponse medias={[]} {...IntlData} />);
    expect(wrapper.html()).to.equal(null);
  });
});
