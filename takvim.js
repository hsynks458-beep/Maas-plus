// ==========================================
// TAKVIM.JS - v64.33 - Şık Uyarı/Prompt Modal
// ==========================================

window.buguneGit = function() {
  console.log('Bugüne Git çalıştı');
  var bugun = new Date();
  window.aktifAy = bugun.getMonth();
  window.aktifYil = bugun.getFullYear();

  if (typeof takvimOlustur === 'function') {
    takvimOlustur();
  }

  setTimeout(function() {
    var bugunEl = document.querySelector('.takvim-gun.bugun');
    if (bugunEl) {
      bugunEl.classList.add('vurgulu');
      var content = document.querySelector('.content');
      if (content && bugunEl.offsetTop) {
        content.scrollTo({
          top: bugunEl.offsetTop - content.clientHeight / 2,
          behavior: 'smooth'
        });
      }
      setTimeout(() => bugunEl.classList.remove('vurgulu'), 2000);
    }
  }, 150);
};

let seciliGun = null;

// YENİ: ŞIK MODAL SİSTEMİ
window.sikModal = {
  ac: function(tip, baslik, mesaj, callback, varsayilan) {
    var modal = document.getElementById('sikModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sikModal';
      modal.className = 'sik-modal-overlay';
      document.body.appendChild(modal);
    }

    var icerik = '';
    if (tip === 'prompt') {
      icerik = `
        <div class="sik-modal-kutu">
          <div class="sik-modal-baslik">${baslik}</div>
          <div class="sik-modal-mesaj">${mesaj}</div>
          <input type="text" id="sikModalInput" class="sik-modal-input" value="${varsayilan || ''}" placeholder="Değer girin">
          <div class="sik-modal-butonlar">
            <button class="sik-modal-btn iptal" onclick="sikModal.kapat(false)">İptal</button>
            <button class="sik-modal-btn onay" onclick="sikModal.kapat(true)">Tamam</button>
          </div>
        </div>
      `;
    } else if (tip === 'confirm') {
      icerik = `
        <div class="sik-modal-kutu">
          <div class="sik-modal-baslik">${baslik}</div>
          <div class="sik-modal-mesaj">${mesaj}</div>
          <div class="sik-modal-butonlar">
            <button class="sik-modal-btn iptal" onclick="sikModal.kapat(false)">İptal</button>
            <button class="sik-modal-btn onay" onclick="sikModal.kapat(true)">Onayla</button>
          </div>
        </div>
      `;
    } else {
      icerik = `
        <div class="sik-modal-kutu">
          <div class="sik-modal-baslik">${baslik}</div>
          <div class="sik-modal-mesaj">${mesaj}</div>
          <div class="sik-modal-butonlar">
            <button class="sik-modal-btn onay" onclick="sikModal.kapat(true)">Tamam</button>
          </div>
        </div>
      `;
    }

    modal.innerHTML = icerik;
    modal.classList.add('aktif');
    window.sikModalCallback = callback;

    if (tip === 'prompt') {
      setTimeout(() => {
        var input = document.getElementById('sikModalInput');
        if (input) {
          input.focus();
          input.select();
          input.onkeypress = function(e) {
            if (e.key === 'Enter') sikModal.kapat(true);
          };
        }
      }, 100);
    }
  },

  kapat: function(sonuc) {
    var modal = document.getElementById('sikModal');
    if (!modal) return;

    if (window.sikModalCallback) {
      if (sonuc) {
        var input = document.getElementById('sikModalInput');
        window.sikModalCallback(input? input.value : true);
      } else {
        window.sikModalCallback(null);
      }
    }

    modal.classList.remove('aktif');
    window.sikModalCallback = null;
  }
};

// Kısayollar
window.sikAlert = (mesaj, baslik) => sikModal.ac('alert', baslik || 'Bilgi', mesaj, null);
window.sikConfirm = (mesaj, callback, baslik) => sikModal.ac('confirm', baslik || 'Onay', mesaj, callback);
window.sikPrompt = (mesaj, callback, varsayilan, baslik) => sikModal.ac('prompt', baslik || 'Giriş', mesaj, callback, varsayilan);

