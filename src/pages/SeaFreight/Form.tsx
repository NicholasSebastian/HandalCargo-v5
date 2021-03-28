import React, { Component, createRef } from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { Typography, Form as AntForm, Button, Input, DatePicker, Select } from 'antd';
import moment from 'moment';

import { IFormProps } from '../../components/TableTemplate';
import MarkingTable from '../../components/MarkingTable';

import { airCargo, routes, planes, currencies } from '../../Queries.json';
const { insertQuery, updateQuery, 
  markingTableQuery, markingInsertQuery, markingDeleteQuery } = airCargo;

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface IFormState {

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