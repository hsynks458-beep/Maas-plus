// ==========================================
// VERSION.JS - v64.84 - SW Güncelleme Kontrolü Şık Modal
// ==========================================

window.APP_VERSION = '64.5.61';
window.APP_CACHE_NAME = 'maas-hesap-v' + window.APP_VERSION;

// Versiyonu HTML title'a yaz
document.addEventListener('DOMContentLoaded', function() {
  document.title = 'Maaş+++ v' + window.APP_VERSION;
});

// Debug için console log
console.log('%cMaaş+++ v' + window.APP_VERSION + ' yüklendi', 'color:#8b5cf6;font-weight:700;font-size:14px');
console.log('Cache:', window.APP_CACHE_NAME);

// YENİ: Service Worker güncelleme kontrolü - ŞIK MODAL
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js?v=' + window.APP_VERSION).then(function(reg) {
    // Yeni SW bulunduğunda
    reg.addEventListener('updatefound', function() {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', function() {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Yeni versiyon hazır, şık modal ile sor
          sikConfirm(
            `Yeni sürüm v${window.APP_VERSION} hazır.\n\nSayfayı yenilemek ister misin?`,
            function(onay) {
              if (onay) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            },
            'Güncelleme Mevcut'
          );
        }
      });
    });
  }).catch(function(err) {
    console.error('SW kayıt hatası:', err);
  });
  
  // SW mesaj dinleyici
  navigator.serviceWorker.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'RELOAD') {
      window.location.reload();
    }
  });
}

// Global erişim
window.checkForUpdate = function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(function(reg) {
      if (reg) reg.update();
    });
  }
};