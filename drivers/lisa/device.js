'use strict';

const Homey = require('homey');
const PlugwiseAdamThermostatDevice = require('../../lib/PlugwiseAdamThermostatDevice');

module.exports = class PlugwiseAdamLisaDevice extends PlugwiseAdamThermostatDevice {
	
	onPoll({ appliance }) {
  	super.onPoll({ appliance });
  	
    if( appliance.logs
     && Array.isArray(appliance.logs.point_log) ) {
       appliance.logs.point_log.forEach(log => {
         if( log.type === 'battery'
          && log.period
          && log.period.measurement ) {
           const value = parseFloat(log.period.measurement.$text) * 100;
           this.setCapabilityValue('measure_battery', value).catch(this.error);
         }
       });
    }
	}
	
}