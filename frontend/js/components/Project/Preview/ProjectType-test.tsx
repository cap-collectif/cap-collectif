/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { $refType } from '../../../mocks'
import { ProjectType } from './ProjectType'

const defaultProps = {
  project: {
    ' $refType': $refType,
    type: null,
    archived: false,
  },
}
const projectWithType = {
  project: {
    ' $refType': $refType,
    type: {
      title: 'presentation',
      color: '#337ab7',
    },
    archived: false,
  },
}
const archivedProjectProps = {
  project: { ...defaultProps.project, archived: true },
}
describe('<ProjectPreview />', () => {
  it('should render correctly project type', () => {
    const wrapper = shallow(<ProjectType {...projectWithType} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly project with null type', () => {
    const wrapper = shallow(<ProjectType {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when project is archived', () => {
    const wrapper = shallow(<ProjectType {...archivedProjectProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
