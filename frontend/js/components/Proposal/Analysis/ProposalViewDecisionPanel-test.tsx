/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalViewDecisionPanel } from './ProposalViewDecisionPanel'
import { $refType } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalViewDecisionPanel  /> ', () => {
  it('renders correctly', () => {
    const props = {
      proposal: {
        ' $refType': $refType,
        id: 'id',
        decision: {
          state: 'DONE',
          estimatedCost: 8000,
          officialResponse: {
            id: 'pid',
            body: '<html>il est en promo<html>',
            authors: [
              {
                id: 'authorId',
                username: 'Oeeeeeeeeeee g fini tuconé',
              },
            ],
          },
          isApproved: true,
        },
      },
    }
    const wrapper = shallow(<ProposalViewDecisionPanel {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
