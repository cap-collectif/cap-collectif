import * as React from 'react'
import { Box, CapUIFontSize, CapUILineHeight, Tag, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
type Props = {
  readonly color: string | null | undefined
  readonly viewBox?: string | null | undefined
  readonly height?: string | null | undefined
  readonly width?: string | null | undefined
  readonly isArchived?: boolean | null | undefined
  readonly preserveAspectRatio?: string
}

const CategoryBackground = ({
  color,
  viewBox,
  height = 'auto',
  width,
  isArchived = false,
  preserveAspectRatio,
}: Props) => {
  const intl = useIntl()
  return (
    <Box position="relative">
      {isArchived && (
        <Box position="absolute" top={2} right={2}>
          <Tag variantColor="infoGray" mr={1}>
            <Text as="span" fontSize={CapUIFontSize.Caption} lineHeight={CapUILineHeight.S} fontWeight="700">
              {intl.formatMessage({
                id: 'global-archived',
              })}
            </Text>
          </Tag>
        </Box>
      )}
      <svg
        id="background"
        viewBox={viewBox || '0 0 260 75'}
        style={{
          height,
          width,
        }}
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden="true"
      >
        <defs>
          <filter
            x="-4.6%"
            y="-14.5%"
            width="109.2%"
            height="128.9%"
            filterUnits="objectBoundingBox"
            id="capcocategoryheader-a"
          >
            <feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1" />
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
            <feColorMatrix
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0"
              in="shadowBlurOuter1"
              result="shadowMatrixOuter1"
            />
            <feMerge>
              <feMergeNode in="shadowMatrixOuter1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path d="M4 0h252a4 4 0 014 4v77.898H0V4a4 4 0 014-4z" id="capcocategoryheader-b" />
        </defs>
        <g filter="url(#capcocategoryheader-a)" fill="none" fillRule="evenodd">
          <mask id="capcocategoryheader-c" fill="#fff">
            <use xlinkHref="#capcocategoryheader-b" />
          </mask>
          <use fill={color} xlinkHref="#capcocategoryheader-b" />
          <path
            d="M-.284 32.595c3.376.105 6.783.362 10.221.773l-17.486-.24c2.47 0 4.679-.154 6.677-.442zm261.667-60.922l.926.122v46.208l-.504-.095c-17.872-3.29-39.872 1.588-66.002 14.638l-.668.335c-3.285-1.396-6.69-2.614-10.252-3.55-24.45-6.418-99.231-15.416-121.364-26.725A129.38 129.38 0 0052.935-2.23c2.128-.77 4.398-1.517 6.823-2.237 19.54-5.8 96.714 2.305 110.34-5.09 30.293-16.439 60.722-22.696 91.285-18.77z"
            fillOpacity=".25"
            fill="#FFF"
            mask="url(#capcocategoryheader-c)"
          />
          <path
            d="M63.519 2.606c22.133 11.31 96.914 20.307 121.364 26.726 3.563.935 6.967 2.153 10.252 3.549a256.626 256.626 0 00-8.734 4.614c-13.627 7.528-88.562 6.076-108.102 11.98a239.764 239.764 0 00-9.806 3.191 86.636 86.636 0 006.15 1.744h-.102c-4.88-1.21-8.967-2.56-11.972-4.087-28.802-14.64-55.747-20.24-80.834-16.8l-.792.112-1.446 20.774h-2.404l3.85-55.598C6.888-13.53 34.413-12.265 63.52 2.606z"
            fillOpacity=".2"
            fill="#FFF"
            mask="url(#capcocategoryheader-c)"
          />
          <path
            d="M186.401 37.495c30.6-16.905 55.935-23.396 76.008-19.473v64.015h-30.794c-14.432-4.146-29.25-9.223-41.57-12.441-22.642-5.913-93.606-7.755-121.552-16.93a239.764 239.764 0 019.806-3.19c19.54-5.905 94.475-4.453 108.102-11.981z"
            fillOpacity=".15"
            fill="#FFF"
            mask="url(#capcocategoryheader-c)"
          />
          <path
            d="M-19.057 33.635c25.312-3.67 52.52 1.893 81.626 16.688 22.133 11.25 102.926 12.887 127.376 19.273 23.777 6.21 56.864 19.349 78.51 19.349H-22.908l3.851-55.31z"
            fillOpacity=".1"
            fill="#FFF"
            mask="url(#capcocategoryheader-c)"
          />
        </g>
      </svg>
    </Box>
  )
}

export default CategoryBackground
