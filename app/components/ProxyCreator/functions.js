/* eslint-disable no-await-in-loop */
const Compute = require('@google-cloud/compute');
const DigitalOcean = require('do-wrapper').default;
const rp = require('request-promise');
const Linode = require('linode-api-node');
const AWS = require('aws-sdk');

// Google Cloud
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
    tags: ['neutrinoproxy'],
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

export const deleteAllGoogleCloudInstances = async providerAccount => {
  const compute = new Compute({
    projectId: providerAccount.googleCredentialsProjectID,
    keyFilename: providerAccount.googleCredentialsPath
  });
  const [VMs] = await compute.getVMs();
  VMs.forEach(VM => {
    VM.metadata.tags.items.includes('neutrinoproxy');
    VM.delete();
  });
};

// DigitalOcean
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
    tags: ['neutrinoproxy'],
    image: 'centos-7-x64',
    user_data: `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${user} ${pass} &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
  });
  const ip = await pollDigitalOceanInstance(response.body.droplet.id, apiKey);
  const proxyInfo = await pingIP(ip, 3128, user, pass, 'http://google.com', 50);
  return proxyInfo;
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

export const deleteAllDigitalOceanInstances = async providerAccount => {
  const compute = new DigitalOcean(providerAccount.apiKey, 10);
  return compute.tagsDeleteDroplets('neutrinoproxy');
};

// Vultr
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
      label: name,
      tag: 'neutrinoproxy'
    }
  });
  return pollVultrInstance(apiKey, instanceCreateResponse.SUBID);
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

export const deleteAllVultrInstances = async apiKey => {
  const serversObject = await rp({
    method: 'GET',
    uri: 'https://api.vultr.com/v1/server/list',
    headers: {
      'API-Key': apiKey
    },
    json: true
  });
  const servers = Object.values(serversObject);
  const deletionPromises = servers
    .filter(server => server.tag === 'neutrinoproxy')
    .map(server =>
      rp({
        method: 'POST',
        uri: 'https://api.vultr.com/v1/server/destroy',
        headers: {
          'API-Key': apiKey
        },
        body: {
          SUBID: server.SUBID
        },
        json: true
      })
    );
  return Promise.all(deletionPromises);
};

// Linode
export const loadLinodeApiRegions = async providerAccount => {
  const linode = new Linode(providerAccount.apiKey);
  const { data } = await linode.getRegions();
  const regions = data.map(region => ({
    name: region.country.toUpperCase(),
    id: region.id
  }));
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

export const createLinodeStartupScript = async (apiKey, user, pass) => {
  const linode = new Linode(apiKey);
  const stackscriptResponse = await linode.createLinodeStackscript({
    label: 'Neutrino Proxy',
    images: ['linode/centos7'],
    is_public: false,
    script: `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${user} ${pass} &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
  });
  return stackscriptResponse;
};

export const deleteLinodeStartupScript = async (apiKey, stackscriptId) => {
  const linode = new Linode(apiKey);
  return linode.removeLinodeStackscript(stackscriptId);
};

export const createLinodeInstance = async (
  apiKey,
  region,
  machine,
  user,
  pass,
  name
) => {
  const linode = new Linode(apiKey);
  const stackScript = await createLinodeStartupScript(apiKey, user, pass);
  const instance = await linode.createLinodeInstance({
    label: name,
    root_pass: 'neutrinoproxy',
    type: machine,
    region,
    stackscript_id: stackScript.id,
    image: 'linode/centos7',
    tags: ['neutrinoproxy']
  });
  const ip = instance.ipv4[0];
  const proxy = await pingIP(ip, 3128, user, pass, 'http://google.com', 50);
  deleteLinodeStartupScript(apiKey, stackScript.id);
  return proxy;
};

export const deleteAllLinodeInstances = async apiKey => {
  const linode = new Linode(apiKey);
  const { data } = await linode.listLinodeInstances();
  const removedInstances = data
    .filter(instance => instance.tags.includes('neutrinoproxy'))
    .map(instance => linode.removeLinodeInstance(instance.id));
  return Promise.all(removedInstances);
};

// AWS
export const loadAWSCloudApiRegions = async providerAccount => {
  AWS.config.update({
    accessKeyId: providerAccount.awsAccessKey,
    secretAccessKey: providerAccount.awsSecretKey,
    region: 'eu-west-2'
  });
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
  const AWSregions = await new Promise((resolve, reject) => {
    ec2.describeRegions({}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Regions);
      }
    });
  });
  const regions = AWSregions.map(region => ({
    id: region.RegionName,
    name: region.RegionName
  }));
  return regions;
};

export const loadAWSMachinesTypes = () => [
  { name: 't3.nano', id: 't3.nano', price: '$0.0073/hr' },
  { name: 't3.micro', id: 't3.micro', price: '$0.0146/hr' },
  { name: 't3.small', id: 't3.small', price: '$0.0292/hr' },
  { name: 't3.medium', id: 't3.medium', price: '$0.0584/hr' }
];

