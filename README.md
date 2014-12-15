ReSA - LoDSaFE
====
ReSA-LoDSaFE extends ReSA to provide LOD-based disambiguation and a Spatial-Filter Extension

### Requirements

Latest Node.js + NPM  
Latest MongoDB  
Bower (get by running "npm install -g bower")

### Installing

1. Install required NodeJS modules:
 - npm install --save
 
2. Install bower dependencies (see bower.json)
 - bower update

3. Configure DBpedia Spotlight endpoint and Twitter API keys:
 - open config.sample.js and fill in the required urls and keys
 - save it as config.js
 

### Running via Vagrant (Recommended)

Assuming you have [vagrant](http://www.vagrantup.com/) installed, you can run ReSA-LodSaFE with few simple commands:  

1. Execute `vagrant up` to init & start vagrant environment
2. Once ready, connect to vagrant box using `vagrant ssh`
3. Change to workdir with `cd /vagrant`
4. (optional) Install ReSA-LodSaFE with `npm install`
5. Run the app with `node app.js`
6. Open vagrant host via 5.5.5.5:5555 in browser and see ReSA-LodSaFE running (*see Vagrantfile)

### Running (Without Vagrant)

1. To start NodeJS server:
 - node app.js [port number (default port is 5555)]

2. Run the web browser
 - http://localhost:5555
 
### ReSA Update/Upgrade Notification.
 Though ReSA-LodSaFE extends ReSA, the following updates/upgrades were made on ReSA:
 - Express upgraded from 3.x to 4.x
 - Socket.io (client/server) upgraded from 0.9.11 to ~1.2.0
 - nTwitter module (deprecated) replaced with 'twitter' module.