'use client'

import { useNavBarContext } from '@shared/navbar/NavBar.context'
import { useEffect } from 'react'

export const Home = () => {
  const { setBreadCrumbItems } = useNavBarContext()

  useEffect(() => {
    setBreadCrumbItems([])
  }, [setBreadCrumbItems])

  return <main>Homepage - not ready and not accessible</main>
}

export default Home
