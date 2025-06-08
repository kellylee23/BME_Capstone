# anemic/predictor/nail_predictor.py
import torch
import timm
import torch.nn as nn
from torchvision import transforms
from PIL import Image

def load_model_for_inference(model_path, device):
    # # timm 라이브러리에서 DeiT 모델 불러오기 (deit_small_patch16_224)
    # model = timm.create_model('deit_small_patch16_224', pretrained=False)
    # model.head = nn.Linear(model.head.in_features, 1)  # 이진 분류용 출력층
    # model = model.to(device)

    # model.load_state_dict(torch.load(model_path, map_location=device))
    # model.eval()
    # return model
    model = timm.create_model('efficientnet_b1', pretrained=False)
    
    # 출력층을 이진 분류용으로 교체
    model.classifier = nn.Linear(model.classifier.in_features, 1)
    
    model = model.to(device)
    
    # 저장된 가중치 로드
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    
    return model


def predict_nail_image(image_path):
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model_path = r'C:\capstoneBME - 복사본\AnemicDetect_BE\anemic\models\best_efficientnetb1_nail_split.pth'

        model = load_model_for_inference(model_path, device)

        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.5]*3,
                                 [0.5]*3)
        ])

        image = Image.open(image_path).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            output = torch.sigmoid(model(image))
            probability = output.item()
            prediction = (probability > 0.7373)

        CLASS_NAMES = {0: "Non-Anemic", 1: "Anemic"}

        return {
            "label_index": int(prediction),
            "label_name": CLASS_NAMES[int(prediction)],
            "probability": round(probability * 100, 3)
        }
    except Exception as e:
        print("Exception in predict_nail_image:", e)
        raise
