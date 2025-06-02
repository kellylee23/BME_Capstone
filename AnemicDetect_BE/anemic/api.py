# anemic/api.py

from ninja import Router, File
from ninja.files import UploadedFile
from django.conf import settings
from .preprocessor.nail_preprocess import crop_nails_and_save
from .preprocessor.conj_preprocess import crop_conj_and_save
import os
from anemic.predictor.nail_predictor import predict_nail_image
from anemic.predictor.conj_predictor import predict_conjunctiva_image

# from path.to.module import predict_nail_image
# from .utils import predict_nail_image 


router = Router()
# 전처리 nail post
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
import uuid
import imghdr

@router.post("/nail-classify/")
def nail_classify(request, image: UploadedFile = File(...)):
    save_dir = os.path.join(settings.MEDIA_ROOT, "cropped_nails")
    os.makedirs(save_dir, exist_ok=True)
    ext = os.path.splitext(image.name)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg", ".bmp"]:
        ext = ".png"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(save_dir, unique_name)
    with open(save_path, "wb") as f:
        for chunk in image.chunks():
            f.write(chunk)
    if imghdr.what(save_path) is None:
        os.remove(save_path)
        return 400, {"error": "업로드된 파일이 이미지가 아닙니다."}
    result = predict_nail_image(save_path)
    relative_url = os.path.join(settings.MEDIA_URL, "cropped_nails", unique_name).replace("\\", "/")
    full_url = request.build_absolute_uri(relative_url)

    return {
        "prediction": result,
        "image_url": full_url
    }


# 전처리 conj-post
@router.post("conj-preprocess/")
def conj_preprocess(request, image: UploadedFile = File(...)):
    saved_paths = crop_conj_and_save(image)

    if not saved_paths:
        return 204, {"message": "결막이 감지되지 않았습니다."}

    image_urls = [
        request.build_absolute_uri(
        settings.MEDIA_URL + os.path.relpath(path, settings.MEDIA_ROOT)
    ) for path in saved_paths
]

    return {"cropped_images": image_urls}


#conj 분류 예측
import uuid
import imghdr

@router.post("/conj-classify/")
def conj_classify(request, image: UploadedFile = File(...)):
    save_dir = os.path.join(settings.MEDIA_ROOT, "cropped_conj")
    os.makedirs(save_dir, exist_ok=True)
    ext = os.path.splitext(image.name)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg", ".bmp"]:
        ext = ".png"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(save_dir, unique_name)
    with open(save_path, "wb") as f:
        for chunk in image.chunks():
            f.write(chunk)
    if imghdr.what(save_path) is None:
        os.remove(save_path)
        return 400, {"error": "업로드된 파일이 이미지가 아닙니다."}
    result = predict_conjunctiva_image(save_path)
    relative_url = os.path.join(settings.MEDIA_URL, "cropped_conj", unique_name).replace("\\", "/")
    full_url = request.build_absolute_uri(relative_url)

    return {
        "prediction": result,
        "image_url": full_url
    }