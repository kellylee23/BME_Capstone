# preprocessor/nail_preprocess.py

import cv2
import numpy as np
import os
from ultralytics import YOLO
from uuid import uuid4
from datetime import datetime
from functools import lru_cache
from django.conf import settings

MODEL_PATH = "anemic/models/best.pt"

@lru_cache(maxsize=1)
def get_model():
    return YOLO(MODEL_PATH)

def crop_nails_and_save(file, save_dir=None):
    file.seek(0)
    np_arr = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    model = get_model()
    results = model.predict(source=image, conf=0.5)

    if not results[0].masks or not results[0].masks.xy:
        return []

    if save_dir is None:
        save_dir = os.path.join(settings.MEDIA_ROOT, "cropped_nails")
    os.makedirs(save_dir, exist_ok=True)

    saved_paths = []
    masks = results[0].masks.xy

    for poly in masks:
        poly_np = np.array(poly, dtype=np.int32)
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        cv2.fillPoly(mask, [poly_np], 255)

        masked = cv2.bitwise_and(image, image, mask=mask)
        x, y, w, h = cv2.boundingRect(poly_np)
        cropped = masked[y:y+h, x:x+w]

        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid4().hex[:8]}.png"
        filepath = os.path.join(save_dir, filename)
        success = cv2.imwrite(filepath, cropped)
        if success:
            saved_paths.append(filepath)

    return saved_paths
