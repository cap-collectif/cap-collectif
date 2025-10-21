import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

describe('Upload api check', () => {
  it('can send request with image attached to it', async () => {
    const form = new FormData()
    const file = new Blob([fs.readFileSync(path.join(__dirname, './files/', 'image.jpg'))], { type: 'image/jpeg' })

    form.append('file', file, 'image.jpg')

    const response = await fetch('https://capco.test/api/files', {
      method: 'POST',
      body: form,
    })

    expect(response.status).toBe(200)
  })

  it('can send request with pdf attached to it', async () => {
    const form = new FormData()
    const file = new Blob([fs.readFileSync(path.join(__dirname, './files/', 'document.pdf'))], {
      type: 'application/pdf',
    })

    form.append('file', file, 'document.pdf')

    const response = await fetch('https://capco.test/api/files', {
      method: 'POST',
      body: form,
    })

    expect(response.status).toBe(200)
  })

  it('can send request with csv comma file attached to it', async () => {
    const form = new FormData()
    const file = new Blob([fs.readFileSync(path.join(__dirname, './files/', 'CSV_COMMA.csv'))], {
      type: 'application/csv',
    })

    form.append('file', file, 'CSV_COMMA.csv')

    const response = await fetch('https://capco.test/api/files', {
      method: 'POST',
      body: form,
    })

    expect(response.status).toBe(200)
  })

  it('can send request without attached file', async () => {
    const form = new FormData()

    const response = await fetch('https://capco.test/api/files', {
      method: 'POST',
    })

    const data = await response.json()

    expect(data).toEqual({
      errorCode: 'NO_MEDIA_FOUND',
    })
  })
})
