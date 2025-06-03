# utils/gpt_explanation.py

import openai
from PIL import Image

# OpenAI API 키 설정 (환경변수에 넣어도 됨)
openai.api_key = "your-openai-api-key"  # 보안상 환경변수 사용 권장

def get_gpt_explanation(image_path):
    try:
        with open(image_path, "rb") as img_file:
            base64_image = img_file.read()

        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "system",
                    "content": "당신은 피부과 전문의입니다. Grad-CAM 이미지를 기반으로 환자가 빈혈인지 판단된 이유를 설명해주세요."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 Grad-CAM 이미지를 보고 빈혈 예측의 근거를 설명해줘."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=300
        )
        return response["choices"][0]["message"]["content"]

    except Exception as e:
        return f"GPT 설명 생성 실패: {str(e)}"
