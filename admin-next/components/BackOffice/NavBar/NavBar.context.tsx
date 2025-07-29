import * as React from 'react'
import { BreadCrumbItemType } from '../BreadCrumb/BreadCrumbItem'

export type SetSaving = (saving: boolean) => void

type NavBarContext = {
  saving: boolean
  setSaving: SetSaving
  breadCrumbItems: Array<BreadCrumbItemType>
  setBreadCrumbItems: (breadCrumbItems: Array<BreadCrumbItemType>) => void
  preview: string | null
  setPreview: (preview: string | null) => void
}

type NavBarProviderProps = {
  children: React.ReactNode
}

const NavBarContext = React.createContext<NavBarContext>({
  saving: false,
  setSaving: () => {},
  breadCrumbItems: [],
  setBreadCrumbItems: () => {},
  preview: null,
  setPreview: () => {},
})

export const useNavBarContext = (): NavBarContext => {
  const context = React.useContext(NavBarContext)
  if (!context) {
    throw new Error(`You can't use the NavBarContext outside a NavBarProvider component.`)
  }
  return context
}

export const NavBarProvider: React.FC<NavBarProviderProps> = ({ children }) => {
  const [saving, setSaving] = React.useState(false)
  const [breadCrumbItems, setBreadCrumbItems] = React.useState<Array<BreadCrumbItemType>>([])
  const [preview, setPreview] = React.useState<string | null>(null)

  const context = React.useMemo(
    () => ({
      setSaving,
      saving,
      breadCrumbItems,
      setBreadCrumbItems,
      preview,
      setPreview,
    }),
    [setSaving, saving, breadCrumbItems, setBreadCrumbItems, preview, setPreview],
  )

  return <NavBarContext.Provider value={context}>{children}</NavBarContext.Provider>
}
