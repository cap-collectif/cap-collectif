'use client'

import { Box } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import PageHeading from '@components/FrontOffice/PageHeading/PageHeading'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC, useEffect } from 'react'
import { evalCustomCode } from 'src/app/custom-code'
import { GlobalFrontOfficeCKEDITORStyles } from 'src/app/styles'

type Props = {
  title: string
  body: string
  customCode?: string
}

export const PageRender: FC<Props> = ({ title, body, customCode }) => {
  const { siteColors } = useAppContext()

  useEffect(() => {
    evalCustomCode(customCode)
  }, [customCode])

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
