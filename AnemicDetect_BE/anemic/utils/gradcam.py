# import torch
# import cv2
# import numpy as np
# import os
# from torchvision import transforms
# from torchvision.models import efficientnet_b2
# from torch.nn import functional as F
# from PIL import Image
# from datetime import datetime
# import uuid
# from django.conf import settings

# # 디바이스 설정
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# # 모델 로딩 - 실제 모델 경로로 수정 필요
# model = efficientnet_b2(num_classes=1)
# model_path = os.path.join(r"C:\capstoneBME - 복사본\AnemicDetect_BE\anemic\models\best_effb2_binary.pth")
# model.load_state_dict(torch.load(model_path, map_location=device))
# model.to(device)
# model.eval()

# # Grad-CAM에 필요한 마지막 conv layer
# target_layer = model.features[-1]

# class GradCAM:
#     def __init__(self, model, target_layer):
#         self.model = model
#         self.gradient = None
#         self.activation = None
#         target_layer.register_forward_hook(self.save_activation)
#         target_layer.register_backward_hook(self.save_gradient)

#     def save_activation(self, module, input, output):
#         self.activation = output.detach()

#     def save_gradient(self, module, grad_input, grad_output):
#         self.gradient = grad_output[0].detach()

#     def __call__(self, image_tensor):
#         output = self.model(image_tensor)
#         pred_class = output.argmax(dim=1).item()

#         self.model.zero_grad()
#         class_score = output[0, pred_class]
#         class_score.backward()

#         weights = self.gradient.mean(dim=[2, 3], keepdim=True)
#         cam = (weights * self.activation).sum(dim=1).squeeze()
#         cam = torch.relu(cam)

#         cam = cam - cam.min()
#         cam = cam / cam.max()
#         cam = cam.cpu().numpy()
#         return cam, pred_class


# def run_gradcam(image_path):
#     img = Image.open(image_path).convert("RGB")

#     transform = transforms.Compose([
#         transforms.Resize((224, 224)),
#         transforms.ToTensor(),
#     ])
#     input_tensor = transform(img).unsqueeze(0).to(device)

#     gradcam = GradCAM(model, target_layer)
#     cam, pred_class = gradcam(input_tensor)

#     # cam 크기를 원본 이미지 크기로 맞추기
#     cam = cv2.resize(cam, (224, 224))

#     # 원본 이미지
#     img_cv = cv2.cvtColor(np.array(img.resize((224, 224))), cv2.COLOR_RGB2BGR)

#     # CAM 시각화
#     heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
#     heatmap = np.float32(heatmap) / 255
#     overlayed = heatmap + np.float32(img_cv) / 255
#     overlayed = overlayed / np.max(overlayed)
#     overlayed = np.uint8(255 * overlayed)

#     # 저장 및 경로 반환
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     output_dir = os.path.join("media", "gradcam")
#     os.makedirs(output_dir, exist_ok=True)
#     output_path = os.path.join(output_dir, f"gradcam_{timestamp}.jpg")
#     cv2.imwrite(output_path, overlayed)

#     return output_path


# anemic/utils/gradcam.py

import torch
from torchvision import models, transforms
from torchvision.models.feature_extraction import create_feature_extractor
from PIL import Image
import numpy as np
import cv2
import os

# ✅ 장비 설정 및 모델 로딩 (초기화 시 1회만 실행)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.efficientnet_b2(weights=None)
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 1)
model.load_state_dict(torch.load(r"C:\capstoneBME - 복사본\AnemicDetect_BE\anemic\models\best_effb2_binary.pth", map_location=device))
model = model.to(device)
model.eval()

target_layer = "features.8"
extractor = create_feature_extractor(model, return_nodes={target_layer: "feat_map"})

transform = transforms.Compose([
    transforms.Resize((260, 260)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ✅ Grad-CAM 함수
def run_gradcam(image_path, save_dir="./media/gradcam_outputs"):
    image_pil = Image.open(image_path).convert("RGB")
    image_tensor = transform(image_pil).unsqueeze(0).to(device)

    gradients = []

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    handle = extractor.get_submodule(target_layer).register_full_backward_hook(backward_hook)

    features = extractor(image_tensor)
    feature_map = features["feat_map"]
    output = model(image_tensor)
    pred_score = output.squeeze()
    pred_score.backward()
    handle.remove()

    grads = gradients[0].squeeze(0)
    fmap = feature_map.squeeze(0)

    weights = grads.mean(dim=[1, 2])
    cam = torch.sum(weights[:, None, None] * fmap, dim=0)
    cam = cam.cpu().detach().numpy()
    cam = np.maximum(cam, 0)
    cam = cam / cam.max() if cam.max() != 0 else np.zeros_like(cam)

    # 이미지에 overlay 후 저장
    img = np.array(image_pil.resize((260, 260)))
    heatmap = cv2.resize(cam, (img.shape[1], img.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    cam_img = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)

    os.makedirs(save_dir, exist_ok=True)
    output_path = os.path.join(save_dir, os.path.basename(image_path))
    cv2.imwrite(output_path, cam_img)

    return output_path
