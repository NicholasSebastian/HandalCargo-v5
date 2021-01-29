import React, { Component } from 'react';
import Template from '../components/ListTemplate';

import { routes } from '../Queries.json';

class Routes extends Component {
	render() {
		return (
      <Template 
        pageKey="routes" 
        queries={routes}
        formItems={[
          { label: 'Route Code', key: 'rutecode' },
          { label: 'Description', key: 'rutedesc' }
        ]} />
		);
	}
}

export default Routes;
