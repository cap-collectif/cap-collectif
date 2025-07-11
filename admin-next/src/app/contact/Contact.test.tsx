/* eslint-env jest */
import ReactTestRenderer from 'react-test-renderer'
import Contact from './Contact'
import { MockProviders } from 'tests/testUtils'

describe('<Contact />', () => {
  let testComponentTree

  const data = {
    contactPageTitle: { value: 'Contact us' },
    description: { value: 'Lorem ipsum' },
    customCode: { value: '<style>div{display:flex;}</style>' },
    contactForms: [
      { id: 'contactForm1', body: 'blablabla nice project nice collab', title: 'For a project' },
      { id: 'contactForm2', body: 'blblbl nice platform', title: 'For another request', confidentiality: 'CNIL stuff' },
    ],
  }

  it('renders correctly', () => {
    testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <Contact data={data} />
      </MockProviders>,
    )
    expect(testComponentTree).toMatchSnapshot()
  })
})
