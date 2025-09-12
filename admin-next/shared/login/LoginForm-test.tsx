/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import { LoginForm } from './LoginForm'
import MockProviders, { FormWrapper } from 'tests/testUtils'

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
