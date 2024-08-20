import * as React from 'react'
import { connect } from 'react-redux'
import ReadMoreLink from '../../Utils/ReadMoreLink'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import type { GlobalState } from '~/types'
type ReduxProps = {
  readonly readMore?: boolean
}
type Props = ReduxProps & {
  readonly text?: string | null | undefined
  readonly maxLines: number
}
type State = {
  readonly expanded: boolean
  readonly truncated: boolean
  readonly hideText: boolean
}
export const LINE_HEIGHT = 22
export const DEFAULT_MAX_LINES = 7
export class BodyText extends React.Component<Props, State> {
  static defaultProps = {
    text: null,
    maxLines: DEFAULT_MAX_LINES,
  }
  refContent: {
    current: null | HTMLDivElement
  }
  hasMoreLines = false

  constructor(props: Props) {
    super(props)
    this.refContent = React.createRef<HTMLDivElement>()
    this.state = {
      expanded: true,
      truncated: false,
      hideText: false,
    }
  }

  componentDidMount = () => {
    const { readMore } = this.props

    if (this.refContent.current && readMore) {
      const { height } = this.refContent.current.getBoundingClientRect()
      const { maxLines } = this.props
      const lines = height / LINE_HEIGHT
      this.hasMoreLines = lines > maxLines
      this.setState({
        truncated: this.hasMoreLines,
        expanded: !this.hasMoreLines,
      })
    }
  }
  toggleExpand = () => {
    const { expanded } = this.state
    this.setState({
      expanded: !expanded,
    })
  }

  render() {
    const { text, maxLines } = this.props

    if (!text) {
      return null
    }

    const { truncated, hideText, expanded } = this.state
    const style = {
      maxHeight: expanded ? `none` : `${LINE_HEIGHT * maxLines}px`,
      overflow: expanded ? 'visible' : 'hidden',
      visibility: hideText ? 'hidden' : 'visible',
      padding: '0 5px',
    }
    return (
      <div className="step__intro">
        <div ref={this.refContent} className="body__infos__content">
          <WYSIWYGRender style={{ ...style }} value={text} />
        </div>
        {this.hasMoreLines && (
          <div>
            <ReadMoreLink visible={truncated} expanded={expanded} onClick={this.toggleExpand} />
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  readMore: state.default.features.read_more,
})

export default connect(mapStateToProps)(BodyText)
