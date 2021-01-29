import React, { Component } from 'react';
import Template from '../components/ListTemplate';

import { currencies } from '../Queries.json';

class Currencies extends Component {
	render() {
		return (
      <Template 
        pageKey="currencies" 
        queries={currencies}
        formItems={[
          { label: 'Currency Code', key: 'currencycode' },
          { label: 'Name', key: 'currencydesc' }
        ]} />
		);
	}
}

export default Currencies;
