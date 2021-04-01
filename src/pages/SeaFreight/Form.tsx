import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, Form as AntForm, Button, Input, DatePicker, Select } from 'antd';

import { IFormProps } from '../../components/TableTemplate';
import MarkingTable from '../../components/MarkingTable';

import { seaFreight, routes, planes, currencies } from '../../Queries.json';
const { insertQuery, updateQuery, 
  markingTableQuery, markingInsertQuery, markingDeleteQuery } = seaFreight;

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface IFormState {
  // here
}

class Form extends Component<IFormProps, IFormState> {
  constructor(props: IFormProps) {
    super(props);
  }

  render() {
    return (
      <FormStyles>
        {/* here */}
      </FormStyles>
    );
  }
}

export default Form;

const FormStyles = styled(AntForm)`
`;