/* eslint-disable no-await-in-loop */
const Compute = require('@google-cloud/compute');
const DigitalOcean = require('do-wrapper').default;
const rp = require('request-promise');
const Linode = require('linode-api-node');

export const createGoogleCloudInstance = async (
  projectID,
  credPath,
  region,
  machine,
  user,
  pass,
  name
) => {
  const compute = new Compute({
    projectId: projectID,
    keyFilename: credPath
  });
  const zone = compute.zone(region);
  const config = {
    os: 'centos-7',
    http: true,
    https: true,
    tags: ['neutrinoproxies'],
    machineType: machine,
    canIpForward: true,
    metadata: {
      items: [
        {
          key: 'startup-script',
          value: `#!/bin/bash
            yum install squid wget httpd-tools openssl openssl-devel -y &&
            touch /etc/squid/passwd &&
            htpasswd -b /etc/squid/passwd ${user} ${pass} &&
            wget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&
            touch /etc/squid/blacklist.acl &&
            systemctl restart squid.service && systemctl enable squid.service &&
            iptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&
            iptables-save`
        }
      ]
    }
  };
  const vm = zone.vm(name);
  const [, operation] = await vm.create(config);
  await operation.promise();
  const [metadata] = await vm.getMetadata();
  const ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
  const proxyInfo = await pingIP(ip, 3128, user, pass, 'http://google.com', 50);
  return proxyInfo;
};

export const loadLinodeApiRegions = async providerAccount => {
  const linode = new Linode(providerAccount.apiKey);
  const { data } = await linode.getRegions();
  const regions = data.map(region => ({
    name: region.country.toUpperCase(),
    id: region.id
  }));
  checkLinodeStartUpScriptExisits();
  return regions;
};

export const loadLinodeApiMachineTypes = async providerAccount => {
  const linode = new Linode(providerAccount.apiKey);
  const { data } = await linode.getLinodeTypes();
  const machineTypesArray = data.map(elem => ({
    name: elem.label,
    id: elem.id,
    price: `$${elem.price.hourly}/hr`
  }));
  return machineTypesArray;
};

export const loadGoogleCloudApiRegions = async providerAccount => {
  const compute = new Compute({
    projectId: providerAccount.googleCredentialsProjectID,
    keyFilename: providerAccount.googleCredentialsPath
  });
  const [regionsResponse] = await compute.getZones();
  const regions = regionsResponse.map(elem => ({
    name: elem.name,
    id: elem.id
  }));
  return regions;
};

export const loadGoogleCloudApiMachineTypes = async (
  providerAccount,
  regionID
) => {
  const compute = new Compute({
    projectId: providerAccount.googleCredentialsProjectID,
    keyFilename: providerAccount.googleCredentialsPath
  });
  const [machineTypes] = await compute.getMachineTypes({
    filter: `zone eq ${regionID}`
  });
  const machineTypesArray = machineTypes.map(elem => ({
    name: elem.name,
    id: elem.id,
    price: `N/A`
  }));
  return machineTypesArray;
};

export const loadDigitalOceanApiRegions = async providerAccount => {
  const compute = new DigitalOcean(providerAccount.apiKey, 10);
  const regions = await compute.regionsGetAll();
  const regionsArray = regions.body.regions.map(elem => ({
    name: elem.name,
    id: elem.slug
  }));
  return regionsArray;
};

export const loadDigitalOceanApiMachineTypes = async providerAccount => {
  const compute = new DigitalOcean(providerAccount.apiKey, 10);
  const sizesArray = await compute.sizesGetAll();
  const sizes = sizesArray.body.sizes.map(elem => ({
    id: elem.slug,
    name: elem.slug,
    price: `$${elem.price_hourly.toFixed(2)}/hr`
  }));
  return sizes;
};

export const loadVultrApiRegions = async () => {
  const regions = await rp({
    method: 'GET',
    uri: 'https://api.vultr.com/v1/regions/list',
    json: true
  });
  return Object.keys(regions).map(regionKey => ({
    name: regions[regionKey].name,
    id: regions[regionKey].DCID
  }));
};

