'use strict';

const Homey = require('homey');

module.exports = class PlugwiseAdamDevice extends Homey.Device {
	
	onInit(...props) {
  	super.onInit(...props);
  	
  	const {
    	bridgeId,
    	applianceId,
  	} = this.getData();
  	
  	const {
    	password,
  	} = this.getStore();
  	
  	this.bridgeId = bridgeId;
  	this.applianceId = applianceId;
  	
  	this.setUnavailable(Homey.__('loading'));
  	Homey.app.getBridge({ bridgeId })
  	  .then(bridge => {
    	  this.bridge = bridge;
    	  return this.bridge.testPassword({ password });
  	  })
  	  .then(result => {
    	  if(!result)
    	    throw new Error('Invalid password');
    	    
        this.bridge.password = password;    	   
        this.setAvailable();
  	  })
  	  .catch(err => {
    	  this.error(err);
    	  this.setUnavailable(err);
  	  })
	}
	
}