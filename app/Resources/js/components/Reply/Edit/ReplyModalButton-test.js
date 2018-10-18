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
      id: 'reply2',
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
        id: 'reply2',
        $fragmentRefs,
      },
      {
        id: 'reply5',
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
