'use strict';

const Homey = require('homey');
const PlugwiseAdamDevice = require('../../lib/PlugwiseAdamDevice');

module.exports = class PlugwiseAdamPlugDevice extends PlugwiseAdamDevice {
  
  onInit(...props) {
    super.onInit(...props);
    
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
  }
  
  async onCapabilityOnoff(value) {
    return this.bridge.setRelay({
      applianceId: this.applianceId,
      on: !!value,
    });
  }
	
}