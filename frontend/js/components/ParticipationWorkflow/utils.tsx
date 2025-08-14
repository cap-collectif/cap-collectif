export const getSniperLink = ({ userEmail, fromEmail = 'cap-collectif.com', mailObject }: { userEmail: string, fromEmail?: string, mailObject?: string }) => {
  const getGoogleUrl = () => {
    let url = `https://mail.google.com/mail/u/${userEmail}`

    if (mailObject || fromEmail) {
      url += '/#search/'
    }

    if (mailObject) {
      url += `${mailObject}`
    }

    if (fromEmail) {
      url += ` from:${fromEmail}`
    }

    return url.replaceAll(' ', '+').toLowerCase()
  }

  const domainsUrl = {
    gmail: getGoogleUrl(),
    outlook: `https://outlook.live.com/mail/?login_hint=${userEmail}`,
    yahoo: `https://mail.yahoo.com/d/search/keyword=from%253A${fromEmail}`,
    proton: `https://mail.proton.me/u/0/all-mail#from=${fromEmail}`,
    icloud: 'https://www.icloud.com/mail/',
  }

  const domain = userEmail.split('@')?.[1]?.split('.')?.[0]?.toLowerCase() ?? null;

  return domainsUrl[domain] ?? null;
}