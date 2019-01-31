'use strict';

const PlugwiseAdamDiscovery = require('../lib/PlugwiseAdamDiscovery');
const discovery = new PlugwiseAdamDiscovery();
discovery.discover({
  timeout: 500,
})
  .then(async devices => {
    const device = Object.values(devices)[0];
    if(!device) return console.log('No devices found');
    
    device.password = 'tsstmlns';
    console.log('Device:', device);
    
    await device.testPassword({ password: 'tsstmlns' })
    const appliances = await device.getAppliances();
    const appliance = appliances.find(appliance => {
      return appliance.type === 'zone_thermostat';
    });
    console.log('appliance', appliance)
    
    await device.setThermostat({
      applianceId: appliance.$attr.id,
      setpoint: 10,
    })
  })
  .then(console.log)
  .catch(console.error);