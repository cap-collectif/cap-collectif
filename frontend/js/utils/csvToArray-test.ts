/* eslint-env jest */
import { csvToArray } from '~/utils/csvToArray'

const CSV_CONTENT_EMPTY_LINES = `
rem@chan.com

ram@chan.com

another one


`
const CSV_CONTENT_NO_EMPTY_LINES = `rem@chan.com
ram@chan.com
another one`
describe('csvToArray', () => {
  it('should convert a simple one column csv file content to an array', () => {
    const result = csvToArray(CSV_CONTENT_EMPTY_LINES)
    expect(result).toStrictEqual(['', 'rem@chan.com', '', 'ram@chan.com', '', 'anotherone', '', '', ''])
  })
  it('should remove empty lines when setting the option `removeEmptyLines`', () => {
    const result = csvToArray(CSV_CONTENT_EMPTY_LINES, {
      removeEmptyLines: true,
    })
    expect(result).toStrictEqual(['rem@chan.com', 'ram@chan.com', 'anotherone'])
  })
  it('should strip the first row based on the `stripFirstRow` option', () => {
    const result = csvToArray(CSV_CONTENT_NO_EMPTY_LINES, {
      stripFirstRow: row => row === 'rem@chan.com',
    })
    expect(result).toStrictEqual(['ram@chan.com', 'anotherone'])
  })
})
