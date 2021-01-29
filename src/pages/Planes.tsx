import React, { Component } from 'react';
import Template from '../components/ListTemplate';

import { planes } from '../Queries.json';

class Planes extends Component {
	render() {
		return (
      <Template 
        pageKey="planes" 
        queries={planes}
        formItems={[
          { label: 'Plane Code', key: 'pesawatcode' },
          { label: 'Description', key: 'pesawatdesc' }
        ]} />
		);
	}
}

export default Planes;
