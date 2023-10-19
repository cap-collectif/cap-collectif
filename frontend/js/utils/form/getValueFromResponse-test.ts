import getValueFromResponse from '~/utils/form/getValueFromResponse'
import type { QuestionType } from '~/components/Form/Form.type'

const getResult = (type: QuestionType) => {
  switch (type) {
    case 'select':
      return {
        label: 'Je suis select',
        value: 'Je suis select',
      }

    case 'number':
      return 12345

    case 'button':
      return 'Je suis button'

    case 'checkbox':
      return {
        labels: ['Je suis checkbox'],
        other: null,
      }

    case 'radio':
      return {
        labels: ['Je suis radio'],
        other: null,
      }

    case 'ranking':
      return ['Je suis ranking']

    case 'text':
    default:
      return 'Je suis defaut'
  }
}

describe('formatQuestions', () => {
  it('should format SELECT correctly', () => {
    const response = 'Je suis select'
    const value = getValueFromResponse('select', response)
    expect(value).toEqual(getResult('select'))
  })
  it('should format NUMBER correctly', () => {
    const response = '12345'
    const value = getValueFromResponse('number', response)
    expect(value).toEqual(getResult('number'))
  })
  it('should format BUTTON correctly', () => {
    const response = '{"labels":["Je suis button"],"other":null}'
    const value = getValueFromResponse('button', response)
    expect(value).toEqual(getResult('button'))
  })
  it('should format CHECKBOX correctly', () => {
    const response = '{"labels":["Je suis checkbox"],"other":null}'
    const value = getValueFromResponse('checkbox', response)
    expect(value).toEqual(getResult('checkbox'))
  })
  it('should format RADIO correctly', () => {
    const response = '{"labels":["Je suis radio"],"other":null}'
    const value = getValueFromResponse('radio', response)
    expect(value).toEqual(getResult('radio'))
  })
  it('should format RANKING correctly', () => {
    const response = '{"labels":["Je suis ranking"],"other":null}'
    const value = getValueFromResponse('ranking', response)
    expect(value).toEqual(getResult('ranking'))
  })
  it('should format ALL OTHER TYPE correctly', () => {
    const response = 'Je suis defaut'
    const value = getValueFromResponse('text', response)
    expect(value).toEqual(getResult('text'))
  })
})
