# Edged
client daemon to request or listen to workloads

# IPFS 
IPFS should be installed on your device to join Edged's offloading services.

## Installing 
A quick commands for installing ipfs for linux 64-bit system 
```
wget https://dist.ipfs.io/go-ipfs/v0.4.17/go-ipfs_v0.4.17_linux-amd64.tar.gz
tar -xvf go-ipfs_v0.4.17_linux-amd64.tar.gz

cd go-ipfs
sudo ./install.sh
```

## Prerequisites
To start with the platform, start with cloning this repository.
```
git clone https://github.com/dofflerd/edged.git
```

To join private ipfs network specialized for workload offloading platform, private key for entering the private network should be configured. Copying swarm.key file in this repository to relevant ipfs configuration directory will suffice. If you have your own path for configuring ipfs network, you should put swarm.key file in that path. 
```
cp ./swarm.key ~/.ipfs/swarm.key
```

## Running IPFS P2P 
When you are running ipfs for the first time following commands will help you configure ipfs setting to our ipfs private network. In the file named save, we listed up default ipfs node address for our workload offloading platform. You may change addresses here if you want to construt your own private network.
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
