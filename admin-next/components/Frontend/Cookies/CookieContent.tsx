import React, { FC } from 'react'
import { useIntl } from 'react-intl'
import { layoutQuery$data } from '@relay/layoutQuery.graphql'
import { baseUrl } from '@utils/config'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'

type Props = {
  SSRData: layoutQuery$data
}
type cookieType = {
  cookieType: number
  nbCookies: number
}

const getCookieType = (analyticsJs: string | null | undefined, adJs: string | null | undefined): cookieType => {
  if (analyticsJs && analyticsJs !== '' && (!adJs || adJs === '')) {
    return {
      cookieType: 0,
      nbCookies: 2,
    }
  }

  if (adJs && adJs !== '' && (!analyticsJs || analyticsJs === '')) {
    return {
      cookieType: 2,
      nbCookies: 2,
    }
  }

  if (adJs && adJs !== '' && analyticsJs && analyticsJs !== '') {
    return {
      cookieType: 3,
      nbCookies: 3,
    }
  }

  return {
    cookieType: -1,
    nbCookies: 1,
  }
}

export const CookieContent: FC<Props> = ({ SSRData }) => {
  const intl = useIntl()
  const { ads, analytics, cookiesList } = SSRData
  const cookies = getCookieType(analytics?.value, ads?.value)
  const hasScript = analytics?.value || ads?.value

  return (
    <div>
      {cookies.cookieType > 0 ? (
        <div>
          <WYSIWYGRender
            value={intl.formatMessage(
              { id: 'cookies-page-texte-tmp-part1' },
              {
                platformLink: baseUrl,
                cookieType: cookies.cookieType,
              },
            )}
          />
        </div>
      ) : (
        <div>
          <WYSIWYGRender
            value={intl.formatMessage(
              { id: 'cookies-page-texte-part1' },
              {
                platformLink: baseUrl,
              },
            )}
          />
        </div>
      )}
      <WYSIWYGRender
        value={intl.formatMessage(
          { id: hasScript ? 'cookies-page-texte-part1-2' : 'cookies-page-texte-part1-2-noScript' },
          {
            platformLink: baseUrl,
          },
        )}
      />
      <WYSIWYGRender
        value={intl.formatMessage(
          { id: 'cookies-page-texte-tmp-part1-3' },
          {
            platformLink: baseUrl,
            nbCookies: cookies.nbCookies,
          },
        )}
      />
      {cookiesList?.value ? <WYSIWYGRender value={cookiesList.value} /> : null}
      <WYSIWYGRender
        value={intl.formatMessage(
          { id: 'cookies-page-texte-part2' },
          {
            platformLink: baseUrl,
          },
        )}
      />
    </div>
  )
}

export default CookieContent
