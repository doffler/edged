import os
from argparse import ArgumentParser

from model import Predictor

def main():
    FLAGS = build_parser()
    input_image = FLAGS.input_image
    model_dir = FLAGS.model_directory

    predictor = Predictor(model_dir)
    preds = predictor.predict(input_image)
    label_preds = [p[1] for p in [x for x in preds]]
    print(label_preds)

def build_parser():
    parser = ArgumentParser()

    parser.add_argument('--model_dir',
                        dest='model_directory',
                        help='directory where model to be tested is stored',
                        metavar='MODEL_DIRECTORY',
                        required=True)
    parser.add_argument('--input_image',
                        type=str,
                        dest='input_image',
                        metavar='TEST_BATCH_SIZE',
                        required=True)
    FLAGS = parser.parse_args()
    return FLAGS

if __name__ == "__main__":
    main()
