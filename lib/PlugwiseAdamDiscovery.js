'use strict';

const { EventEmitter } = require('events');
const mdns = require('mdns-js');
const PlugwiseAdamBridge = require('./PlugwiseAdamBridge');

mdns.excludeInterface('0.0.0.0');

module.exports = class PlugwiseAdamDiscovery extends EventEmitter {
  
  static get ALLOWED_PRODUCT_TYPES() {
    return [
      'smile_open_therm',
    ];
  }
  
  constructor() {
    super();
    
    this._bridges = {};
    this._browser = mdns.createBrowser(mdns.tcp('plugwise'));
    this._browser.on('update', this._onBrowserUpdate.bind(this));
    this._ready = new Promise((resolve, reject) => {
      this._browser.once('ready', resolve);
      this._browser.once('error', reject);
    });
    this._ready.catch(console.error);
  }
  
  get bridges() {
    return this._bridges;
  }
  
  async discover({ timeout = 2000 } = {}) {
    await this._ready;
    this._browser.discover();
    await new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
    this._browser.stop();
    return this._bridges;
  }
  
  _onBrowserUpdate(data) {
    const {
      addresses,
      type,
      txt,
      fullname,
      host,
    } = data;
    
    const [
      address,
    ] = addresses;
        
    const {
      product,
      version,
    } = this.constructor.parseTXT(txt);
    
    const id = host
      .replace('.local', '')
      .replace('smile', '')
      
    const name = fullname;
    
    if( !this.constructor.ALLOWED_PRODUCT_TYPES.includes(product) ) return;
    
    if( this._bridges[id] ) {
      this._bridges[id].address = address;
      this._bridges[id].version = version;
    } else {
      this._bridges[id] = new PlugwiseAdamBridge({
        id,
        name,
        address,
        version,
      });
      this.emit(`bridge`, this._bridges[id]);
      this.emit(`bridge:${id}`, this._bridges[id]);
    }
  }
  
  static parseTXT(txt) {
    return txt.reduce((result, item) => {
      const [ key, value ] = item.split('=');
      return {
        ...result,
        [key]: value,
      };
     }, {});
  }
  
}