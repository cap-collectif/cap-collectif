// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../../mocks';
import { UpdateReplyModal } from './UpdateReplyModal';

describe('<UpdateReplyModal />', () => {
  const defaultProps = {
    show: true,
    onClose: () => {},
    reply: {
      $refType,
      $fragmentRefs,
      id: 'UmVwbHk6cmVwbHky',
      createdAt: '2016-03-01 00:00:00',
      questionnaire: {
        $fragmentRefs,
      },
    },
    questionnaire: {
      viewerReplies: {},
    },
  };

  const questionnaireWithReplies = {
    viewerReplies: [
      {
        id: 'UmVwbHk6cmVwbHky',
        $fragmentRefs,
      },
      {
        id: 'UmVwbHk6cmVwbHk1',
        $fragmentRefs,
      },
    ],
  };

  it('should render correctly with minimal props', () => {
    const props = defaultProps;
    const wrapper = shallow(<UpdateReplyModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with replies', () => {
    const props = {
      ...defaultProps,
      questionnaire: questionnaireWithReplies,
    };
    const wrapper = shallow(<UpdateReplyModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
