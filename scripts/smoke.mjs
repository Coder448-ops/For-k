/**
 * Runtime smoke test for KUMUSH — A Silver Experience (uzbek UI).
 *
 * Boots the real App in jsdom (via vite-node so TSX/CSS imports work),
 * then drives the full journey: intro → Kashf etish → relic open/close →
 * gallery cards → replay → skip. Fails on uncaught errors, React
 * console errors, or missing/broken interactions.
 *
 * Run: npm run test:smoke
 */
import { JSDOM } from 'jsdom'

const problems = []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function setupDom(reducedMotion) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  })
  const { window } = dom

  // Stubs for APIs jsdom lacks (app code guards or ignores them)
  window.HTMLCanvasElement.prototype.getContext = () => null
  window.scrollTo = () => {}
  window.Element.prototype.scrollIntoView = () => {}
  window.matchMedia = (query) => ({
    matches:
      reducedMotion && query === '(prefers-reduced-motion: reduce)'
        ? true
        : !reducedMotion && query === '(pointer: fine)'
          ? true
          : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })

  const copy = [
    'window', 'document', 'HTMLElement', 'HTMLAnchorElement',
    'HTMLButtonElement', 'Element', 'Node', 'Event', 'MouseEvent', 'CustomEvent',
    'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
    'MessageChannel', 'DOMParser', 'SVGElement',
  ]
  for (const key of copy) {
    globalThis[key] = window[key]
  }
  // Node ≥21 ships a getter-only global navigator; only swap when possible.
  try {
    Object.defineProperty(globalThis, 'navigator', {
      value: window.navigator,
      configurable: true,
    })
  } catch {
    /* keep Node's navigator — the app only reads hardwareConcurrency */
  }
  globalThis.window = window
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  return { dom, window }
}

function hookConsole() {
  const errors = []
  const origError = console.error
  const origWarn = console.warn
  console.error = (...args) => {
    errors.push(args.map(String).join(' '))
    origError(...args)
  }
  console.warn = (...args) => {
    errors.push('WARN: ' + args.map(String).join(' '))
    origWarn(...args)
  }
  return {
    errors,
    restore: () => {
      console.error = origError
      console.warn = origWarn
    },
  }
}

function assert(condition, label) {
  if (condition) {
    console.log(`  ok   ${label}`)
  } else {
    console.log(`  FAIL ${label}`)
    problems.push(label)
  }
}

