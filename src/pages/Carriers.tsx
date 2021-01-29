import React, { Component } from 'react';
import Template from '../components/ListTemplate';

import { carriers } from '../Queries.json';

class Carriers extends Component {
	render() {
		return (
      <Template 
        pageKey="carriers" 
        queries={carriers}
        formItems={[
          { label: 'Carrier Code', key: 'penguruscode' },
          { label: 'Name', key: 'pengurusname' }
        ]} />
		);
	}
}

export default Carriers;
