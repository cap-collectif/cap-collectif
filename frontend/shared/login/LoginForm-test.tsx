/* eslint-env jest */
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { MockProviders, FormWrapper } from '~/testUtils'
import { LoginForm } from './LoginForm'

describe('<LoginForm />', () => {
  let testComponentTree: any

  it('renders a form with inputs', () => {
    testComponentTree = ReactTestRenderer.create(
      <MockProviders useCapUIProvider>
        <FormWrapper>
          <LoginForm />
        </FormWrapper>
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