async function runPass(reducedMotion) {
  console.log(`\n=== Smoke pass: ${reducedMotion ? 'reduced-motion' : 'full motion'} ===`)
  const { window } = setupDom(reducedMotion)
  const hooked = hookConsole()

  const { act, createElement } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { default: App } = await import('../src/App.tsx')

  const container = window.document.getElementById('root')
  let root
  await act(async () => {
    root = createRoot(container)
    root.render(createElement(App))
  })

  const doc = window.document
  const text = () => doc.body.textContent || ''
  const q = (sel) => doc.querySelector(sel)
  const qa = (sel) => [...doc.querySelectorAll(sel)]

  // ---- 1. Kirish (Introduction) ----
  assert(!!q('.intro'), 'intro overlay is mounted')
  assert(text().includes('Hamma narsani ham'), 'intro tagline line 1 present')
  assert(text().includes('tushuntirish shart emas.'), 'intro tagline line 2 present')
  assert(!!q('.intro__discover'), 'Discover button present')
  assert(q('.intro__discover')?.textContent?.includes('Kashf etish'), 'Discover label correct (uz)')
  assert(!!q('.intro__skip'), 'Skip intro control present')
  assert(q('.intro__skip')?.textContent?.includes('O’tkazib yuborish'), 'Skip label correct (uz)')
  assert(!!q('.intro__k'), 'metallic K monogram present')
  assert(q('body').classList.contains('is-locked'), 'scroll locked during intro')
  assert(q('.experience')?.hasAttribute('inert'), 'main experience inert during intro')
  assert(!q('audio'), 'no audio element ever autoplays')

  // ---- 2. Enter via Kashf etish ----
  await act(async () => {
    q('.intro__discover').click()
    await sleep(reducedMotion ? 200 : 1200)
  })

  assert(!q('.intro'), 'intro unmounted after Discover')
  assert(!q('body').classList.contains('is-locked'), 'scroll unlocked in main')
  assert(q('.experience')?.classList.contains('experience--entered'), 'entrance state applied')
  assert(!q('.experience')?.hasAttribute('inert'), 'experience no longer inert')
  assert(q('.hero__name')?.textContent === 'Kumushga', 'hero name is exactly "Kumushga"')
  assert(text().includes('Faqat'), 'hero dedication lead-in present')
  assert(text().includes('Sen uchun yaratilgan kichik syurpriz.'), 'hero subtitle exact (uz)')
  assert(q('.hero__scroll')?.getAttribute('href') === '#object', 'scroll cue targets next section')
  assert(q('.hero__scroll')?.textContent?.includes('Pastga'), 'scroll cue label (uz)')
  assert(!!q('#object') && !!q('#gallery') && !!q('#closing'), 'all section anchors exist')
  assert(!!q('.ring'), 'silver ring rendered')
  assert(!!q('.monogram-btn') && !!q('.scroll-progress'), 'chrome controls rendered')
  // Web Audio is absent in jsdom → the sound control must hide, not fake
  assert(!q('.sound-toggle'), 'sound toggle hidden when Web Audio unsupported (no fake control)')

  // ---- 3. The relic: open and close ----
  const relic = q('.relic-trigger')
  assert(!!relic, 'relic trigger rendered')
  assert(relic?.getAttribute('aria-expanded') === 'false', 'relic starts closed')
  assert(
    q('#relic-message')?.textContent?.includes('Bu yergacha yetib kelding. ✨'),
    'hidden message exact (✨ included)',
  )
  assert(
    q('#relic-message')?.textContent?.includes(
      'Ba’zan oddiy kunni biroz qiziqarli qilish uchun kichik syurprizning o’zi yetarli.',
    ),
    'hidden sub-message exact (uz)',
  )
  await act(async () => {
    relic.click()
    await sleep(60)
  })
  assert(q('.relic-trigger')?.getAttribute('aria-expanded') === 'true', 'relic opens on click')
  assert(q('.relic-trigger')?.classList.contains('relic-trigger--open'), 'open class applied')
  if (!reducedMotion) assert(!!q('.relic__sweep'), 'light sweep rendered on opening')
  await act(async () => {
    q('.relic-trigger').click()
    await sleep(60)
  })
  assert(q('.relic-trigger')?.getAttribute('aria-expanded') === 'false', 'relic closes on second click')

  // ---- 4. Gallery ----
  const titles = qa('.gcard__title').map((el) => el.textContent)
  assert(
    JSON.stringify(titles) === JSON.stringify(['Nuqtayi nazar', 'Imkoniyat', 'Kichik mo’jiza']),
    'gallery card titles exact (uz)',
  )
  const expected = [
    'Ba’zan boshqacha nuqtayi nazar hammasini o’zgartiradi.',
    'Har doim kashf etadigan yangi narsa bor.',
    'Kichik tafsilotlar tajribani unutilmas qilishi mumkin.',
  ]
  const buttons = qa('.gcard__btn')
  assert(buttons.length === 3, 'three gallery buttons')
  for (let i = 0; i < 3; i += 1) {
    const before = buttons[i].getAttribute('aria-expanded')
    await act(async () => {
      buttons[i].click()
      await sleep(30)
    })
    const card = qa('.gcard')[i]
    const after = qa('.gcard__btn')[i].getAttribute('aria-expanded')
    assert(before === 'false' && after === 'true', `card ${i + 1} expands on activation`)
    assert(
      card.querySelector('.gcard__panel-text')?.textContent === expected[i],
      `card ${i + 1} message exact (uz)`,
    )
    assert(
      card.querySelector('.gcard__panel')?.getAttribute('aria-labelledby') &&
        card.querySelector('.gcard__panel')?.getAttribute('role') === 'region',
      `card ${i + 1} panel is a labelled region`,
    )
  }
  // toggling one card closed again
  await act(async () => {
    qa('.gcard__btn')[1].click()
    await sleep(30)
  })
  assert(qa('.gcard__btn')[1].getAttribute('aria-expanded') === 'false', 'card 2 collapses again')

  // ---- 5. Closing + real controls ----
  assert(text().includes('Ba’zi syurprizlarni izohlashdan ko’ra'), 'closing line 1 present (uz)')
  assert(text().includes('kashf etish'), 'closing emphasis present')
  assert(
    text().includes('Umid qilamanki, bu kichik tajriba yuzingga tabassum olib keldi.'),
    'closing line 2 exact (uz)',
  )
  assert(!!q('.closing__emblem-k'), 'closing K emblem present')
  const replayBtn = qa('.ghost-btn').find((b) => b.textContent.includes('qayta'))
  const topBtn = qa('.ghost-btn').find((b) => b.textContent.includes('Yuqoriga'))
  assert(!!replayBtn && !!topBtn, 'footer controls rendered (uz labels)')

  await act(async () => {
    replayBtn.click()
    await sleep(reducedMotion ? 150 : 300)
  })
  assert(!!q('.intro'), 'Replay returns to the intro')
  assert(q('body').classList.contains('is-locked'), 'scroll re-locked during replayed intro')

  // re-enter through Skip this time
  await act(async () => {
    q('.intro__skip').click()
    await sleep(reducedMotion ? 200 : 1200)
  })
  assert(!q('.intro') && !!q('.experience--entered'), 'Skip intro also enters the experience')

  // gallery state persists (cards 1 & 3 still open, 2 closed)
  assert(qa('.gcard__btn')[0].getAttribute('aria-expanded') === 'true', 'card state preserved across replay')

  await act(async () => {
    root.unmount()
  })

  // ---- 6. Console hygiene ----
  const real = hooked.errors.filter(
    (e) =>
      !e.includes('ReactDOMTestUtils.act') &&
      !e.includes('Not implemented: HTMLCanvasElement') &&
      !e.includes('WARN: Not implemented'),
  )
  assert(real.length === 0, `no console errors/warnings (found ${real.length})`)
  real.slice(0, 5).forEach((e) => console.log(`       > ${e.slice(0, 200)}`))

  hooked.restore()
}

try {
  await runPass(false)
  await runPass(true)
} catch (err) {
  problems.push(`uncaught: ${err?.stack || err}`)
  console.error(err)
}

console.log(
  problems.length === 0
    ? '\nSMOKE TEST PASSED ✔'
    : `\nSMOKE TEST FAILED — ${problems.length} problem(s):\n - ${problems.join('\n - ')}`,
)
process.exit(problems.length === 0 ? 0 : 1)
