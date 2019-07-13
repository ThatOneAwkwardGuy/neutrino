/* eslint-disable no-await-in-loop */
const Compute = require('@google-cloud/compute');
const rp = require('request-promise');

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
