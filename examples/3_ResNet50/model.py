from config import MODEL_META_DATA, DEFAULT_MODEL_PATH, MODEL_INPUT_IMG_SIZE
from utils import ModelWrapper, read_image

from PIL import Image


class Predictor():
    def __init__(self, model_path=DEFAULT_MODEL_PATH):
        self.model_wrapper = ModelWrapper(model_path)

    def predict(self, x):
        x = Image.open(x)
        label_preds = self.model_wrapper.predict(x)

        return label_preds
