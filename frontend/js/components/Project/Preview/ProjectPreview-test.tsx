/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { $fragmentRefs, $refType } from '~/mocks'
import { features } from '~/redux/modules/default'
import { ProjectPreview } from './ProjectPreview'

const defaultProject = {
  project: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: 'UHJvamVjdDpwcm9qZWN0MQ==',
  },
  features,
  isProjectsPage: false,
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProjectPreview />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectPreview {...defaultProject} />)
    expect(wrapper).toMatchSnapshot()
  })
})
