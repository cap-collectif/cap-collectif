/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPreview } from './ProposalPreview';
import { $refType, $fragmentRefs } from '../../../mocks';
import { features } from '../../../redux/modules/default';

describe('<ProposalPreview />', () => {
  const proposal = {
    $refType,
    $fragmentRefs,
    id: '1',
    author: {
      vip: false,
    },
    media: {
      url: '/svg/img.svg',
    },
    category: {
      categoryImage: {
        id: 'categoryImage1',
        image: null,
      },
    },
  };

  const proposalVip = {
    $refType,
    $fragmentRefs,
    id: '1',
    author: {
      vip: true,
    },
    media: null,
    category: {
      categoryImage: {
        id: 'categoryImage1',
        image: {
          url: 'http://image.mypicture.jpg',
        },
      },
    },
  };

  const step = {
    $refType,
    $fragmentRefs,
  };

  it('should render a proposal preview', () => {
    const wrapper = shallow(
      <ProposalPreview proposal={proposal} step={step} features={features} viewer={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal preview vip', () => {
    const featureProps = {
      ...features,
      display_pictures_in_depository_proposals_list: true,
    };
    const wrapper = shallow(
      <ProposalPreview proposal={proposalVip} step={step} features={featureProps} viewer={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a proposal preview with custom image', () => {
    const featureProps = {
      ...features,
      display_pictures_in_depository_proposals_list: true,
    };
    const noCateogryImage = {
      ...proposal,
      category: {
        categoryImage: null,
      },
    };
    const wrapper = shallow(
      <ProposalPreview proposal={noCateogryImage} step={step} features={featureProps} viewer={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
