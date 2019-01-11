Edged : Edge Computing Offloading Platform
==========================================

As a project for Doffler, Decentralized Offloading Platform, EdgeD represents a module for constructing offloading system for edge devices. Unlike, Doffler main system, communications EdgeD is based on socket.io channel. Implementations given in EdgeD will be advanced further by introducing blockchain system to verify and record every offloading requests.

## Description
EdgeD contains a code for processing computation offload requests and sending offload requests. EdgeD utilizes IPFS data system, a peer-to-peer based distributed file system, as a main channel for data transmission. In IPFS file systems, node requests desired file by a index, a hash value of a file, from neighbor nodes. The main advantage of EdgeD over other edge computing solutions is that it enables the edge devices to get relevant data directly from nearby devices. From this, edges devices and requesters can save up transmission time required to download and upload files with each other. Also another benefit of using p2p system is that offloading requester can get the desired result from fastest available edge devices, whereas in other systems, the performance of the offloading request is strictly effected by the status of the network and offloading center. This feature can be related to availability issue of the offloader.

#### Workflow
Workflow of the EdgeD offloading system works as follows.

1. Requester constructs json file which contains necessary information for offloader to execute offloading.
2. Requester submits a json file to socket io server to ask for offloading computation.
3. Socket IO server broadcasts offloading request to connected offloaders, a edge devices.
4. Offloader constructs execution environment for the offloading request and execute computation.
5. Offloader returns offloading result back to the requester.


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
git clone https://github.com/doffler/edged.git
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
Our protocol uses socket.io as a main communication channel between offloaders and requesters. We set default socket io server with a machine located at 'http://lynx.snu.ac.kr:8000'. If you want to construct your own offloading channel, change this address on the first line of index.js file.

Following command will allow you to run your own socket io server.
```
node index.js
```

## Usage
### Requester Side
Requester are obliged to construct json file in an appropriate form to request offloading.

Json Files should be in following form.
```
{
  "environment": {
    "if-docker": "false",
    "os": "ubuntu 16.04",
    "gpu": "no"
  },
  "run_command": "python mnist_cnn_test.py --model-dir ./model --input_image ./3.jpg",
  "exec_file": {
    "file_name": [
      "mnist_cnn_test.py",
      "cnn_model.py"
    ],
    "index": [
      "QmTZSFiSqR9YMhSryy7ug51ciqdYm8BD1m77qnZ4GvWvv4",
      "QmYbFFLAVZUyV4D7q1dgwzUR43SSgWqFDccGgk6LCetUwH"
    ]
  },
  "parameters": {
    "file_name": [
      "model"
    ],
    "index": [
      "Qmey4cdfuwVe7PAZixewVf8Zsu9VUzgAWddUKKKKor4nHX"
    ],
    "isdir": true
  },
  "input_data": {
    "file_name": "3.jpg",
    "index": "QmZzn9BvHuF8Kr3iCEg8A823zLqCCRGPrmnYHR8M8zGBgb"
  }
}
```

* `exec_file` contains a necessary code files to run the offloading computation
* `parameters` are optional field which contains model parameters and model metadata for the network
* `input_data` contains input file(image, sound recordings) to test

We find that it is bordersome for user to configure such json file every time.
To automate the process of generating the json file, we provide python script which generates json file.

Following command will generate json file above.

```
python src/upload_file.py --input_file ./examples/2_simple-mnist/data/test_demo/3.jpg \
              --exec_file ./examples/2_simple-mnist/mnist_cnn_test.py ./examples/2_simple-mnist/cnn_model.py \
              --parameter_file ./examples/2_simple-mnist/model \
              --output ./examples/2_simple-mnist/request.json \
              --base_json ./examples/2_simple-mnist/sample.json
```

After that you will find corresponding json file in `./examples/simple-mnist/request.json` and you have to add this file before sending request to offloaders.

```
ipfs add ./examples/simple-mnist/request.json
```

Above command will add json file to IPFS system and you will get a index(address) for the json file. If such address is `QmQ6o2WZ2YRmkAmSa8khuSPkpiSV25zGDB1MVxu7r8Nda2`, you can broadcast offloading request with below command.

```
node ./requester.js QmQ6o2WZ2YRmkAmSa8khuSPkpiSV25zGDB1MVxu7r8Nda2
```

### Offloader Side
Just turning on offloading daemon will suffice.
```
node ./offloader.js
```

## Links
* [IPFS](https://ipfs.io/)
* [NodeJS](https://nodejs.org/en/)