function takvimOlustur() {
  var ay = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();
  var yil = window.aktifYil || new Date().getFullYear();

  var gunText = document.getElementById('gun-text');
  if (gunText) {
    gunText.textContent = new Date().getDate();
  }

  var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var takvimAyEl = document.getElementById('takvimAy');
  if (takvimAyEl) takvimAyEl.textContent = aylar[ay] + ' ' + yil;

  var grid = document.getElementById('takvimGrid');
  if (!grid) return;
  grid.innerHTML = '';

  var gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  gunler.forEach(function(g) {
    var div = document.createElement('div');
    div.className = 'takvim-gun-header';
    div.textContent = g;
    grid.appendChild(div);
  });

  var ilkGun = new Date(yil, ay, 1).getDay();
  var gunSayisi = new Date(yil, ay + 1, 0).getDate();
  var baslangic = ilkGun === 0? 6 : ilkGun - 1;

  for (var i = 0; i < baslangic; i++) {
    var div = document.createElement('div');
    div.className = 'takvim-gun bos';
    grid.appendChild(div);
  }

  var key = yil + '-' + (ay + 1);
  var data = window.takvimData?.[key] || {};
  var keyAy = (ay + 1).toString();
  var buAyResmi = (typeof CONFIG!== 'undefined' && CONFIG.resmiTatiller)? CONFIG.resmiTatiller[keyAy] || [] : [];

  var bugun = new Date();
  var bugunGun = (bugun.getFullYear() === yil && bugun.getMonth() === ay)? bugun.getDate() : -1;

  for (var g = 1; g <= gunSayisi; g++) {
    var div = document.createElement('div');
    div.className = 'takvim-gun';
    var tip = data[g];
    var tarih = new Date(yil, ay, g);
    var saatBilgi = '';

    if (tip && tip.startsWith('ucretsiz:')) {
      saatBilgi = tip.split(':')[1] + 's';
      tip = 'ucretsiz';
    }

    if (tip === 'rapor-yeni') {
      saatBilgi = 'Yeni';
      tip = 'rapor';
    }

    if (!tip) {
      if (buAyResmi.indexOf(g)!== -1) {
        tip = 'resmi-bos';
      }
      else if (tarih.getDay() === 0) {
        tip = 'pazar-bos';
      }
      else {
        tip = 'calisma';
      }
    }

    div.classList.add(tip);

    if (g === bugunGun) div.classList.add('bugun');

    if (typeof window.avansGunuMu === 'function' && window.avansGunuMu(yil, ay, g)) {
      div.classList.add('avans');
    }

    div.innerHTML = '<span class="gun-sayi">' + g + '</span>' + (saatBilgi? '<span class="saat-badge">' + saatBilgi + '</span>' : '');
    div.onclick = (function(gun) {
      return function() { gunSec(gun) }
    })(g);
    grid.appendChild(div);
  }

  takvimIkonDurumGuncelle();
}

function takvimIkonDurumGuncelle() {
  var ay = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();
  var yil = window.aktifYil || new Date().getFullYear();
  var key = yil + '-' + (ay + 1);
  var data = window.takvimData?.[key] || {};

  var takvimBtn = document.getElementById('takvimBtn');
  if (!takvimBtn) return;

  var isaretliVar = false;
  for (var gun in data) {
    var tip = data[gun];
    if (tip && tip!== 'calisma' && tip!== 'pazar-bos' && tip!== 'resmi-bos') {
      isaretliVar = true;
      break;
    }
  }

  if (isaretliVar) {
    takvimBtn.classList.add('canli');
    takvimBtn.setAttribute('data-badge', '•');
  } else {
    takvimBtn.classList.remove('canli');
    takvimBtn.removeAttribute('data-badge');
  }
}

