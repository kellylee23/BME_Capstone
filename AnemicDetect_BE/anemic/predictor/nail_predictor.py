# anemic/predictor/nail_predictor.py

from torchvision import models, transforms
import torch.nn as nn
import torch
from PIL import Image

def load_model_for_inference(model_path, device):
    model = models.efficientnet_b2(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 1)
    model = model.to(device)

    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    return model

def predict_nail_image(image_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_path = r'C:\capstoneBME\AnemicDetect_BE\anemic\models\best_effb2_binary.pth' # 경로 조정 가능

    model = load_model_for_inference(model_path, device)

    transform = transforms.Compose([
        transforms.Resize((260, 260)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = torch.sigmoid(model(image))
        probability = output.item() 
        prediction = (output.item() > 0.5)
    CLASS_NAMES = {0: "Non-Anemic", 1: "Anemic"}

    return {"label_index": int(prediction),
        "label_name": CLASS_NAMES[int(prediction)],
        "probability": round(probability * 100, 3)}
    # return int(prediction)  # 0 또는 1
    
