# anemic/api.py

from ninja import Router, File
from ninja.files import UploadedFile
from django.conf import settings
from .preprocessor.nail_preprocess import crop_nails_and_save
import os
from .predictor.nail_predictor import predict_nail_image
# from path.to.module import predict_nail_image
# from .utils import predict_nail_image 


router = Router()
# 전처리 post
@router.post("nail-preprocess/")
def nail_preprocess(request, image: UploadedFile = File(...)):
    saved_paths = crop_nails_and_save(image)

    if not saved_paths:
        return 204, {"message": "손톱이 감지되지 않았습니다."}

    image_urls = [
        request.build_absolute_uri(
            settings.MEDIA_URL + os.path.relpath(path, settings.MEDIA_ROOT)
        ) for path in saved_paths
    ]

    return {"cropped_images": image_urls}


#네일 분류 예측
@router.post("/nail-classify/")
def nail_classify(request, image: UploadedFile):
    # 안전한 저장 경로 구성
    save_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
    os.makedirs(save_dir, exist_ok=True)

    save_path = os.path.join(save_dir, image.name)

    with open(save_path, "wb") as f:
        for chunk in image.chunks():
            f.write(chunk)

    result = predict_nail_image(save_path)
    return {"prediction": result}