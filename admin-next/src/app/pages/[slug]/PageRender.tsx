'use client'

import { Box } from '@cap-collectif/ui'
import { useAppContext } from '@components/AppProvider/App.context'
import PageHeading from '@components/Frontend/PageHeading/PageHeading'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { useNavBarContext } from '@shared/navbar/NavBar.context'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { evalCustomCode } from 'src/app/custom-code'
import { GlobalFrontOfficeCKEDITORStyles } from 'src/app/styles'

type Props = {
  title: string
  body: string
  customCode?: string
}

export const PageRender: FC<Props> = ({ title, body, customCode }) => {
  const intl = useIntl()
  const { siteColors } = useAppContext()
  const { setBreadCrumbItems } = useNavBarContext()

  useEffect(() => {
    evalCustomCode(customCode)
  }, [customCode])

  useEffect(() => {
    setBreadCrumbItems([
      { title: intl.formatMessage({ id: 'navbar.homepage' }), href: '/' },
      { title: title, href: '' },
    ])
  }, [intl, setBreadCrumbItems, title])

  return (
    <>
      <GlobalFrontOfficeCKEDITORStyles {...siteColors} />
      <PageHeading title={title} />
      <Box
        maxWidth={pxToRem(1280)}
        width="100%"
        margin="auto"
        px={[4, 6]}
        py={[8, 'xxl']}
        overflowX={['visible', 'hidden']}
      >
        <WYSIWYGRender value={body} className="old-editor" />
      </Box>
    </>
  )
}

export default PageRender
