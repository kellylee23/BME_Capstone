# predictor/gradcam.py

import torch
import cv2
import numpy as np
import os
from torchvision import transforms
from torchvision.models import efficientnet_b0
from torch.nn import functional as F
from PIL import Image
from datetime import datetime

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 모델 로딩 - 이미 학습된 .pth 파일 사용
model = efficientnet_b0(num_classes=2)
model.load_state_dict(torch.load("../models/best_effb2_binary.pth", map_location=device))
model.to(device)
model.eval()

# Grad-CAM에 필요한 마지막 conv layer 이름
target_layer = model.features[-1]

# Grad-CAM 구현
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.gradient = None
        self.activation = None
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activation = output.detach()

    def save_gradient(self, module, grad_input, grad_output):
        self.gradient = grad_output[0].detach()

    def __call__(self, image_tensor):
        output = self.model(image_tensor)
        pred_class = output.argmax(dim=1).item()

        # One-hot
        self.model.zero_grad()
        class_score = output[0, pred_class]
        class_score.backward()

        # Grad-CAM 계산
        weights = self.gradient.mean(dim=[2, 3], keepdim=True)
        cam = (weights * self.activation).sum(dim=1).squeeze()
        cam = torch.relu(cam)

        cam = cam - cam.min()
        cam = cam / cam.max()
        cam = cam.cpu().numpy()
        return cam, pred_class


# 최종 Grad-CAM 수행 함수
def run_gradcam(image_path):
    img = Image.open(image_path).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    input_tensor = transform(img).unsqueeze(0).to(device)

    gradcam = GradCAM(model, target_layer)
    cam, pred_class = gradcam(input_tensor)

    # 원본 이미지
    img_cv = cv2.cvtColor(np.array(img.resize((224, 224))), cv2.COLOR_RGB2BGR)

    # CAM 시각화
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    heatmap = np.float32(heatmap) / 255
    overlayed = heatmap + np.float32(img_cv) / 255
    overlayed = overlayed / np.max(overlayed)
    overlayed = np.uint8(255 * overlayed)

    # 저장
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = os.path.join("media", "gradcam")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"gradcam_{timestamp}.jpg")
    cv2.imwrite(output_path, overlayed)

    return output_path
