import React, { FC, useState } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { changeTerm } from '../../../redux/modules/project'
import Input from '../../Form/ReactBootstrapInput'
import type { Dispatch } from '../../../types'
import { useIntl } from 'react-intl'

type Props = {
  dispatch: Dispatch
}

const ProjectListSearch: FC<Props> = ({ dispatch }) => {
  const intl = useIntl()
  const [termInputValue, setTermInputValue] = useState('')

  const handleSubmit = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const value = termInputValue.length > 0 ? termInputValue : null
    dispatch(changeTerm(value))
  }

  const handleChangeTermInput = (e: React.SyntheticEvent<HTMLInputElement>) => {
    setTermInputValue(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        id="project-search-input"
        type="text"
        placeholder="global.menu.search"
        buttonAfter={
          <Button
            id="project-search-button"
            type="submit"
            aria-label={intl.formatMessage({ id: 'global.menu.search' })}
          >
            <i className="cap cap-magnifier" aria-hidden="true" />
          </Button>
        }
        groupClassName="project-search-group pull-right w-100"
        value={termInputValue}
        onChange={handleChangeTermInput}
      />
    </form>
  )
}

export default connect()(ProjectListSearch)
