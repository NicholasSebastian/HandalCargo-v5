import React, { Component } from 'react';
import Template from '../components/ListTemplate';

import { productDetails } from '../Queries.json';

class ProductDetails extends Component {
	render() {
		return (
      <Template 
        pageKey="productDetails" 
        queries={productDetails}
        formItems={[
          { label: 'Variant Code', key: 'brgcode' },
          { label: 'Description', key: 'brgdesc' }
        ]} />
		);
	}
}

export default ProductDetails;
