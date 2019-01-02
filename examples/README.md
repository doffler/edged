Directory containing various tests for EdgeD
============================================

In this directory, you might find various applications of EdgeD offloader platform. Here, you might also find template code and json file for requesting computation for nearby edge devices. The basic template json file is right in this directory. You may expand template.json file here into appropriate format.
```
{
  "environment": {
    "if-docker" : "false",
        "os" : "ubuntu 16.04",
        "gpu" : "no"
  },
  "run_command" : "python exec_offload.py input.json"
}
```

You should specify exact run command for running the computation script.

## Example Cases
We provide several example cases for utilizing offloading platform. We also specify desired json contents for requesting offloading.

#### Simple input data processing
```
{
  "exec_file": {
    "index" : "Qmf8QkvhnrTHe5LPh16hczDYbTDXkaDojCFqK3BWr8YozU",
    "file_name" : "exec_offload.py"
  },
  "input_data" : {
    "index" : "QmZAADs9z2FnrziMRwsuBrcHJCH4XpCcoVv82zm6ermjsB",
    "file_name" : "input.json"
  },
  "environment": {
    "if-docker" : "false",
        "os" : "ubuntu 16.04",
        "gpu" : "no"
  },
  "run_command" : "python exec_offload.py input.json"
}

```

#### MNIST offloading

Simple mnist model running through edge devices. Users send mnist digit data and get prediction on digit image from the edge devices. Model is constructed with CNN models given in https://github.com/hwalsuklee/tensorflow-mnist-cnn.

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

#### ResNet object recognition offloading
```
{
  "environment": {
    "if-docker": "false",
    "os": "ubuntu 16.04",
    "gpu": "no"
  },
  "run_command": "python resnet_test.py --input_image ./burger.jpg --model_dir ./resnet50.h5",
  "exec_file": {
    "file_name": [
      "model.py",
      "utils.py",
      "config.py",
      "resnet_test.py"
    ],
    "index": [
      "QmW9Hn113cDYeNtbFTbT9iYmXJSskGPgxWzGwESFdiPJPo",
      "QmUVS5j85dX7vicn8hEXVeGqNb8ZGcmnDjKYASv7DGHyti",
      "QmSPJVWW49PzKrf6NJDh8c5AfivbhDrUz7Dj4gESs9cW7m",
      "QmYZebhY7BbyFQjZmDR6j3tCdQd2WBdjKdvQKcvhBpHpbm"
    ]
  },
  "parameters": {
    "file_name": [
      "resnet50.h5"
    ],
    "index": [
      "QmQb9avGNyahhXuNgjSRoX7vY7WUrBnj88CNiphKDKVJAQ"
    ]
  },
  "input_data": {
    "file_name": "dog.jpg",
    "index": "QmXQ66Ae5iuEgPQNDmwhfXz7RxDap5iLKeg9oJhZ4J9Jqk"
  }
}
```
