import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Card, Descriptions } from 'antd';

const { Item } = Descriptions;

interface IProfile {
  staffid: string
  level: number
  status: boolean
  staffname: string
  gender: boolean
  address1: string
  district: string
  city: string
  phonenum: string
  placeofbirth: any
  dateofbirth: any
  groupname: string
  dateofemployment: any
  profilepic: any
  profilepictype: string
  salary: string
  othr: string
  foodallowance: string
  bonus: string
  dilligencebonus: string
}

interface ITemplateData {
  profile: IProfile,
}

interface ITemplateProps extends ITemplateData {
  showSalary?: boolean
}

class Template extends PureComponent<ITemplateProps, {}> {
  render() {
    const { profile } = this.props;

    // TODO: images here
    // Just store and retrieve images in the database as Base64. Something like https://www.youtube.com/watch?v=9Rhsb3GU2Iw
    // Use antd's "Upload" component https://ant.design/components/upload/

    const active = <span style={{ color: 'green' }}>Active</span>
    const inactive = <span style={{ color: 'red' }}>Inactive</span>

    return (
      <TemplateStyles>
        <Card title="Account Details">
          <Descriptions labelStyle={{ fontWeight: 500 }} bordered size='small' column={2}>
            <Item label="Username" span={2}>{profile.staffid}</Item>
            <Item label="Access Level">{profile.level}</Item>
            <Item label="Status">{profile.status ? active : inactive}</Item>
          </Descriptions>
        </Card>
        <Card title="Personal Information">
          <Descriptions title="Personal Details" labelStyle={{ fontWeight: 500 }} bordered size='small'>
            <Item label="Full Name" span={2}>{profile.staffname}</Item>
            <Item label="Gender">{profile.gender ? 'Male' : 'Female'}</Item>
            <Item label="Phone Number">{profile.phonenum || 'Unknown'}</Item>
            <Item label="Address" span={2}>{profile.address1 || 'Unknown'}</Item>
            <Item label="City">{profile.city || 'Unknown'}</Item>
            <Item label="District" span={2}>{profile.district || 'Unknown'}</Item>
            <Item label="Place of Birth">{profile.placeofbirth || 'Unknown'}</Item>
            <Item label="Date of Birth">{profile.dateofbirth?.toDateString() || 'Unknown'}</Item>
          </Descriptions>
          <Descriptions title="Work Details" labelStyle={{ fontWeight: 500 }} bordered size='small'>
            <Item label="Job Category">{profile.groupname}</Item>
            <Item label="Employment Date">{profile.dateofemployment?.toDateString() || 'Unknown'}</Item>
          </Descriptions>
        </Card>
        {this.props.showSalary &&
        <Card title="Salary Details">
          <Descriptions labelStyle={{ fontWeight: 500 }} bordered size='small' column={2}>
            <Item label="Salary" span={2}>{profile.salary || 'Unknown'}</Item>
            <Item label="Overtime Pay">{profile.othr || 'Unknown'}</Item>
            <Item label="Meal Allowance">{profile.foodallowance || 'Unknown'}</Item>
            <Item label="Bonus">{profile.bonus || 'Unknown'}</Item>
            <Item label="Extra Bonus">{profile.dilligencebonus || 'Unknown'}</Item>
          </Descriptions>
        </Card>
        }
      </TemplateStyles>
    );
  }
}

export { IProfile, ITemplateData };
export default Template;

const TemplateStyles = styled.div`
  > div { margin-bottom: 20px; }

  > div:nth-of-type(2) > div:last-child {
    > div:first-child { margin-bottom: 20px; }
  }
`;
