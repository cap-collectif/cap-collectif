import { evalCustomCode } from './custom-code'

describe('evalCustomCode', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    delete window.__customCodeRan
    jest.clearAllTimers()
  })

  it('injects style tags and executes raw JavaScript', () => {
    evalCustomCode('<style>.custom-code-test { color: red; }</style>')
    evalCustomCode('window.__customCodeRan = true')

    expect(document.head.querySelector('style')?.textContent).toContain('.custom-code-test')
    expect(window.__customCodeRan).toBe(true)
  })

  it('retries inline scripts after the DOM is ready', () => {
    evalCustomCode(`
      <script>
        const element = document.querySelector('.custom-code-target');
        element.style.color = 'red';
      </script>
    `)

    document.body.innerHTML = '<h1 class="custom-code-target">Title</h1>'
    jest.runOnlyPendingTimers()

    expect(document.querySelector<HTMLElement>('.custom-code-target')?.style.color).toBe('red')
  })
})
