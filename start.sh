#!/bin/bash
# Demiray Projesi - Başlatma Scripti
# MongoDB + Next.js dev server'ı başlatır.

echo "=== MongoDB başlatılıyor... ==="
mongod --dbpath ~/mongodb_data --bind_ip 0.0.0.0 --port 27017 --fork \
  --logpath ~/mongodb_log/mongod.log 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ MongoDB başarıyla başlatıldı (0.0.0.0:27017)"
else
  echo "⚠️  MongoDB zaten çalışıyor olabilir."
fi

echo ""
echo "=== Next.js başlatılıyor... ==="
npx next dev -H 0.0.0.0 -p 3000 &
NEXT_PID=$!
sleep 3
echo "✅ Next.js başlatıldı (PID: $NEXT_PID)"
echo ""
echo "🔗 Uygulama: http://192.168.3.7:3000"
echo "📦 MongoDB:   mongodb://192.168.3.7:27017/demiray_ecommerce"
