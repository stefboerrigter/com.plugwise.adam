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
    const appliance = appliances[0];
    console.log('appliance', appliance)
    
    /*
    await device.setRelay({
      applianceId: '6e7f69d894ec4599838a8b942fcf0049',
      on: true,
    })
    */
  })
  .then(console.log)
  .catch(console.error);