import React, { useState } from 'react'

import styled from 'styled-components'
import { FormControl, FormGroup, InputGroup, Button } from 'react-bootstrap'
import DeleteButton from '../Button/DeleteButton'
import EditButton from '../Button/EditButton'

type Props = {
  placeholder?: string
  initialValue?: string
  onChange: (arg0: string) => void
  onDelete: (arg0: string) => void
}
const CheckButton = styled(Button)`
  padding-top: 9px;
  padding-bottom: 4px;
`
const FormGroupContainer = styled(FormGroup)`
  width: 100%;
  margin: 0;
`
const InputStaticContainer = styled.div`
  display: flex;
  width: calc(100% - 45px);
  justify-content: space-between;
  align-items: center;
  font-weight: 600;

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: calc(100% - 80px);
  }

  button {
    margin-left: 5px;
    height: 34px;
    width: 34px;
    padding-left: 9px;
    padding-top: 8px;
  }
`

const InputRequirement = ({ placeholder, initialValue, onChange, onDelete }: Props) => {
  const [value, setValue] = useState(initialValue || '')
  const [isEditing, setIsEditing] = useState(!initialValue)

  const renderStatic = () => (
    <InputStaticContainer>
      <span>{value}</span>
      <div>
        <EditButton onClick={() => setIsEditing(true)} small />
        <DeleteButton onClick={() => onDelete(value)} />
      </div>
    </InputStaticContainer>
  )

  const renderFormInput = () => (
    <FormGroupContainer>
      <InputGroup>
        <FormControl type="text" placeholder={placeholder} value={value} onChange={e => setValue(e.target.value)} />
        <InputGroup.Button>
          <CheckButton
            disabled={!value?.length}
            bsStyle="primary"
            onClick={() => {
              setIsEditing(false)
              onChange(value)
            }}
          >
            <i className="cap-check-4" />
          </CheckButton>
        </InputGroup.Button>
      </InputGroup>
    </FormGroupContainer>
  )

  return isEditing ? renderFormInput() : renderStatic()
}

export default InputRequirement
