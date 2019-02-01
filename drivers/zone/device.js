'use strict';

const Homey = require('homey');
const PlugwiseAdamDevice = require('../../lib/PlugwiseAdamDevice');

module.exports = class PlugwiseAdamZoneDevice extends PlugwiseAdamDevice {
  
  onInit(...props) {
    super.onInit(...props);
    
    this.registerCapabilityListener('location_preset', this.onCapabilityLocationPreset.bind(this));
  }
  
  onPoll({ location }) {    
    this.setCapabilityValue('location_preset', location.preset || null).catch(this.error);
    
    if( location.actuator_functionalities
     && location.actuator_functionalities.thermostat_functionality ) {
      const { setpoint } = location.actuator_functionalities.thermostat_functionality;
      const value = parseFloat(setpoint);
      this.setCapabilityValue('target_temperature', value).catch(this.error);
    }
    
    if( location.logs
     && Array.isArray(location.logs.point_log) ) {
       location.logs.point_log.forEach(log => {
         if( log.type === 'temperature'
          && log.unit === 'C'
          && log.period
          && log.period.measurement ) {
           const value = parseFloat(log.period.measurement.$text);
           this.setCapabilityValue('measure_temperature', value).catch(this.error);
         }
       });
    }
    
    if( location.logs
     && Array.isArray(location.logs.point_log) ) {
       location.logs.point_log.forEach(log => {
         if( log.type === 'electricity_consumed'
          && log.unit === 'W'
          && log.period
          && log.period.measurement ) {
           const value = parseFloat(log.period.measurement.$text);
           this.setCapabilityValue('measure_power', value).catch(this.error);
         }
       });
    }
  }
  
  async onCapabilityLocationPreset( value ) {
    console.log('onCapabilityLocationPreset', value);
    const { locationId } = this;
    const preset = value;
    return this.bridge.setPreset({ locationId, preset });
  }
	
}