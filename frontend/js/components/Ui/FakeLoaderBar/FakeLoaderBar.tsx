import * as React from 'react'
import FakeLoaderBarContainer from './FakeLoaderBar.style'

type Props = {
  isLoading: boolean
  isFinished: boolean
  timeToEnd?: number
}

const FakeLoaderBar = ({ isLoading = false, isFinished = false, timeToEnd = 2000 }: Props) => (
  <FakeLoaderBarContainer isFinished={isFinished} isLoading={isLoading} timeToEnd={timeToEnd}>
    <span className="progress" />
  </FakeLoaderBarContainer>
)

export default FakeLoaderBar
