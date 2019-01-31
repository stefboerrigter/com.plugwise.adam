'use strict';

const Homey = require('homey');
const PlugwiseAdamDriver = require('../../lib/PlugwiseAdamDriver');

module.exports = class PlugwiseAdamLisaDriver extends PlugwiseAdamDriver {
	
	onPairFilterAppliance({ appliance }) {
  	return appliance.type === 'zone_thermostat';
	}
	
}