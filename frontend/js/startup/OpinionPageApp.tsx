// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import { connect } from 'react-redux'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'
import type { Props as OpinionPageProps } from '~/components/Opinion/OpinionPage'
import type { GlobalState } from '~/types'
type ReduxProps = {
  readonly hasNewConsultationPage: boolean
}
type Props = ReduxProps & OpinionPageProps
const OpinionPage = lazy(
  () =>
    import(
      /* webpackChunkName: "OpinionPage" */
      '~/components/Opinion/OpinionPage'
    ),
)
const NewOpinionPage = lazy(() => import('~/components/Opinion/New/NewOpinionPage'))

const mapStateToProps = (state: GlobalState) => ({
  hasNewConsultationPage: state.default.features.unstable__new_consultation_page,
})

const OpinionPageApp = ({ hasNewConsultationPage, ...props }: Props) => {
  return hasNewConsultationPage ? <NewOpinionPage {...props} /> : <OpinionPage {...props} />
}

const OpinionPageAppContainer = connect<any, any>(mapStateToProps)(OpinionPageApp)
export default (props: Props) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Suspense fallback={<Loader />}>
      <Providers resetCSS={false} designSystem>
        <OpinionPageAppContainer {...props} />
      </Providers>
    </Suspense>
  )
}