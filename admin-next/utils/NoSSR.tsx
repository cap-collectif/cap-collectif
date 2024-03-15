import dynamic from 'next/dynamic'
import React from 'react'

const NoSsr = ({ children }) => <>{children}</>

export default dynamic(() => Promise.resolve(NoSsr), { ssr: false })
