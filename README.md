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
 
### Running

1. To start NodeJS server:
 - node app.js [port number (default port is 5555)]

2. Run the web browser
 - http://localhost:5555
 
For debugging just run "gulp"  
For release run "gulp build" to compile js and css and then run "npm start" (or "./bin/context")  

### Running via Vagrant (Recommended)

Assuming you have [vagrant](http://www.vagrantup.com/) installed, you can run ReSA-LodSaFE with few simple commands:  

1. Execute `vagrant up` to init & start vagrant environment
2. Once ready, connect to vagrant box using `vagrant ssh`
3. Change to workdir with `cd /vagrant`
4. (optional) Install ReSA-LodSaFE with `npm install`
5. Run the app with `node app.js`
6. Open vagrant host via 5.5.5.5:5555 in browser and see ReSA-LodSaFE running (*see Vagrantfile)