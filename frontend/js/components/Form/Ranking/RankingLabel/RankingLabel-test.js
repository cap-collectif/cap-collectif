/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RankingLabel from './RankingLabel';

const baseRankingLabel = {
  label: 'bonjour',
  image: {
    url: 'https://i.picsum.photos/id/257/200/200.jpg',
  },
  description: 'ceci est la description',
  isSelected: false,
  onPick: () => {},
};

const rankingLabel = {
  basic: {
    ...baseRankingLabel,
  },
  withoutDescription: {
    ...baseRankingLabel,
    description: null,
  },
  withoutImage: {
    ...baseRankingLabel,
    image: null,
  },
};

describe('<RankingLabel />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<RankingLabel {...rankingLabel.basic} hasIllustrationDisplayed />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly without description', () => {
    const wrapper = shallow(<RankingLabel {...rankingLabel.withoutDescription} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly without image', () => {
    const wrapper = shallow(<RankingLabel {...rankingLabel.withoutImage} />);
    expect(wrapper).toMatchSnapshot();
  });
});
