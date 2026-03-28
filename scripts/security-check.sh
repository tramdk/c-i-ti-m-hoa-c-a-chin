#!/bin/bash

echo "🔍 Đang kiểm tra rò rỉ bảo mật trong các thay đổi chuẩn bị commit..."

# Tìm các từ khóa nhảy cảm trong git stage
SECRETS_FOUND=$(git diff --cached | grep -Ei "api_key|secret|password|token|auth_key|private_key|chinchin_" | grep "^+")

if [ ! -z "$SECRETS_FOUND" ]; then
    echo "❌ PHÁT HIỆN CÁC DÒNG CÓ THỂ CHỨA THÔNG TIN NHẠY CẢM:"
    echo "$SECRETS_FOUND"
    echo ""
    echo "⚠️  Vui lòng kiểm tra lại các dòng trên trước khi commit. Đừng bao giờ commit API Key hoặc Mật khẩu trực tiếp!"
    exit 1
else
    echo "✅ Không phát hiện rò rỉ thông tin nhạy cảm rõ ràng. Bạn có thể tiếp tục!"
    exit 0
fi
