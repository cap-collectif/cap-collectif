// @flow
import React, { useState } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormControl, FormGroup, InputGroup, Button } from 'react-bootstrap';

type Props = {|
  placeholder?: string,
  initialValue?: string,
  onChange: string => void,
  onDelete: string => void,
|};

const CheckButton: StyledComponent<{}, {}, Button> = styled(Button)`
  padding-top: 9px;
  padding-bottom: 4px;
`;

const EditButton: StyledComponent<{}, {}, Button> = styled(Button)`
  border-color: #6c757d;
  background-color: transparent;
`;

const FormGroupContainer: StyledComponent<{}, {}, FormGroup> = styled(FormGroup)`
  width: 100%;
  margin: 0;
`;

const InputStaticContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  width: 100%;
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
`;

const InputRequirement = ({ placeholder, initialValue, onChange, onDelete }: Props) => {
  const [value, setValue] = useState(initialValue || '');
  const [isEditing, setIsEditing] = useState(!initialValue);

  const renderStatic = () => (
    <InputStaticContainer>
      <span>{value}</span>
      <div>
        <EditButton onClick={() => setIsEditing(true)}>
          <i className="cap-pencil-2" />
        </EditButton>
        <Button className="btn-outline-danger" bsStyle="danger" onClick={() => onDelete(value)}>
          <i className="cap-bin-2" />
        </Button>
      </div>
    </InputStaticContainer>
  );

  const renderFormInput = () => (
    <FormGroupContainer>
      <InputGroup>
        <FormControl
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <InputGroup.Button>
          <CheckButton
            disabled={!value?.length}
            bsStyle="primary"
            onClick={() => {
              setIsEditing(false);
              onChange(value);
            }}>
            <i className="cap-check-4" />
          </CheckButton>
        </InputGroup.Button>
      </InputGroup>
    </FormGroupContainer>
  );

  return isEditing ? renderFormInput() : renderStatic();
};

export default InputRequirement;