function avansKesimGunuHesapla(yil, ay) {
  if (typeof avansBilgisiAl === 'function') {
    const avans = avansBilgisiAl(yil, ay);
    if (avans) {
      let kesimGunu = avans.gun - 2;
      const kesimDate = new Date(yil, ay, kesimGunu);
      const gun = kesimDate.getDay();
      if (gun === 0) return kesimGunu - 2;
      if (gun === 6) return kesimGunu - 1;
      return kesimGunu;
    }
  }

  let kesimGunu = 18;
  const kesimDate = new Date(yil, ay, kesimGunu);
  const gun = kesimDate.getDay();
  if (gun === 0) return kesimGunu - 2;
  if (gun === 6) return kesimGunu - 1;
  return kesimGunu;
}

function gunSec(gun) {
  seciliGun = gun;
  var modal = document.getElementById('modal');
  var baslik = document.getElementById('modalBaslik');
  var secimler = document.getElementById('modalSecimler');
  if (!modal ||!baslik ||!secimler) return;

  var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var baslikSpan = baslik.querySelector('span');
  var guncelAy = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();
  if (baslikSpan) baslikSpan.textContent = gun + ' ' + aylar[guncelAy] + ' ' + (window.aktifYil || new Date().getFullYear());

  var tipler = [
    { kod: 'calisma', ad: 'Normal Çalışma' },
    { kod: 'mesai-haftasonu', ad: 'Mesai Hafta Sonu' },
    { kod: 'resmi-calisma', ad: 'Resmi Tatil Çalışma' },
    { kod: 'rapor', ad: 'Raporlu' },
    { kod: 'ucretsiz', ad: 'Ücretsiz İzin' },
    { kod: 'yillik', ad: 'Yıllık İzin' },
    { kod: 'pazar-bos', ad: 'Pazar Boş' },
    { kod: 'resmi-bos', ad: 'Resmi Tatil Boş' }
  ];

  secimler.innerHTML = '';
  tipler.forEach(function(t) {
    var btn = document.createElement('button');
    btn.className = 'modal-btn';
    btn.textContent = t.ad;
    btn.onclick = function() {
      if (t.kod === 'ucretsiz') {
        // YENİ: ŞIK PROMPT
        sikPrompt('Ücretsiz izin kaç saat?', function(saat) {
          if (saat!== null && saat!== '' &&!isNaN(parseFloat(saat))) {
            var yil = window.aktifYil || new Date().getFullYear();
            var ay = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();
            var key = yil + '-' + (ay + 1);

            if (!window.takvimData) window.takvimData = {};
            if (!window.takvimData[key]) window.takvimData[key] = {};

            window.takvimData[key][seciliGun] = 'ucretsiz:' + parseFloat(saat);

            var storageKey = 'maasTakvim_v' + window.APP_VERSION;
            localStorage.setItem(storageKey, JSON.stringify(window.takvimData));
            takvimOlustur();
            modalKapat();
          }
        }, '7.5', 'Ücretsiz İzin');
      } else if (t.kod === 'rapor' && seciliGun === 1) {
        // Ayın 1. günü raporlu işaretleniyor: önceki ayın son günü de raporluysa,
        // bu tek bir devam eden rapor mu yoksa alakasız yeni bir rapor mu diye sor.
        var yil2 = window.aktifYil || new Date().getFullYear();
        var ay2 = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();
        var oncekiAy2 = ay2 - 1, oncekiYil2 = yil2;
        if (oncekiAy2 < 0) { oncekiAy2 = 11; oncekiYil2 = yil2 - 1; }
        var oncekiKey2 = oncekiYil2 + '-' + (oncekiAy2 + 1);
        var oncekiAyTakvim2 = (window.takvimData && window.takvimData[oncekiKey2]) || {};
        var oncekiAySonGun2 = new Date(oncekiYil2, oncekiAy2 + 1, 0).getDate();
        var oncekiTip2 = oncekiAyTakvim2[oncekiAySonGun2];
        var oncekiRaporMu2 = oncekiTip2 === 'rapor' || oncekiTip2 === 'rapor-yeni';
        if (oncekiRaporMu2) {
          modalKapat();
          sikConfirm('Önceki ayın son günü de raporlu görünüyor.\n\nBu rapor ÖNCEKİ AYDAN DEVAM mı ediyor? (İlk 2 gün işveren ödemesi hakkı önceki ayda kullanılmış sayılır)\n\nDevam ediyorsa "Onayla", alakasız/yeni bir raporsa "İptal" seç.', function(devamMi){
            tipAta(devamMi? 'rapor' : 'rapor-yeni');
          }, 'Rapor Devam mı, Yeni mi?');
        } else {
          tipAta('rapor');
        }
      } else {
        tipAta(t.kod);
      }
    };
    secimler.appendChild(btn);
  });

  document.body.classList.add('modal-acik');
  modal.classList.add('aktif');
}