export const returnAWSRegionAMI = region => {
  switch (region) {
    case 'eu-north-1':
      return 'ami-5ee66f20';
    case 'ap-south-1':
      break;
    case 'eu-west-3':
      return 'ami-0e1ab783dc9489f34';
    case 'eu-west-2':
      return 'ami-0eab3a90fc693af19';
    case 'eu-west-1':
      return 'ami-0ff760d16d9497662';
    case 'ap-northeast-2':
      break;
    case 'ap-northeast-1':
      break;
    case 'sa-east-1':
      break;
    case 'ca-central-1':
      return 'ami-033e6106180a626d0';
    case 'ap-southeast-1':
      break;
    case 'ap-southeast-2':
      break;
    case 'eu-central-1':
      return 'ami-04cf43aca3e6f3de3';
    case 'us-east-1':
      return 'ami-02eac2c0129f6376b';
    case 'us-east-2':
      return 'ami-0f2b4fc905b0bd1f1';
    case 'us-west-1':
      return 'ami-074e2d6769f445be5';
    case 'us-west-2':
      return 'ami-01ed306a12b7d1c96';
    default:
      return 'ami-5ee66f20';
  }
};

export const createAWSSecurityGroup = async (
  awsAccessKey,
  awsSecretKey,
  region
) => {
  AWS.config.update({
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey,
    region
  });
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
  const { Vpcs } = await ec2.describeVpcs().promise();
  const mainVPCID = Vpcs[0].VpcId;
  const { GroupId } = await ec2
    .createSecurityGroup({
      Description: 'neutrino',
      GroupName: 'neutrino',
      VpcId: mainVPCID
    })
    .promise();
  await ec2
    .authorizeSecurityGroupIngress({
      GroupId,
      IpPermissions: [
        {
          FromPort: 3128,
          IpProtocol: 'tcp',
          ToPort: 3128,
          IpRanges: [
            {
              CidrIp: '0.0.0.0/0'
            }
          ]
        },
        {
          FromPort: 3128,
          IpProtocol: 'tcp',
          ToPort: 3128,
          Ipv6Ranges: [
            {
              CidrIpv6: '::/0'
            }
          ]
        }
      ]
    })
    .promise();
  return GroupId;
};

export const createAWSInstance = async (
  awsAccessKey,
  awsSecretKey,
  region,
  machine,
  user,
  pass
) => {
  AWS.config.update({
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey,
    region
  });
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
  const { SecurityGroups } = await ec2.describeSecurityGroups().promise();
  let neutrinoSecurityGroup = SecurityGroups.find(
    securityGroup => securityGroup.GroupName === 'neutrino'
  );
  if (!neutrinoSecurityGroup) {
    const groupID = await createAWSSecurityGroup(
      awsAccessKey,
      awsSecretKey,
      region
    );
    neutrinoSecurityGroup = { GroupId: groupID };
  }
  const instanceParams = {
    ImageId: returnAWSRegionAMI(region),
    InstanceType: machine,
    MinCount: 1,
    MaxCount: 1,
    SecurityGroupIds: [neutrinoSecurityGroup.GroupId],
    TagSpecifications: [
      {
        Tags: [{ Key: 'neutrinotools', Value: 'neutrinotools' }],
        ResourceType: 'instance'
      }
    ],
    UserData: btoa(
      `#!/bin/bash\nyum install squid wget httpd-tools openssl openssl-devel -y &&\ntouch /etc/squid/passwd &&\nhtpasswd -b /etc/squid/passwd ${user} ${pass} &&\nwget -O /etc/squid/squid.conf https://raw.githubusercontent.com/ThatOneAwkwardGuy/proxyScript/master/squid.conf --no-check-certificate &&\ntouch /etc/squid/blacklist.acl &&\nsystemctl restart squid.service && systemctl enable squid.service &&\niptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&\niptables-save`
    )
  };
  const instancePromise = await ec2.runInstances(instanceParams).promise();
  const ip = await new Promise((resolve, reject) => {
    ec2.waitFor(
      'instanceRunning',
      { InstanceIds: [instancePromise.Instances[0].InstanceId] },
      (err, data) => {
        if (err) reject(err);
        resolve(data.Reservations[0].Instances[0].PublicIpAddress);
      }
    );
  });
  const proxy = await pingIP(ip, 3128, user, pass, 'http://google.com', 50);
  return proxy;
};

export const deleteAllAWSInstances = async (providerAccount, region) => {
  AWS.config.update({
    accessKeyId: providerAccount.awsAccessKey,
    secretAccessKey: providerAccount.awsSecretKey,
    region
  });
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
  const { Reservations } = await ec2.describeInstances().promise();
  const { Volumes } = await ec2.describeVolumes().promise();
  const InstanceIds = Reservations.filter(instance =>
    instance.Instances[0].Tags.some(tag => tag.Key === 'neutrinotools')
  ).map(instance => instance.Instances[0].InstanceId);
  Volumes.forEach(volume => {
    ec2.deleteVolume({
      VolumeId: volume.VolumeId
    });
  });
  if (InstanceIds.length > 0) {
    return ec2
      .terminateInstances({
        InstanceIds
      })
      .promise();
  }
};

// Extra

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
