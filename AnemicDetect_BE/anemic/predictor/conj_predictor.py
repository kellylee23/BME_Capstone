from torchvision import transforms
import timm
import torch.nn as nn
import torch
from PIL import Image

# ✅ 모델 로드 함수
def load_deit_model(model_path, device):
    model = timm.create_model("deit_small_patch16_224", pretrained=False, num_classes=1)
    model = model.to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    return model

# ✅ 이미지 추론 함수
def predict_conjunctiva_image(image_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_path = r'C:\capstoneBME\AnemicDetect_BE\anemic\models\best_deit_binary.pth'  # 경로 조정

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
        prediction = int(output.item() > 0.5)

    CLASS_NAMES = {0: "Non-Anemic", 1: "Anemic"}
    return {"label_index": prediction, "label_name": CLASS_NAMES[prediction]}
