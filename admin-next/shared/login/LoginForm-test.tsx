/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import { LoginForm } from './LoginForm'
import MockProviders, { FormWrapper } from 'tests/testUtils'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<LoginForm />', () => {
  it('renders a form with inputs', () => {
    const { asFragment } = render(
      <MockProviders>
        <FormWrapper>
          <LoginForm />
        </FormWrapper>
      </MockProviders>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
