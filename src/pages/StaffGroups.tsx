import React, { Component } from 'react';
import Template from '../components/ListTemplate';

import { staffGroups } from '../Queries.json';

class StaffGroups extends Component {
	render() {
		return (
      <Template 
        pageKey="staffGroups" 
        queries={staffGroups}
        formItems={[
          { label: 'Group Code', key: 'stfgrcode' },
          { label: 'Name', key: 'groupname' }
        ]} />
		);
	}
}

export default StaffGroups;