export const loadVultrApiMachineTypes = async regionID => {
  const [plansIDS, plans] = await Promise.all([
    rp({
      method: 'GET',
      uri: `https://api.vultr.com/v1/regions/availability?DCID=${regionID}`,
      json: true
    }),
    rp({
      method: 'GET',
      uri: `https://api.vultr.com/v1/plans/list`,
      json: true
    })
  ]);
  return plansIDS
    .map(plansID => {
      if (plans[plansID] !== undefined) {
        return {
          name: plans[plansID].name,
          id: plans[plansID].VPSPLANID,
          price: `$${plans[plansID].price_per_month}/month`
        };
      }
      return {
        name: '',
        id: '',
        price: ''
      };
    })
    .filter(plan => plan.id !== '');
};

const pollDigitalOceanInstance = async (ID, apiKey) => {
  const compute = new DigitalOcean(apiKey, 10);
  let tryNumber = 0;
  while (tryNumber <= 50) {
    tryNumber += 1;
    const instanceResponse = await compute.dropletsGetById(ID);
    if (instanceResponse.body.droplet.status === 'active') {
      return instanceResponse.body.droplet.networks.v4[0].ip_address;
    }
    await sleep(2000);
  }
  throw new Error(
    'There was an error creating a DigitalOcean proxy, check your account to makesure the instance is deleted'
  );
};

const pollVultrInstance = async (apiKey, SUBID) => {
  let tryNumber = 0;
  while (tryNumber <= 50) {
    tryNumber += 1;
    const instanceResponse = await rp({
      method: 'GET',
      uri: `https://api.vultr.com/v1/server/list?SUBID=${SUBID}`,
      headers: {
        'API-Key': apiKey
      },
      json: true
    });
    if (instanceResponse.status === 'active') {
      return instanceResponse.main_ip;
    }
    await sleep(2000);
  }
  throw new Error(
    'There was a problem creating your Vultr proxy instance, please check your account and delete it if it exists.'
  );
};

export const createDigitalOceanInstance = async (
  apiKey,
  region,
  machine,
  user,
  pass,
  name
) => {
  const compute = new DigitalOcean(apiKey, 10);
  const response = await compute.dropletsCreate({
    name,
    region,
    size: machine,
    image: 'centos-7-x64',
    user_data: `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${user} ${pass} &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
  });
  const ip = await pollDigitalOceanInstance(response.body.droplet.id, apiKey);
  const proxyInfo = await pingIP(ip, 3128, user, pass, 'http://google.com', 50);
  return proxyInfo;
};

export const createVultrInstance = async (
  apiKey,
  region,
  machine,
  user,
  pass,
  name
) => {
  const startUpScriptResponse = await rp({
    method: 'POST',
    uri: 'https://api.vultr.com/v1/startupscript/create',
    headers: {
      'API-Key': apiKey
    },
    json: true,
    form: {
      name,
      script: `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${user} ${pass} &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
    }
  });
  const instanceCreateResponse = await rp({
    method: 'POST',
    uri: 'https://api.vultr.com/v1/server/create',
    headers: {
      'API-Key': apiKey
    },
    json: true,
    form: {
      DCID: parseInt(region, 10),
      VPSPLANID: parseInt(machine, 10),
      OSID: 167,
      SCRIPTID: startUpScriptResponse.SCRIPTID,
      hostname: name,
      label: name
    }
  });
  return pollVultrInstance(apiKey, instanceCreateResponse.SUBID);
};

export const checkLinodeStartUpScriptExisits = async apiKey => {
  const linode = new Linode(apiKey);
  const scriptsResponse = await linode.getLinodeStackscripts();
  console.log(scriptsResponse);
};

export const createLinodeInstance = async (
  apiKey,
  region,
  machine,
  user,
  pass,
  name
) => {};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const pingIP = async (ip, port, user, pass, website, maxTries) => {
  let res;
  let count = 0;
  while (count <= maxTries) {
    count += 1;
    try {
      res = await rp({
        method: 'GET',
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
        },
        uri: website,
        time: true,
        proxy:
          user !== ''
            ? `http://${user}:${pass}@${ip}:${port}`
            : `http://${ip}:${port}`,
        resolveWithFullResponse: true,
        followAllRedirects: true
      });
      return {
        user,
        pass,
        ip,
        port,
        ping: Math.round(res.timings.response)
      };
    } catch (err) {
      if (err.error.code !== 'ECONNREFUSED' && err.error.code !== 'ETIMEDOUT') {
        return {
          user,
          pass,
          ip,
          port,
          ping: -1
        };
      }
    }
    await sleep(2000);
  }
  return {
    user,
    pass,
    ip,
    port,
    ping: -1
  };
};
