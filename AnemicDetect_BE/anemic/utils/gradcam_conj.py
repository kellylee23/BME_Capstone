import torch
from torchvision import models, transforms
from torchvision.models.feature_extraction import create_feature_extractor
from PIL import Image
import numpy as np
import cv2
import os

#  장비 설정 및 모델 로딩 (결막 전용)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.efficientnet_b2(weights=None)
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 1)
model.load_state_dict(torch.load(
    r"C:\capstoneBME\AnemicDetect_BE\anemic\models\best_deit_binary.pth",
    map_location=device
))
model = model.to(device)
model.eval()

#  Feature 추출용 Layer 설정
target_layer = "features.8"
extractor = create_feature_extractor(model, return_nodes={target_layer: "feat_map"})

#  전처리
transform = transforms.Compose([
    transforms.Resize((260, 260)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

#  Grad-CAM 실행 함수 (결막 전용)
def run_gradcam_conj(image_path, save_dir="./media/gradcam_outputs_conj"):
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

    img = np.array(image_pil.resize((260, 260)))
    heatmap = cv2.resize(cam, (img.shape[1], img.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    cam_img = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)

    os.makedirs(save_dir, exist_ok=True)
    output_path = os.path.join(save_dir, os.path.basename(image_path).replace(".jpg", "_gradcam.jpg"))
    cv2.imwrite(output_path, cam_img)

    return output_path
