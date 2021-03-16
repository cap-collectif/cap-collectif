// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageVoteForm } from './DebateStepPageVoteForm';
import { $refType, $fragmentRefs, formMock, intlMock } from '~/mocks';

describe('<DebateStepPageVoteForm/>', () => {
  const debate = {
    $fragmentRefs,
    id: 'debate1',
    $refType,
  };

  const viewer = {
    id: 'viewer-123',
    username: 'Jean Castex',
    isEmailConfirmed: true,
  };

  const props = {
    ...formMock,
    intl: intlMock,
    body: 'Oui je suis pour',
    showArgumentForm: true,
    setVoteState: jest.fn(),
    setShowArgumentForm: jest.fn(),
    viewerIsConfirmed: true,
    organizationName: 'CapCollectif',
    widgetLocation: null,
    viewer,
  };

  it('should renders correctly', () => {
    const wrapper = shallow(<DebateStepPageVoteForm {...props} voteState="NONE" debate={debate} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly on mobile', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="NONE" debate={debate} isMobile />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly when voted', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="VOTED" debate={debate} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly when voted on mobile', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="VOTED" debate={debate} isMobile />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when voted without argument', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm
        {...props}
        voteState="VOTED"
        debate={{ ...debate, viewerHasArgument: false }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when voted without argument on mobile', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm
        {...props}
        voteState="VOTED"
        debate={{ ...debate, viewerHasArgument: false }}
        isMobile
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when argumented', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="ARGUMENTED" debate={debate} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly when argumented on mobile', () => {
    const wrapper = shallow(
      <DebateStepPageVoteForm {...props} voteState="ARGUMENTED" debate={debate} isMobile />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
