import http from 'http'

const MAILCATCHER_URL = process.env.MAILCATCHER_URL || 'http://localhost:1080'

export interface MailcatcherMessage {
  id: number
  sender: string
  recipients: string[]
  subject: string
  source: string
  size: string
  created_at: string
}

async function mailcatcherRequest(path: string, method = 'GET'): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, MAILCATCHER_URL)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
    }

    const req = http.request(options, res => {
      let data = ''
      res.on('data', chunk => {
        data += chunk
      })
      res.on('end', () => {
        resolve(data)
      })
    })

    req.on('error', error => {
      reject(error)
    })

    req.end()
  })
}

// Export des tasks Cypress pour MailCatcher
export const mailcatcherTasks = {
  'mailcatcher:purge': async () => {
    console.log('Purging mailcatcher...')
    await mailcatcherRequest('/messages', 'DELETE')
    console.log('Successfully purged mailcatcher')
    return Promise.resolve(null)
  },
  'mailcatcher:messages': async () => {
    const response = await mailcatcherRequest('/messages')
    return JSON.parse(response) as MailcatcherMessage[]
  },
  'mailcatcher:count': async () => {
    const response = await mailcatcherRequest('/messages')
    const messages = JSON.parse(response) as MailcatcherMessage[]
    return messages.length
  },
  'mailcatcher:findByTo': async (email: string) => {
    const response = await mailcatcherRequest('/messages')
    const messages = JSON.parse(response) as MailcatcherMessage[]
    const message = messages.find(m => m.recipients.some(r => r.includes(email)))
    return message || null
  },
  'mailcatcher:getContent': async (id: number) => {
    try {
      const plain = await mailcatcherRequest(`/messages/${id}.plain`)
      if (!plain.includes('No Dice') && !plain.includes('does not exist')) {
        return plain
      }
    } catch (e) {
      // Plain text not available
    }
    try {
      const html = await mailcatcherRequest(`/messages/${id}.html`)
      if (!html.includes('No Dice') && !html.includes('does not exist')) {
        return html
      }
    } catch (e) {
      // HTML not available
    }
    return await mailcatcherRequest(`/messages/${id}.source`)
  },
}
