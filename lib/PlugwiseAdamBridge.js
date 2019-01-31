'use strict';

const { EventEmitter } = require('events');
const fetch = require('node-fetch');
const xmlParser = require('fast-xml-parser');

const POLL_INTERVAL = 5000;

module.exports = class PlugwiseAdamBridge extends EventEmitter {
  
  constructor({
    id,
    name,
    address,
    version,
    password,
  }) {
    super();
    
    this._id = id;
    this._name = name;
    this._address = address;
    this._version = version;
    this._password = password;
    
    this._poll = this._poll.bind(this);
    this._pollCounter = 0;
  }
  
  /*
   * Getters & Setters
   */
  
  get name() {
    return this._name;
  }
  
  get id() {
    return this._id;
  }
  
  get version() {
    return this._version || null;
  }
  
  set version(version) {
    this._version = version;
  }
  
  get address() {
    return this._address || null;
  }
  
  set address(address) {
    this._address = address;
  }
  
  get password() {
    return this._password || null;
  }
  
  set password(password) {
    this._password = password;
  }
  
  /*
  * Polling
  */
  
  enablePolling() {
    this._pollCounter++;
    if( this.pollInterval ) return;
    this.pollInterval = setInterval(this._poll, POLL_INTERVAL);
  }
  
  stopPolling() {
    this._pollCounter--;
    if( this._pollCounter > 0 ) return;
    if( !this.pollInterval ) return;
    clearInterval(this.pollInterval);    
  }
  
  _poll() {
    this.getAppliances()
      .then(appliances => {
        appliances.forEach(appliance => {
          this.emit(`appliance:${appliance.$attr.id}:poll`, appliance);
        });
      }).catch(console.error);
  }
  
  /*
   * Bridge methods
   */
   
  async testPassword({ password }) {
    try {
      await this._call({
        password,
        path: '/core/gateways;ping',
      });
      return true;
    } catch( err ) {
      if( err.code === 401 ) return false;
      throw err;
    }
  }
  
  async ping() {
    return this._call({
      path: '/core/gateways;ping',
    });
  }
  
  async getDomainObjects({
    classes = [ 'Gateway', 'Location', 'Module', 'Template', 'Appliance' ],
  } = {}) {
    return this._call({
      path: `/core/domain_objects;class=${classes}`,
    }).then(({ domain_objects }) => domain_objects);
  }
  
  async getGateway() {
    const { gateway } = await this.getDomainObjects({
      classes: 'Gateway',
    });
    return gateway;
  }
  
  async getModules() {
    const { module } = await this.getDomainObjects({
      classes: 'Module',
    });
    return module;
  }
  
  async getAppliances() {
    const { appliance } = await this.getDomainObjects({
      classes: 'Appliance',
    });
    return appliance;
  }
  
  async getTemplates() {
    const { template } = await this.getDomainObjects({
      classes: 'Template',
    });
    return template;
  }
  
  async getLocations() {
    const { location } = await this.getDomainObjects({
      classes: 'Location',
    });
    return location;
  }
  
  async setRelay({ applianceId, on }) {
    return this._call({
      method: 'put',
      path: `/core/appliances;id=${applianceId}/relay`,
      xml: `<relay><state>${on ? 'on' : 'off'}</state></relay>`,
    })
  }
  
  /*
   * Bridge API helper
   */
   
  async _call({
    password = this.password,
    method = 'get',
    path,
    body,
    xml,
  }) {
    if(!password)
      throw new Error('Missing Password');
    
    const opts = {
      method,
      headers: {
        Authorization: 'Basic ' + Buffer.from(`smile:${password}`).toString('base64'),
      },
    }
    
    if( body )
      opts.body = body;
      
    if( xml ) {
      opts.body = xml;
      opts.headers['Content-Type'] = 'application/xml';
    }
    
    const res = await fetch(`http://${this._address}${path}`, opts);
    if(res.status === 202 || res.status === 204) return;
    
    const bodyText = await res.text();
    const bodyXML = xmlParser.parse(bodyText, {
      textNodeName: '$text',
      attrNodeName: '$attr',
      attributeNamePrefix: '',
      ignoreAttributes: false,
    });
    
    if(!res.ok) {
      const err = new Error((bodyXML && bodyXML.error && bodyXML.error.message ) || 'Unkown Adam Error');
      err.code = res.status;
      throw err;
    }
    
    return bodyXML;
  }
  
}