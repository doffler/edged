Edged : Edge Computing Offloading Platform
==========================================

As a project for doffler, Decentralized Offloading Platform, EdgeD represents a module for constructing offloading system for edge devices. Unlike, doffler main system, communications EdgeD is based on socket.io channel. Implementations given in EdgeD will be advanced further by introducing blockchain system to verify and record every offloading requests.

## Installation
Installation setting given here is configured for Ubuntu 16.04 setting.

### IPFS
IPFS should be installed on your device to join Edged's offloading services.

A quick commands for installing ipfs for linux 64-bit system
```
wget https://dist.ipfs.io/go-ipfs/v0.4.17/go-ipfs_v0.4.17_linux-amd64.tar.gz
tar -xvf go-ipfs_v0.4.17_linux-amd64.tar.gz

cd go-ipfs
sudo ./install.sh
```

### Node JS
Core program of EdgeD is built with node.js.
So your device should be equipped with node js for utilizing our computation offloading platform.

You may find appropriate node js version [here](https://nodejs.org/en/download/current/).

If you are using ubuntu system, following commands will suffice.
```
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```

After installing node js, you should install relevant npm packages with following commands.
```
npm install
```
It will install packages in package.json.

## Setup
### IPFS Setup
You'll need to initialize ipfs with following commands.
```
ipfs init
```

After typing in above commands, you will get the request from ipfs in following format.
```
initializing IPFS node at /home/XXXXXXXX/.ipfs
generating 2048-bit RSA keypair...done
peer identity: QmUtqWsmBhDzkejnvX7291xdW5V3HLaYQ5cvHuUPhY6RP6
to get started, enter:

  ipfs cat /ipfs/QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv/readme
```

You need to cat above commands.

#### IPFS Private network setting
To start with the platform, start with cloning this repository.
```
git clone https://github.com/dofflerd/edged.git
```

To join private ipfs network specialized for workload offloading platform, private key for entering the private network should be configured. Copying swarm.key file in this repository to relevant ipfs configuration directory will suffice. If you have your own path for configuring ipfs network, you should put swarm.key file in that path.
```
cp ./swarm.key ~/.ipfs/swarm.key
```

#### Running IPFS for the first time
When you are running ipfs for the first time following commands will help you configure ipfs setting to our ipfs private network. In the file named save, we listed up default ipfs node address for our workload offloading platform. You may change addresses here if you want to construct your own private network.
```
# Running ipfs daemon
ipfs daemon &

# Remove default ipfs bootstrap list
ipfs bootstrap rm --all

# Set ipfs to be publicly accessible
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001

cat save | ipfs bootstrap add

export LIBP2P_FORCE_PNET=1
```

After above commands, you can check whether your device successfully joined the network by following commands.
```
ipfs swarm peers
```

Once you successfully configured your ipfs node, you can just type in following commands to start your ipfs node.
```
ipfs daemon &
```

### Socket IO
Our protocol uses socket.io as a main communication channel between offloaders and requesters. We set default socket io server with a machine located at 'http://3.17.150.19:3000'. If you want to construct your own offloading channel, change this address on the first line of index.js file.

Following command will allow you to run your own socket io server.
```
node index.js
```

## Usage
### Requester Side

### Offloader Side

## Links
* [IPFS](https://ipfs.io/)
* [NodeJS](https://nodejs.org/en/)
