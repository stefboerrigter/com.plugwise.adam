'use strict';

const Homey = require('homey');
const PlugwiseAdamLocationDevice = require('../../lib/PlugwiseAdamLocationDevice');

module.exports = class PlugwiseAdamValveDevice extends PlugwiseAdamLocationDevice {
	
	onPoll({ appliance }) {
  	super.onPoll({ appliance });
  	
    if( appliance.logs
     && Array.isArray(appliance.logs.point_log) ) {
       appliance.logs.point_log.forEach(log => {
         if( log.type === 'valve_position'
          && log.period
          && log.period.measurement ) {
           const value = parseFloat(log.period.measurement.$text) * 100;
           this.setCapabilityValue('valve_position', value).then(console.log).catch(this.error);
         }
       });
    }
	}
	
}