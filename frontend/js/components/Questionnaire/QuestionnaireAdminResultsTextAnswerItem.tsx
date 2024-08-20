import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import truncateHtml from 'html-truncate'
import css from '@styled-system/css'
import Button from '~ds/Button/Button'
import Text from '~ui/Primitives/Text'
import AppBox from '~ui/Primitives/AppBox'
import colors from '~/styles/modules/colors'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'

type Props = {
  value: string
  highlightedPart?: string
}
const TRUNCATED_LENGTH = 164
const TRUNCATED_PREVIEW = 48

const alterString = (str: string, substr: string, readMore: boolean) => {
  let text = str
  const strRegExp = new RegExp(substr, 'gi')

  if (text.length <= TRUNCATED_LENGTH) {
    return str.replace(strRegExp, `<span style="font-weight:600;color:${colors.blue[900]};">${substr}</span>`)
  }

  const index = text.toLowerCase().indexOf(substr.toLowerCase())
  if (index > TRUNCATED_PREVIEW && !readMore) text = `...${text.substr(index - TRUNCATED_PREVIEW)}`
  const newIndex = text.toLowerCase().indexOf(substr.toLowerCase())

  if (newIndex + substr.length < text.length - TRUNCATED_PREVIEW && !readMore) {
    text = `${text.substr(0, newIndex + substr.length + TRUNCATED_PREVIEW)}...`
  }

  return text.replace(strRegExp, `<span style="font-weight:600;color:${colors.blue[900]};">${substr}</span>`)
}

export const QuestionnaireAdminResultsTextAnswerItem = ({ value, highlightedPart }: Props) => {
  const [readMore, setReadMore] = useState<boolean>(false)
  const text = highlightedPart ? alterString(value, highlightedPart, readMore) : value
  return (
    <AppBox
      p={4}
      css={css({
        '&:nth-child(odd)': {
          background: colors['neutral-gray'][100],
        },
      })}
    >
      <Text as="span" fontFamily="roboto">
        <WYSIWYGRender raw tagName="span" value={readMore ? text : truncateHtml(text, TRUNCATED_LENGTH)} />
        {value.length > TRUNCATED_LENGTH && (
          <>
            &nbsp;
            <Button
              display="inline-block"
              onClick={() => {
                setReadMore(!readMore)
              }}
              variant="tertiary"
              variantSize="medium"
            >
              <Text uppercase color={readMore ? 'blue.900' : 'blue.500'}>
                <FormattedMessage id={readMore ? 'read.less' : 'read.more'} />
              </Text>
            </Button>
          </>
        )}
      </Text>
    </AppBox>
  )
}
export default QuestionnaireAdminResultsTextAnswerItem
