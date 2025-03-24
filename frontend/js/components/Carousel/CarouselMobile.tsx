import React, { PureComponent } from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import moment from 'moment'
import { DatesInterval } from '../Utils/DatesInterval'
import DarkenGradientMedia from '../Ui/Medias/DarkenGradientMedia'
import RatioMediaContainer from '../Ui/Medias/RatioMediaContainer'

type Props = {
  highlighteds: Array<Record<string, any>>
}
type State = {
  translateX: number
  windowWidth: number
}
export class CarouselMobile extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      translateX: 0,
      windowWidth: window.innerWidth,
    }
  }

  componentDidMount() {
    const carousel = document.querySelector('.carousel__mobile')
    let isDown = false
    let startX

    if (carousel) {
      // touch
      carousel.addEventListener('touchstart', (e: TouchEvent) => {
        isDown = true

        const touchPosition = e.touches && e.touches[0].pageX
        // @ts-expect-error
        startX = touchPosition - carousel.offsetLeft
      })
      // mouse
      carousel.addEventListener('mousedown', (e: MouseEvent) => {
        isDown = true // @ts-expect-error
        startX = e.pageX - carousel.offsetLeft
      })
      carousel.addEventListener('touchleave', () => {
        isDown = false
      })
      carousel.addEventListener('mouseleave', () => {
        isDown = false
      })
      carousel.addEventListener('touchend', () => {
        isDown = false
      })
      carousel.addEventListener('mouseup', () => {
        isDown = false
      })
      carousel.addEventListener('touchmove', (e: TouchEvent) => {
        // @ts-expect-error
        const x = e.touches[0].pageX - carousel.offsetLeft
        this.getTranslateOnMove(x, e, isDown, startX, carousel)
      })
      carousel.addEventListener('mousemove', (e: MouseEvent) => {
        // @ts-expect-error
        const x = e.pageX - carousel.offsetLeft
        this.getTranslateOnMove(x, e, isDown, startX, carousel)
      })
    }

    window.addEventListener('resize', () => {
      this.setState({
        windowWidth: window.innerWidth,
      })
    })
  }

  getTranslateOnMove = (x: number, e: Event, isDown: boolean, startX: number, carousel: Record<string, any>) => {
    const { highlighteds } = this.props
    const { translateX } = this.state
    const carouselItem = carousel && carousel.getElementsByClassName('item')
    const carouselTotalWidth =
      carouselItem[0].offsetWidth * // carousel item width
        (highlighteds.length - 1) - // number of item without visible item
      10
    // remove padding for last item
    if (!isDown) return
    e.preventDefault()
    const walk = (x - startX) / 10

    if (walk + translateX <= 0 && walk + translateX >= -carouselTotalWidth) {
      this.setState({
        translateX: walk + translateX,
      })
    }

    if (walk + translateX > 0) {
      this.setState({
        translateX: 0,
      })
    }

    if (walk + translateX < -carouselTotalWidth) {
      this.setState({
        translateX: -carouselTotalWidth,
      })
    }
  }

  render() {
    const { highlighteds } = this.props
    const { translateX, windowWidth } = this.state
    const translation = `translateX(${translateX}px)`
    return (
      <div className="carousel__mobile">
        <div
          className="mobile__content"
          id="mobile-content"
          style={{
            transform: translation,
          }}
        >
          {highlighteds.map((highlighted, index) => {
            const type = highlighted.object_type
            const item = highlighted[type]
            const maxItemLength = 55
            const trimmedString =
              item.title.length > maxItemLength ? `${item.title.substring(0, maxItemLength)}...` : item.title
            const hadLinearGradient = windowWidth >= 768

            const getMedia = () => {
              if (highlighted[type].media) {
                return <DarkenGradientMedia linearGradient={hadLinearGradient} url={highlighted[type].media.url} />
              }

              if (highlighted[type].cover) {
                return <DarkenGradientMedia linearGradient={hadLinearGradient} url={highlighted[type].cover.url} />
              }

              return <div className="bg--default bg--project" />
            }

            return (
              <div className="item" key={index}>
                <RatioMediaContainer>{getMedia()}</RatioMediaContainer>
                <div className="carousel__content">
                  <p>
                    <span className="carousel__type">
                      <FormattedMessage id={`type-${highlighted.object_type}`} />
                    </span>
                    <br />
                    <a
                      className="carousel__title"
                      href={highlighted[type]._links ? highlighted[type]._links.show : '#'}
                    >
                      {trimmedString}
                    </a>
                    <br />
                    <span className="carousel__date">
                      {type === 'event' && item.startAt && item.endAt && (
                        <DatesInterval startAt={item.startAt} endAt={item.endAt} />
                      )}
                      {type === 'project' && item.startAt && (
                        <FormattedDate
                          value={moment(item.startAt).toDate()}
                          day="numeric"
                          month="long"
                          year="numeric"
                        />
                      )}
                      {type === 'idea' && item.createdAt && (
                        <FormattedDate
                          value={moment(item.createdAt).toDate()}
                          day="numeric"
                          month="long"
                          year="numeric"
                        />
                      )}
                      {type === 'post' && item.publishedAt && (
                        <FormattedDate
                          value={moment(item.publishedAt).toDate()}
                          day="numeric"
                          month="long"
                          year="numeric"
                        />
                      )}
                    </span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
export default CarouselMobile
