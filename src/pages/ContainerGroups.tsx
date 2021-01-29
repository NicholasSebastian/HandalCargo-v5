import React, { Component } from 'react';
import Template from '../components/ListTemplate';

import { containerGroup } from '../Queries.json';

class ContainerGroups extends Component {
	render() {
		return (
      <Template 
        pageKey="containerGroups" 
        queries={containerGroup}
        formItems={[
          { label: 'Container Group', key: 'containercode' },
          { label: 'Description', key: 'containerdesc' },
          { label: 'Size', key: 'size' }
        ]} />
		);
	}
}

export default ContainerGroups;
