/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { LoginForm } from './LoginForm'
import MockProviders, { FormWrapper } from 'tests/testUtils'

describe('<LoginForm />', () => {
  let testComponentTree: any

  it('renders a form with inputs', () => {
    testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <FormWrapper>
          <LoginForm />
        </FormWrapper>
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
