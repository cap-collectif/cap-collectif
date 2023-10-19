/* eslint-env jest */
import fileSizeConvert from '~/utils/fileSizeConvert'

describe('fileSizeConvert', () => {
  it('megabytes to bytes', () => {
    const size = 10
    const converted = fileSizeConvert.mgtob(size)
    expect(converted).toBe(10485760)
  })
  it('bytes to megabytes', () => {
    const bytes = 54634500
    const converted = fileSizeConvert.btomg(bytes)
    expect(converted).toBe(52.1)
  })
  it('TypeError if no args', () => {
    expect(() => {
      fileSizeConvert.mgtob()
    }).toThrow(TypeError)
    expect(() => {
      fileSizeConvert.btomg()
    }).toThrow(TypeError)
  })
})
