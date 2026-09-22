import { render } from 'vitest-browser-react'
import { expect, test } from 'vitest'
import Navigation from '../../src/components/navigation'

test('navigation should load', async () => {
  const screen = await render(<Navigation/>)

  await expect.element(screen.getByText('Sight Reader Pro')).toBeVisible()
})