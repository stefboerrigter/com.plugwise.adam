'use strict';

const fetch = require('node-fetch');
const xmlParser = require('fast-xml-parser');

module.exports = class PlugwiseAdamBridge {
  
  constructor({
    id,
    name,
    address,
    version,
    password,
  }) {
    this._id = id;
    this._name = name;
    this._address = address;
    this._version = version;
    this._password = password;
  }
  
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
  
  async testPassword({ password }) {
    try {
      await this.call({
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
    return this.call({
      path: '/core/gateways;ping',
    });
  }
  
  async getDomainObjects({
    classes = [ 'Gateway', 'Location', 'Module', 'Template', 'Appliance' ],
  } = {}) {
    return this.call({
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
    return this.call({
      method: 'put',
      path: `/core/appliances;id=${applianceId}/relay`,
      xml: `<relay><state>${on ? 'on' : 'off'}</state></relay>`,
    })
  }
  
  async call({
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