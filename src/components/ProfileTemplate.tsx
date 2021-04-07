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

    const active = <span style={{ color: 'green' }}>Active</span>
    const inactive = <span style={{ color: 'red' }}>Inactive</span>

    return (
      <TemplateStyles>
        <Card title="Account Details">
          <Descriptions labelStyle={{ fontWeight: 500 }}>
            <Item label="Username">{profile.staffid}</Item>
            <Item label="Access Level">{profile.level}</Item>
            <Item label="Status">{profile.status ? active : inactive}</Item>
          </Descriptions>
        </Card>
        <Card title="Personal Information">
          <Descriptions title="Personal Details" labelStyle={{ fontWeight: 500 }}>
            <Item label="Full Name">{profile.staffname}</Item>
            <Item label="Gender">{profile.gender ? 'Male' : 'Female'}</Item>
            <Item label="Phone Number">{profile.phonenum || 'Unknown'}</Item>
            <Item label="Address">{profile.address1 || 'Unknown'}</Item>
            <Item label="District">{profile.district || 'Unknown'}</Item>
            <Item label="City">{profile.city || 'Unknown'}</Item>
            <Item label="Place of Birth">{profile.placeofbirth || 'Unknown'}</Item>
            <Item label="Date of Birth">{profile.dateofbirth?.toDateString() || 'Unknown'}</Item>
          </Descriptions>
          <Descriptions title="Work Details" labelStyle={{ fontWeight: 500 }}>
            <Item label="Job Category">{profile.groupname}</Item>
            <Item label="Employment Date">{profile.dateofemployment?.toDateString() || 'Unknown'}</Item>
          </Descriptions>
        </Card>
        {this.props.showSalary &&
        <Card title="Salary Details">
          <Descriptions labelStyle={{ fontWeight: 500 }}>
            <Item label="Salary">{profile.salary || 'Unknown'}</Item>
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

  > div:last-child > div:last-child {
    > div:first-child { margin-bottom: 20px; }
  }
`;
