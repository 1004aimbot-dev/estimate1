<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1oAq7FGQiK_0xrgw9MtpNUYR952hnZo4G

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 🤖 AI 코딩 규칙 (필독)
이 프로젝트에서 Gemini API를 사용할 때는 반드시 아래 규칙을 따르세요:
1. **API 키 호출 방식:** `process.env`를 사용하지 말고, **`import.meta.env.VITE_GEMINI_API_KEY`** 를 사용하세요.
2. **모델 이름:** `gemini-3-flash-preview`를 사용하세요.
3. **스타일:** CSS 파일을 직접 import 하지 말고 Tailwind CSS 클래스를 사용하세요.

---
## 🤖 AI 코딩 가이드라인 (System Instructions)

이 프로젝트의 코드를 작성하거나 수정할 때는 반드시 아래 규칙을 준수하세요:

1.  **API 키 호출 방식 (필수):**
    * `process.env`는 절대 사용하지 마세요.
    * 반드시 **`import.meta.env.VITE_GEMINI_API_KEY`** 를 사용해야 합니다.

2.  **Gemini 모델 버전:**
    * 오류가 나는 `gemini-3-preview` 등의 구버전 이름 대신, 안정적인 **`gemini-3-flash-preview`** 모델 이름을 사용하세요.

3.  **챗봇 기능 (`AIChatOverlay.tsx`):**
    * 챗봇 코드를 수정할 때도 위 API 키와 모델명 규칙을 동일하게 적용하세요.
---