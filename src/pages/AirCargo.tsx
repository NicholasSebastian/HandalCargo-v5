import React, { Component, createRef, FC } from 'react';
import styled from 'styled-components';
import { FormInstance, Form as AntForm, Descriptions, Input, Button } from 'antd';

import Template, { IViewProps, IFormProps } from '../components/TableTemplate';
import { airCargo } from '../Queries.json';

const View: FC<IViewProps> = (props) => {
  const { data } = props;
  const { Item } = Descriptions;

  const processedData = {
    ...data,
    tglmuat: data['tglmuat'].toString().substr(4, 11),
    tgltiba: data['tgltiba'].toString().substr(4, 11)
  };

  return (
    <Descriptions title="View" labelStyle={{ fontWeight: 500 }}>
      {Object.entries(processedData).map(([key, value]) => (
        <Item label={key} key={key}>{value}</Item>
      ))}
    </Descriptions>
  );
}

class Form extends Component<IFormProps, {}> {
  formRef: React.RefObject<FormInstance>;

  constructor(props: IFormProps) {
    super(props);
    this.formRef = createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values: any) {
    const rawValues = Object.values(values);
    if (this.props.data) {
      // Edit form on submit.
      console.log('Editing', rawValues);
    }
    else {
      // Add form on submit.
      console.log('Adding', rawValues);
    }
    this.props.closeModal();
  }

  render() {
    const { Item } = AntForm;

    console.log(this.props.data);

    return (
      <FormStyles ref={this.formRef} labelCol={{ span: 6 }}
        onFinish={this.handleSubmit} /* onFinishFailed={() => something} // TODO: scroll to top on fail */
        initialValues={this.props.data}>
        <Item label="Airway Bill No" name='no'
          rules={[{ required: true, message: `Airway Bill Number is required` }]}>
          <Input />
        </Item>
        <Item label="Item Code" name='kode'><Input /></Item>
        {/* here */}
        <Item><Button type="primary" htmlType="submit">Submit</Button></Item>
      </FormStyles>
    );
  }
}

class AirCargo extends Component {
	render() {
		return (
			<Template 
        pageKey="airCargo" 
        dataKey="no"
        queries={airCargo} 
        View={View}
        Form={Form}
        columns={[ // TODO: sorter
          {
            title: 'Arrival Date',
            dataIndex: 'tgltiba',
            key: 'tgltiba'
          },
          {
            title: 'Airway Bill Number',
            dataIndex: 'no',
            key: 'no'
          },
          {
            title: 'Item Code',
            dataIndex: 'kode',
            key: 'kode'
          },
          {
            title: 'Route Description',
            dataIndex: 'rute',
            key: 'rute'
          },
          {
            title: 'Airplane',
            dataIndex: 'pesawat',
            key: 'pesawat'
          },
          {
            title: 'Total Payload',
            dataIndex: 'totalmuatan',
            key: 'totalmuatan'
          },
          {
            title: 'Total Weight',
            dataIndex: 'totalberat[hb]',
            key: 'totalberat[hb]'
          }
        ]} />
		);
	}
}

export default AirCargo;

const FormStyles = styled(AntForm)`
  width: 500px;
  margin: 0 auto;

  > div:last-child {
    text-align: right;
  }
`;
