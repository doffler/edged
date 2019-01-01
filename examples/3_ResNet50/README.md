# IBM Code Model Asset Exchange: ResNet-50 Image Classifier

Model from https://github.com/IBM/MAX-ResNet-50
Codes uploaded here has been modified for Edge D submission

#### Previous Description given in IBM MAX-ResNet-50 repository

This repository contains code to instantiate and deploy an image classification model. This model recognizes the 1000 different classes of objects in the [ImageNet 2012 Large Scale Visual Recognition Challenge](http://www.image-net.org/challenges/LSVRC/2012/). The model consists of a deep convolutional net using the ResNet-50 architecture that was trained on the ImageNet-2012 data set. The input to the model is a 224x224 image, and the output is a list of estimated class probilities.

The model is based on the [Keras built-in model for ResNet-50](https://keras.io/applications/#resnet50). The model files are hosted on [IBM Cloud Object Storage](http://max-assets.s3-api.us-geo.objectstorage.softlayer.net/keras/resnet50.h5). The code in this repository deploys the model as a web service in a Docker container. This repository was developed as part of the [IBM Code Model Asset Exchange](https://developer.ibm.com/code/exchanges/models/).

## Model Metadata
| Domain | Application | Industry  | Framework | Training Data | Input Data Format |
| ------------- | --------  | -------- | --------- | --------- | -------------- |
| Vision | Image Classification | General | Keras | [ImageNet](http://www.image-net.org/) | Image (RGB/HWC)|

## References

* _K. He, X. Zhang, S. Ren and J. Sun_, ["Deep Residual Learning for Image Recognition"](https://arxiv.org/pdf/1512.03385), CoRR (abs/1512.03385), 2015.
* [Keras Applications](https://keras.io/applications/#resnet50)

## Licenses

| Component | License | Link  |
| ------------- | --------  | -------- |
| This repository | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | [LICENSE](LICENSE) |
| Model Weights | [MIT](https://opensource.org/licenses/MIT) | [Keras ResNet-50](https://keras.io/applications/#resnet50)|
| Model Code (3rd party) | [MIT](https://opensource.org/licenses/MIT) | [Keras LICENSE](https://github.com/keras-team/keras/blob/master/LICENSE)|
| Test assets | Various | [Asset README](assets/README.md) |

## Pre-requisites:

* `python packages`: `pip install -r requirements.txt` will download necessary components for running resnet image classification.
* The minimum recommended resources for this model is 2GB Memory and 2 CPUs.

## Usage

```
python resnet_test.py --input_image <image_file> --model_dir <path_to_model>
```

Running the image classification for test image can be done with above command.
* `image_file` : image file as an input to the model
* `path_to_model` : pre-trained model and parameters to be used in calculation


Output of the file will be given as follows.
`[<prediction1> <prediction2> <prediction3> <prediction4> <prediction5>]`

If you are willing to get prediction probabilities for above labels you may change the code in resnet_test.py.
