import type { IntlShape } from 'react-intl'
import moment from 'moment'

type Value = {
  readonly key: string
  readonly totalCount: number
}

type ValueFormatted = {
  date: string
  value: number
}

const formatValues = (values: ReadonlyArray<Value>, intl: IntlShape): ValueFormatted[] => {
    const groupedValues: Record<string, ValueFormatted> = values.reduce((acc, value) => {
        const date = moment(value.key).toDate()
        const formattedDate = intl.formatDate(date, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })

        if (!acc[formattedDate]) {
            acc[formattedDate] = { date: formattedDate, value: 0 }
        }

        acc[formattedDate].value += value.totalCount

        return acc
    }, {})

    return Object.values(groupedValues)
}

export default formatValues
