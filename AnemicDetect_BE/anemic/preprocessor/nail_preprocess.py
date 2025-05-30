# preprocessor/nail_preprocess.py

import cv2
import numpy as np
import os
from ultralytics import YOLO
from uuid import uuid4
from datetime import datetime

# YOLO 모델 로딩
MODEL_PATH = "anemic/models/best.pt"
model = YOLO(MODEL_PATH)

def crop_nails_and_save(file, save_dir="media/cropped_nails"):
    np_arr = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    results = model.predict(source=image, conf=0.5)

    if not results[0].masks:
        return []

    os.makedirs(save_dir, exist_ok=True)
    saved_paths = []
    masks = results[0].masks.xy

    for i, poly in enumerate(masks):
        poly_np = np.array(poly, dtype=np.int32)
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        cv2.fillPoly(mask, [poly_np], 255)

        masked = cv2.bitwise_and(image, image, mask=mask)
        x, y, w, h = cv2.boundingRect(poly_np)
        cropped = masked[y:y+h, x:x+w]

        # 고유 파일 이름 생성
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid4().hex[:8]}.png"
        filepath = os.path.join(save_dir, filename)
        success = cv2.imwrite(filepath, cropped)
        if success:
            saved_paths.append(filepath)

    return saved_paths