function modalKapat(event) {
  if (event && event.target!== event.currentTarget) return;
  var modal = document.getElementById('modal');
  if (modal) modal.classList.remove('aktif');
  document.body.classList.remove('modal-acik');
}

function tipAta(tip) {
  var yil = window.aktifYil || new Date().getFullYear();
  var ay = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();
  var key = yil + '-' + (ay + 1);
  var storageKey = 'maasTakvim_v' + window.APP_VERSION;

  if (!window.takvimData) window.takvimData = {};
  if (!window.takvimData[key]) window.takvimData[key] = {};

  delete window.takvimData[key][seciliGun];

  if (tip && tip!== 'calisma' && tip!== 'bos') {
    window.takvimData[key][seciliGun] = tip;
  }

  localStorage.setItem(storageKey, JSON.stringify(window.takvimData));

  localStorage.removeItem('sonHesap');
  var sonucKart = document.getElementById('sonucKarti');
  if (sonucKart) sonucKart.style.display = 'none';

  modalKapat();
  takvimOlustur();

  console.log('Takvim güncellendi. Değişikliklerin bordroya yansıması için "Hesapla" butonuna bas.');
}

async function ayDegistir(yon) {
  window.aktifAy = (typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth()) + yon;
  if (window.aktifAy < 0) {
    window.aktifAy = 11;
    window.aktifYil = (window.aktifYil || new Date().getFullYear()) - 1;
  }
  if (window.aktifAy > 11) {
    window.aktifAy = 0;
    window.aktifYil = (window.aktifYil || new Date().getFullYear()) + 1;
  }

  if (typeof vergiYukle === 'function') await vergiYukle();

  takvimOlustur();
}

function takvimTemizle() {
  var ay = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();
  var yil = window.aktifYil || new Date().getFullYear();
  var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  // YENİ: ŞIK CONFIRM
  sikConfirm(aylar[ay] + ' ' + yil + ' ayına ait TÜM TAKVİM VERİLERİ SİLİNECEK.\n\nDevam edilsin mi?', function(onay) {
    if (!onay) return;

    var key = yil + '-' + (ay + 1);
    var storageKey = 'maasTakvim_v' + window.APP_VERSION;
    if (window.takvimData) delete window.takvimData[key];
    localStorage.setItem(storageKey, JSON.stringify(window.takvimData || {}));

    localStorage.removeItem('sonHesap');
    var sonucKart = document.getElementById('sonucKarti');
    if (sonucKart) sonucKart.style.display = 'none';

    takvimOlustur();
    sikAlert('Takvim verileri silindi. Bordroyu güncellemek için "Hesapla" butonuna bas.', 'Temizlendi');
  }, 'Takvimi Temizle');
}

document.addEventListener('DOMContentLoaded', function() {
  if (typeof takvimOlustur === 'function') {
    takvimOlustur();
  }
});

// Export
window.takvimOlustur = takvimOlustur;
window.gunSec = gunSec;
window.tipAta = tipAta;
window.ayDegistir = ayDegistir;
window.takvimTemizle = takvimTemizle;
window.avansKesimGunuHesapla = avansKesimGunuHesapla;
window.modalKapat = modalKapat;