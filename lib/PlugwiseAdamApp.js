'use strict';

const Homey = require('homey');
const PlugwiseAdamDiscovery = require('./PlugwiseAdamDiscovery');

const DISCOVER_INTERVAL = 1000 * 60 * 1; // 1 min

module.exports = class PlugwiseAdamApp extends Homey.App {
	
	onInit() {
  	this.discovery = new PlugwiseAdamDiscovery();
  	this.discovery.on('bridge', bridge => {
    	this.log('Found Adam:', bridge.id);
  	});
  	
  	this.discover = this.discover.bind(this);
  	this.discover();
  	this.discoverInterval = setInterval(this.discover, DISCOVER_INTERVAL);
	}
	
	discover() {
  	this.discovery.discover({
    	timeout: 5000,
  	}).catch(this.error);  	
	}
	
	getBridges() {
  	return this.discovery.bridges;
	}
	
  async getBridge({ bridgeId }) {
    if( this.discovery.bridges[bridgeId] )
      return this.discovery.bridges[bridgeId];
      
    return new Promise(resolve => {
      this.discovery.once(`bridge:${bridgeId}`, resolve);
    });
  }
	
}