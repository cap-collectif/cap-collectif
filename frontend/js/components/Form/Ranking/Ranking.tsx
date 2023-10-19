import { $Values } from 'utility-types'
import * as React from 'react'
import RankingList from './RankingList/RankingList'
import Help from '~/components/Ui/Form/Help/Help'
import Description from '~/components/Ui/Form/Description/Description'
import type { Field } from '../Form.type'
import { TYPE_FORM } from '~/constants/FormConstants'

export type FieldsProps = {
  id: string
  choices: Array<Field>
  values: Array<Field> | null
  helpText?: string
  description?: string
}
type Props = {
  id: string
  field: FieldsProps
  onChange: (arg0: Array<string>) => void
  disabled?: boolean
  labelClassName: string
  typeForm?: $Values<typeof TYPE_FORM>
}

const Ranking = ({ field, id, disabled = false, typeForm, onChange }: Props) => {
  const handleRankingChange = (ranking: Array<Field>) => {
    const formatRanking: Array<string> = ranking.map(({ label }) => label)
    onChange(formatRanking)
  }

  return (
    <div className="form-group" id={id} aria-labelledby={`label-${id}`}>
      {field.helpText && (
        <Help className="help-block" typeForm={typeForm}>
          {field.helpText}
        </Help>
      )}
      {field.description && <Description typeForm={typeForm}>{field.description}</Description>}

      <RankingList dataForm={field} onChange={handleRankingChange} isDisabled={disabled} id={id} />
    </div>
  )
}

export default Ranking
