from torchvision import transforms
import timm
import torch.nn as nn
import torch
from PIL import Image

def load_deit_model(model_path, device):
    # print(f"📦 모델 로딩 중: {model_path}")
    # model = timm.create_model("deit_small_patch16_224", pretrained=False, num_classes=1)
    # model = model.to(device)
    # model.load_state_dict(torch.load(model_path, map_location=device))
    # model.eval()
    # print("✅ 모델 로딩 완료")
    # return model
    model = timm.create_model('efficientnet_b0', pretrained=False)
    
    # 출력층을 이진 분류용으로 교체
    model.classifier = nn.Linear(model.classifier.in_features, 1)
    
    model = model.to(device)
    
    # 저장된 가중치 로드
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    
    return model

# ✅ 이미지 추론 함수
def predict_conjunctiva_image(image_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_path = r"C:\capstoneBME - 복사본\AnemicDetect_BE\anemic\models\best_efficientnetb0_augmented_eye.pth"  # 경로 조정

    model = load_deit_model(model_path, device)

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = torch.sigmoid(model(image))
        probability = output.item() 
        prediction = int(output.item() > 0.593)

    CLASS_NAMES = {0: "Non-Anemic", 1: "Anemic"}
    return {"label_index": int(prediction),
        "label_name": CLASS_NAMES[int(prediction)],
        "probability": round(probability * 100, 3)}
