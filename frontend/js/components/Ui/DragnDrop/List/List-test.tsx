/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import List from './List'

describe('<List />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<List id="1">Bonjour</List>)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with position', () => {
    const props = {
      children: [
        {
          key: 1,
          props: {
            id: 'props1',
            mobileTop: true,
            position: 0,
            width: '100%',
            children: {
              props: {
                isVoteVisibilityPublic: true,
                member: 'vote[0]',
                step: {
                  votesLimit: 9,
                  votesRanking: true,
                },
              },
            },
          },
        },
        {
          key: 2,
          props: {
            id: 'props2',
            mobileTop: true,
            position: 1,
            width: '100%',
            children: {
              props: {
                isVoteVisibilityPublic: true,
                member: 'vote[0]',
                step: {
                  votesLimit: 9,
                  votesRanking: true,
                },
              },
            },
          },
        },
      ],
      title: 'Test',
      isDisabled: false,
      isCombineEnabled: false,
      isCombineOnly: false,
      hasPositionDisplayed: true,
    }
    const wrapper = shallow(
      <List id="1" {...props}>
        Bonjour
      </List>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
