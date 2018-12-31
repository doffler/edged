# MNIST classifier for doffler

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import numpy
import os
import cv2
import tensorflow as tf
import tensorflow.contrib.slim as slim

import cnn_model

# user input
from argparse import ArgumentParser

# refernce argument values
MODEL_DIRECTORY = "model"

# build parser
def build_parser():
    parser = ArgumentParser()

    parser.add_argument('--model-dir',
                        dest='model_directory',
                        help='directory where model to be tested is stored',
                        metavar='MODEL_DIRECTORY',
                        required=True)
    parser.add_argument('--input_image',
                        type=str,
                        dest='input_image',
                        metavar='TEST_BATCH_SIZE',
                        required=True)
    return parser

# test with test data given by mnist_data.py
def test(model_directory, input_image):
    # Import data
    test_img = cv2.imread(input_image, 0)
    if test_img.shape != [28, 28]:
        test_img = cv2.resize(test_img, (28, 28))
        test_img = test_img.reshape(28, 28, -1)
    else :
        test_img = test_img.reshape(28, 28, -1)
    test_img = test_img.reshape(-1, 784)
    is_training = tf.placeholder(tf.bool, name='MODE')

    # tf Graph input
    x = tf.placeholder(tf.float32, [None, 784])
    y = cnn_model.CNN(x, is_training=is_training)

    # Add ops to save and restore all the variables
    sess = tf.InteractiveSession()
    sess.run(tf.global_variables_initializer(), feed_dict={is_training: True})

    # Restore variables from disk
    saver = tf.train.Saver()
    saver.restore(sess, model_directory)

    acc_buffer = []

    y_final = sess.run(y, feed_dict={x: test_img, is_training: False})
    print("prediction value : {}".format(y_final[0].argmax()))
    print(y_final)

if __name__ == '__main__':
    # Parse argument
    parser = build_parser()
    options = parser.parse_args()
    model_directory = options.model_directory
    input_image = options.input_image

    test(model_directory+'/model.ckpt', input_image)
