import { FieldInput, FormControl } from '@cap-collectif/form'
import { CapUIFontSize, FormLabel, Text, UPLOADER_SIZE } from '@cap-collectif/ui'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { UPLOAD_PATH } from '@utils/config'

type Props = {
  maxSize?: number
  minResolution?: { width: number; height: number }
  width?: string
}

const CoverImageInput: React.FC<Props> = ({
  maxSize = 10000000,
  minResolution = { width: 170, height: 170 },
  width = '240px',
}) => {
  const intl = useIntl()
  const { control } = useFormContext()

  return (
    <FormControl
      name="cover"
      control={control}
      width={width}
      flex="none"
      spacing={0}
      sx={{
        '& *': { minWidth: 'unset !important', maxWidth: '100%' },
        '.cap-uploader > div': { height: '190px' },
      }}
    >
      <FormLabel label={intl.formatMessage({ id: 'cover-image' })}>
        <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
          {intl.formatMessage({ id: 'global.optional' })}
        </Text>
      </FormLabel>
      <FieldInput
        type="uploader"
        name="cover"
        control={control}
        format=".jpg,.jpeg,.png"
        maxSize={maxSize}
        minResolution={minResolution}
        size={UPLOADER_SIZE.LG}
        uploadURI={UPLOAD_PATH}
        showThumbnail
      />
    </FormControl>
  )
}

export default CoverImageInput
