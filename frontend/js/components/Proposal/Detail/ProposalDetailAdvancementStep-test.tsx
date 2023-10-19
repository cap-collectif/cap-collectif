/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ProposalDetailAdvancementStep from './ProposalDetailAdvancementStep'
import MockProviders from '~/testUtils'

describe('<ProposalDetailAdvancementStep />', () => {
  const step = {
    title: 'Step title',
    startAt: '2017-09-05T15:48:55+0200',
    endAt: '2017-09-17T01:08:01+0200',
  }
  const status = {
    color: 'SUCCESS',
    name: 'Salut',
  }
  const roundColor = '#hexCode'
  it('can render a step without status', () => {
    const wrapper = shallow(
      <MockProviders
        store={{
          default: {
            parameters: {
              'color.btn.primary.bg': '#546E7A',
            },
          },
        }}
      >
        <ProposalDetailAdvancementStep step={step} roundColor={roundColor} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('can render a step with status', () => {
    const wrapper = shallow(
      <MockProviders
        store={{
          default: {
            parameters: {
              'color.btn.primary.bg': '#546E7A',
            },
          },
        }}
      >
        <ProposalDetailAdvancementStep step={step} roundColor={roundColor} status={status} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
