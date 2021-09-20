import React from 'react'
import Link from 'next/link'
import { useSSR } from '@react-libraries/use-ssr'

interface Center {
  name: string
  enName: string
  officeName?: string
  children?: string[]
  parent?: string
  kana?: string
}
interface Centers {
  [key: string]: Center
}
interface Area {
  centers: Centers
  offices: Centers
  class10s: Centers
  class15s: Centers
  class20s: Centers
}

const Page = () => {
  const [state, setState] = useSSR<Area | null>('area', async (state, setState) => {
    if (state !== undefined) return
    setState(null)
    const result = await fetch(`https://www.jma.go.jp/bosai/common/const/area.json`)
      .then((r) => r.json())
      .catch(() => null)
    setState(result)
  })
  return (
    <div>
      <button onClick={() => setState(undefined)}>Reload</button>
      {state &&
        Object.entries(state.offices).map(([code, { name }]) => (
          <div key={code}>
            <Link href={`/weather/${code}`}>
              <a>{name}</a>
            </Link>
          </div>
        ))}
    </div>
  )
}
export default Page
