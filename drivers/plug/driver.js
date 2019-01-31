'use strict';

const Homey = require('homey');
const PlugwiseAdamDriver = require('../../lib/PlugwiseAdamDriver');

module.exports = class PlugwiseAdamPlugDriver extends PlugwiseAdamDriver {
	
	onPairFilterAppliance({ appliance }) {
  	return appliance.type === 'zz_misc';
	}
	
}