# nail_predictor.py
import os
from PIL import Image
import torch
from torchvision import transforms, models
import torch.nn as nn
from django.conf import settings  # <-- 추가
# from .nail_utils import predict_nail_image

def predict_nail_image(image_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # 모델 생성 및 가중치 로드
    model = models.efficientnet_b3(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 4)

    # .pth 파일 절대 경로
    # model_path = os.path.join(settings.BASE_DIR, "models", "best_effb3_4class.pth")
    model_path = r"C:\capstoneBME\AnemicDetect_BE\anemic\models\best_effb3_4class.pth"
    model.load_state_dict(torch.load(model_path, map_location=device))

    model.to(device)
    model.eval()

    # 이미지 전처리
    transform = transforms.Compose([
        transforms.Resize((300, 300)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)

    # 예측
    with torch.no_grad():
        outputs = model(input_tensor)
        pred = torch.argmax(outputs, dim=1).item()

    CLASS_NAMES = {0: "Severe", 1: "Moderate", 2: "Mild", 3: "Non-Anemic"}
    return {"label_index": pred, "label_name": CLASS_NAMES[pred]}
