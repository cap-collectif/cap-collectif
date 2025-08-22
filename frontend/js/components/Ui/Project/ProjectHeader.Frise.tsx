import * as React from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import { getBaseLocale } from '~/utils/router'
import type { GlobalState } from '~/types'

type RouterWrapperProps = {
  readonly router?: boolean
  readonly children: JSX.Element | JSX.Element[] | string
  readonly href: string
  readonly stepId: string
  readonly questionnaireId?: string
  readonly platformLocale: string
}

const Route = ({ children, href, stepId, questionnaireId, platformLocale }: RouterWrapperProps) => {
  const { projectSlug } = useParams()
  const currentLanguage = useSelector((state: GlobalState) => state.language.currentLanguage)
  const baseUrl = getBaseLocale(currentLanguage, platformLocale)
  return (
    <Link
      to={{
        pathname: `${baseUrl}/project/${projectSlug || ''}${href}`,
        state: {
          stepId,
          questionnaireId,
        },
      }}
    >
      {children}
    </Link>
  )
}

export const RouterWrapper = ({
  router,
  children,
  href,
  stepId,
  questionnaireId,
  platformLocale,
}: RouterWrapperProps) => {
  return router ? (
    <Route stepId={stepId} questionnaireId={questionnaireId} href={href} platformLocale={platformLocale}>
      {children}
    </Route>
  ) : (
    <>{children}</>
  )
}
