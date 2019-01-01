# Convolutional Neural-Network for MNIST

Model from https://github.com/hwalsuklee/tensorflow-mnist-cnn

An implementation of convolutional neural-network (CNN) for MNIST with various techniques such as data augmentation, dropout, batchnormalization, etc.

## Network architecture

CNN with 4 layers has following architecture.

+ input layer : 784 nodes (MNIST images size)
+ first convolution layer : 5x5x32
+ first max-pooling layer
+ second convolution layer : 5x5x64
+ second max-pooling layer
+ third fully-connected layer : 1024 nodes
+ output layer : 10 nodes (number of class for MNIST)

## Tools for improving CNN performance

The following techniques are employed to imporve performance of CNN.

### Model Description
#### 1. Data augmentation

The number of train-data is increased to 5 times by means of</br>
+ Random rotation : each image is rotated by random degree in ranging [-15°, +15°].
+ Random shift : each image is randomly shifted by a value ranging [-2pix, +2pix] at both axises.
+ Zero-centered normalization : a pixel value is subtracted by (PIXEL_DEPTH/2) and divided by PIXEL_DEPTH.

#### 2. Parameter initializers
+ Weight initializer : xaiver initializer
+ Bias initializer : constant (zero) initializer

#### 3. Batch normalization
All convolution/fully-connected layers use batch normalization.

#### 4. Dropout
The third fully-connected layer employes dropout technique.

#### 5. Exponentially decayed learning rate
A learning rate is decayed every after one-epoch.

## Usage

### Test a single model
`python mnist_cnn_test.py --model-dir <model_directory>  --input_image <image_file>`

+ `<model_directory>` is the location where a model to be testes is saved. Please do not specify filename of "model.ckpt".
+ `<image_file>` is a input digit image to test digit recognition.

You may command like `python mnist_cnn_test.py --model-dir model/model01_99.61 --batch-size 5000 --use-ensemble False`.
