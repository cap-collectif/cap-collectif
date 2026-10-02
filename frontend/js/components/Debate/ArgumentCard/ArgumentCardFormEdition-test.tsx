/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ArgumentCardFormEdition } from './ArgumentCardFormEdition'
import { $refType, formMock, intlMock } from '~/mocks'

const baseProps = {
  ...formMock,
  intl: intlMock,
  argument: {
    ' $refType': $refType,
    id: 'argumentPour42',
    body: 'Oui',
  },
  body: 'plop',
  goBack: jest.fn(),
  onSuccess: jest.fn(),
  onError: jest.fn(),
  getValues: jest.fn(),
  initialValues: {
    body: 'Oui',
  },
}
const props = {
  base: baseProps,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ArgumentCardFormEdition />', () => {
  it('renders correcty', () => {
    const wrapper = shallow(<ArgumentCardFormEdition {...props.base} />)
    expect(wrapper).toMatchSnapshot()
  })
})
