const Compute = require('@google-cloud/compute');

export default const createGoogleCloudInstance = async (
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
  return ip;
};
