import React, { Component } from 'react';
import Template from '../components/ListTemplate';

import { handlers } from '../Queries.json';

class Handlers extends Component {
	render() {
		return (
      <Template 
        pageKey="handlers" 
        queries={handlers}
        formItems={[
          { label: 'Handler Code', key: 'penguruscode' },
          { label: 'Name', key: 'pengurusname' }
        ]} />
		);
	}
}

export default Handlers;
