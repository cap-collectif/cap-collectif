import { useState, useEffect } from 'react'
import type { Question } from '~/components/Form/Form.type'

type paramsType = {
  id: string
  values: {
    question: string
    question2?: string
  }
}
export const formatParams = (titles: Array<string>, translationKey: string): paramsType | void => {
  const count = titles.length
  if (count === 0) return
  let id
  const values = {}

  if (count === 1) {
    const [q1] = titles
    id = `${translationKey}`
    values.question = q1
  } else if (count === 2) {
    const [q1, q2] = titles
    id = `${translationKey}.plural`
    values.question = q1
    values.question2 = q2
  } else {
    const titlesCopy = [...titles]
    const question2 = titlesCopy.pop()
    const question = titlesCopy.reduce((text, title) => `${text}, ${title}`)
    id = `${translationKey}.plural`
    values.question2 = question2
    values.question = question
  }

  return {
    id,
    values,
  }
}
export const useDeletePopoverMessage = (question: Question) => {
  const [jumpsText, setJumpText] = useState([])
  const [destinationJumpsText, setDestinationJumpsText] = useState([])
  const [jumpsKey, setJumpsKey] = useState('admin.question.delete.confirmation.jump.body')
  const [destinationJumpsKey, setDestinationJumpsKey] = useState('admin.jump.delete.confirmation.body')
  const [jumpsTextParams, setJumpsTextParams] = useState()
  const [destinationJumpsTextParams, setDestinationJumpsTextParams] = useState()
  useEffect(() => {
    setJumpText([...new Set(question?.jumps?.map(jump => `"${jump.destination.title}"`))])
    setDestinationJumpsText([...new Set(question?.destinationJumps?.map(jump => `"${jump.origin.title}"`))])
  }, [question, setDestinationJumpsText])
  useEffect(() => {
    if (jumpsText.length > 0 && destinationJumpsText.length > 0) {
      setJumpsKey('admin.jump.delete.confirmation.body.variant')
      setDestinationJumpsKey('admin.question.delete.confirmation.jump.body.variant')
    }

    setJumpsTextParams(formatParams(jumpsText, jumpsKey))
    setDestinationJumpsTextParams(formatParams(destinationJumpsText, destinationJumpsKey))
  }, [jumpsText, destinationJumpsText, jumpsKey, destinationJumpsKey])
  return {
    jumpsText,
    jumpsTextParams,
    destinationJumpsText,
    destinationJumpsTextParams,
  }
}
