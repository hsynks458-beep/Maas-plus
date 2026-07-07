// ==========================================
// MAIN.JS - v64.34 - iOS Uyumluluk + URL Param + Şık Modal + Tüm Sekmelerde Sabit Buton
// ==========================================

// Version.js yüklendikten sonra çalışır
var KEY_AYARLAR = 'maasAyarlar_v' + window.APP_VERSION;
var KEY_TEMA = 'maasTema_v' + window.APP_VERSION;
var KEY_TAKVIM = 'maasTakvim_v' + window.APP_VERSION;
var KEY_YILLIK = 'maasYillik_v' + window.APP_VERSION;
var KEY_SAYFA = 'maasSayfa_v' + window.APP_VERSION;

var takvimData = {};
var aktifAy = new Date().getMonth();
var aktifYil = new Date().getFullYear();
var aktifSekme = 0;
var TOPLAM_SEKME = 5;
window.CONFIG = {};

// ==========================================
// VERGİ VERİSİ YÜKLEME
// ==========================================
async function vergiYukle() {
  try {
    const res = await fetch('vergi.json?v=' + window.APP_VERSION);
    if (!res.ok) throw new Error('vergi.json yüklenemedi');
    const data = await res.json();
    window.CONFIG = data[aktifYil] || data['2026'] || {};
    console.log('Vergi verisi yüklendi:', aktifYil, window.CONFIG);
  } catch (err) {
    console.error('Vergi yükleme hatası:', err);
    console.warn('Fallback vergi parametreleri kullanılıyor');
    window.CONFIG = {
      asgariUcret: 28075.50,
      asgariDvIstisna: 250.70,
      asgariGvIstisna: {
        "1": 4211.33, "2": 4211.33, "3": 4211.33, "4": 4211.33, "5": 4211.33, "6": 4211.33,
        "7": 4537.75, "8": 5615.10, "9": 5615.10, "10": 5615.10, "11": 5615.10, "12": 5615.10
      },
      parametreler: {
        SSK_ISCI_ORAN: 0.14,
        ISSIZLIK_ISCI_ORAN: 0.01,
        BES_ORAN: 0.03,
        DAMGA_ORAN: 0.00759,
        SGK_TAVAN: 750000
      },
      dilimler: [
        {"limit": 190000, "oran": 0.15},
        {"limit": 400000, "oran": 0.20},
        {"limit": 1500000, "oran": 0.27},
        {"limit": 5300000, "oran": 0.35},
        {"limit": null, "oran": 0.40}
      ],
      resmiTatiller: {}
    };
  }
}

// ==========================================
// TEMA VE SEKME YÖNETİMİ
// ==========================================
function temaDegistir() {
  var mevcut = document.documentElement.getAttribute('data-theme') || 'dark';
  var yeni = mevcut === 'dark'? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', yeni);
  localStorage.setItem(KEY_TEMA, yeni);
  var iconBtn = document.querySelector('.icon-btn');
  if (iconBtn) iconBtn.textContent = yeni === 'dark'? '🌙' : '☀️';
}

function sekmeDegistir(index) {
  aktifSekme = index;
  localStorage.setItem(KEY_SAYFA, index);

  document.querySelectorAll('.tab').forEach(function(tab, i) {
    if (i === index) tab.classList.add('active');
    else tab.classList.remove('active');
  });

  var pages = document.querySelector('.pages');
  if (pages) {
    var yuzde = (100 / TOPLAM_SEKME) * index;
    pages.style.transform = 'translateX(-' + yuzde + '%)';
  }

  var content = document.querySelector('.content');
  if (content) content.scrollTop = 0;

  var aktifPage = document.querySelectorAll('.page')[index];
  if (aktifPage) aktifPage.scrollTo({ top: 0, behavior: 'instant' });
}

function swipeBaslat() {
  var startX = 0;
  var content = document.querySelector('.content');
  if (!content) return;

  content.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });

  content.addEventListener('touchend', function(e) {
    var endX = e.changedTouches[0].clientX;
    var fark = startX - endX;
    if (Math.abs(fark) > 50) {
      if (fark > 0 && aktifSekme < TOPLAM_SEKME - 1) sekmeDegistir(aktifSekme + 1);
      else if (fark < 0 && aktifSekme > 0) sekmeDegistir(aktifSekme - 1);
    }
  });
}

// ==========================================
// AKORDİYON
// ==========================================
function akordiyonAc(header) {
  var card = header.parentElement;
  var body = card.querySelector('.card-body');
  var chevron = header.querySelector('.chevron');
  if (!body) return;

  var isOpen = body.style.maxHeight && body.style.maxHeight!== '0px';
  if (isOpen) {
    body.style.maxHeight = '0px';
    body.style.padding = '0 16px';
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  } else {
    body.style.maxHeight = body.scrollHeight + 'px';
    body.style.padding = '0 16px 16px';
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  }
}

// ==========================================
// AYARLAR KAYDET/YÜKLE - HESAPLANAN ALANLAR EKLENDİ
// ==========================================
function kaydetAyarlar() {
  var ayarlar = {
    saatlikUcret: document.getElementById('saatlikUcret')?.value || '',
    yakacak: document.getElementById('yakacak')?.value || '',
    cocuk: document.getElementById('cocuk')?.value || '',
    a101Ceki: document.getElementById('a101Ceki')?.value || '',
    yillikIzinHarclik: document.getElementById('yillikIzinHarclik')?.value || '',
    mesaiHici: document.getElementById('mesaiHici')?.value || '',
    geceVardiya: document.getElementById('geceVardiya')?.value || '',
    mesaiHiciOran: document.getElementById('mesaiHiciOran')?.value || '2.0',
    mesaiHsonuOran: document.getElementById('mesaiHsonuOran')?.value || '2.0',
    sendikaVar: document.querySelector('input[name="sendikaVar"]:checked')?.value || '0',
    besVar: document.querySelector('input[name="besVar"]:checked')?.value || '0',
    besTutar: document.getElementById('besTutar')?.value || '',
    borcVar: document.querySelector('input[name="borcVar"]:checked')?.value || '0',
    borcToplam: document.getElementById('borcToplam')?.value || '',
    borcBaslangicAy: document.getElementById('borcBaslangicAy')?.value || '',
    // EKLENDİ: Hesaplanan alanlar
    brutUcret: document.getElementById('brutUcret')?.value || '',
    ikramiye: document.getElementById('ikramiye')?.value || '',
    avans: document.getElementById('avans')?.value || '',
    sendikaAidat: document.getElementById('sendikaAidat')?.value || '',
    toplamBrutGoster: document.getElementById('toplamBrutGoster')?.value || '',
    aySonuGoster: document.getElementById('aySonuGoster')?.value || '',
    netOdenecek: document.getElementById('netOdenecek')?.textContent || '',
    avansGoster: document.getElementById('avansGoster')?.textContent || '',
    aySonu: document.getElementById('aySonu')?.textContent || ''
  };
  localStorage.setItem(KEY_AYARLAR, JSON.stringify(ayarlar));
}

function yukleAyarlar() {
  var kayitli = localStorage.getItem(KEY_AYARLAR);
  if (!kayitli) return;
  try {
    var ayarlar = JSON.parse(kayitli);

    // Para inputlarını formatlı yükle
    var paraInputlar = ['saatlikUcret', 'yakacak', 'cocuk', 'a101Ceki', 'yillikIzinHarclik', 'besTutar', 'borcToplam', 'brutUcret', 'ikramiye', 'avans', 'sendikaAidat', 'toplamBrutGoster', 'aySonuGoster'];
    paraInputlar.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && ayarlar[id]) {
        var num = parseFloat(ayarlar[id].toString().replace(/\./g, '').replace(',', '.'));
        if (!isNaN(num) && num > 0) {
          el.value = num.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
      }
    });

    // Span elementler için
    var spanAlanlar = ['netOdenecek', 'avansGoster', 'aySonu'];
    spanAlanlar.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && ayarlar[id]) {
        el.textContent = ayarlar[id];
      }
    });

    // Diğer inputlar
    if (ayarlar.mesaiHici) document.getElementById('mesaiHici').value = ayarlar.mesaiHici;
    if (ayarlar.geceVardiya) document.getElementById('geceVardiya').value = ayarlar.geceVardiya;
    if (ayarlar.mesaiHiciOran) document.getElementById('mesaiHiciOran').value = ayarlar.mesaiHiciOran;
    if (ayarlar.mesaiHsonuOran) document.getElementById('mesaiHsonuOran').value = ayarlar.mesaiHsonuOran;
    if (ayarlar.borcBaslangicAy) document.getElementById('borcBaslangicAy').value = ayarlar.borcBaslangicAy;

    // Radio buttonlar
    if (ayarlar.sendikaVar) {
      var r = document.querySelector('input[name="sendikaVar"][value="' + ayarlar.sendikaVar + '"]');
      if (r) r.checked = true;
    }
    if (ayarlar.besVar) {
      var r = document.querySelector('input[name="besVar"][value="' + ayarlar.besVar + '"]');
      if (r) r.checked = true;
    }
    if (ayarlar.borcVar) {
      var r = document.querySelector('input[name="borcVar"][value="' + ayarlar.borcVar + '"]');
      if (r) r.checked = true;
    }
  } catch (e) {
    console.error('Ayar yükleme hatası:', e);
  }
}

// ==========================================
// SIFIRLAMA - ŞIK MODAL
// ==========================================
function herSeyiSifirla() {
  sikConfirm(
    'TÜM VERİLER SİLİNECEK!\n\nAyarlar, takvim, kümülatif veriler kalıcı olarak silinecek.\n\nDevam edilsin mi?',
    function(onay) {
      if (!onay) return;
      localStorage.removeItem(KEY_AYARLAR);
      localStorage.removeItem(KEY_TAKVIM);
      localStorage.removeItem(KEY_YILLIK);
      localStorage.removeItem(KEY_SAYFA);
      takvimData = {};
      sikAlert('Tüm veriler silindi.\n\nSayfa yenileniyor...', 'Başarılı');
      setTimeout(() => location.reload(), 1500);
    },
    'Tehlikeli İşlem'
  );
}

// ==========================================
// YARDIM MODALI
// ==========================================
function yardimGoster(sekme, e) {
  e.stopPropagation();
  var modal = document.getElementById('yardimModal');
  var baslik = document.getElementById('yardimBaslik').querySelector('span');
  var icerik = document.getElementById('yardimIcerik');
  if (!modal ||!baslik ||!icerik) return;

  var yardimlar = {
    hesap: "<b>Hesap Sekmesi:</b><br>1. Saatlik ücretini gir → Brüt, İkramiye, Avans otomatik dolar<br>2. Ek ödemeleri gir<br>3. Mesai varsa saat gir<br>4. Sendika/BES/Borç seç<br>5. <b>Hesapla</b> butonuna bas<br><br><b>Not:</b> Hesapla dediğinde bu ayın brütü otomatik kümülatife eklenir.",
    bordro: "<b>Bordro Sekmesi:</b><br>Kazanç ve kesinti detaylarını görürsün. Fiziki çek varsa net kesintisi görünür.",
    takvim: "<b>Takvim Sekmesi:</b><br>Günlere tıkla: Rapor, izin, mesai işaretle. Avans kesim tarihi: Avans günü - 2 gün. 20'si Pazar/Pazartesi ise Cuma sayılır.",
    kumulatif: "<b>Kümülatif Sekmesi:</b><br>Yıllık brüt, vergi dilimi takibi. <b>2 yöntem:</b><br>1. <b>Otomatik:</b> Hesapla butonuna bas → Bu ayın brütü eklenir<br>2. <b>Manuel:</b> Geçmiş ayları tek gir → Otomatik değeri ezer<br><br>%27 dilimine yaklaşınca uyarı verir.",
    analiz: "<b>Analiz Sekmesi:</b><br>Bu ay vs yıl ortalaması karşılaştırma. Mesai saatleri, kazanç, ek ödemeler analizi. En yüksek/düşük ayları görürsün."
  };

  baslik.textContent = sekme.charAt(0).toLocaleUpperCase('tr-TR') + sekme.slice(1);
  icerik.innerHTML = yardimlar[sekme] || "Yardım bilgisi yok";
  modal.classList.add('aktif');
  document.body.classList.add('modal-acik');
}

function yardimKapat(e) {
  if (e.target.classList.contains('modal') || e.target.closest('.modal-close')) {
    document.getElementById('yardimModal').classList.remove('aktif');
    document.body.classList.remove('modal-acik');
  }
}

function modalKapat(e) {
  if (e.target.classList.contains('modal') || e.target.closest('.modal-close')) {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('aktif'));
    document.body.classList.remove('modal-acik');
  }
}

function ayiTemizle() {
  if (typeof takvimTemizle!== 'undefined') takvimTemizle();
  else console.warn('takvimTemizle fonksiyonu tanımsız');
}

// ==========================================
// GLOBAL FONKSİYON EXPORT
// ==========================================
window.hesapla = typeof hesapla!== 'undefined'? hesapla : function() { console.warn('hesapla tanımsız') };
window.sekmeDegistir = sekmeDegistir;
window.herSeyiSifirla = herSeyiSifirla;
window.temaDegistir = temaDegistir;
window.akordiyonAc = akordiyonAc;
window.takvimTemizle = typeof takvimTemizle!== 'undefined'? takvimTemizle : function() {};
window.ayiTemizle = ayiTemizle;
window.ayDegistir = typeof ayDegistir!== 'undefined'? ayDegistir : function() {};
window.kumulatifTemizle = typeof kumulatifTemizle!== 'undefined'? kumulatifTemizle : function() {};
window.aySil = typeof aySil!== 'undefined'? aySil : function() {};
window.manuelBrutEkle = typeof manuelBrutEkle!== 'undefined'? manuelBrutEkle : function() {};
window.gunSec = typeof gunSec!== 'undefined'? gunSec : function() {};
window.modalKapat = modalKapat;
window.tipAta = typeof tipAta!== 'undefined'? tipAta : function() {};
window.formatInput = typeof formatInput!== 'undefined'? formatInput : function(el) {
  if (el && el.value) {
    var val = el.value.toString().replace(/\./g, '').replace(',', '.');
    var num = parseFloat(val);
    if (!isNaN(num)) el.value = num.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
};
window.unformatInput = typeof unformatInput!== 'undefined'? unformatInput : function(el) {
  if (el && el.value) {
    el.value = el.value.toString().replace(/\./g, '').replace(',', '.');
  }
};
window.besToggle = typeof besToggle!== 'undefined'? besToggle : function() {};
window.sendikaToggle = typeof sendikaToggle!== 'undefined'? sendikaToggle : function() {};
window.borcToggle = typeof borcToggle!== 'undefined'? borcToggle : function() {};
window.bordroIndir = typeof bordroIndir!== 'undefined'? bordroIndir : function() {};
window.yardimGoster = yardimGoster;
window.yardimKapat = yardimKapat;

// ==========================================
// SAYFA YÜKLENİNCE
// ==========================================
window.onload = async function() {
  // SPLASH EKRANI - Versiyon yaz ve kapat
  var splashVer = document.getElementById('splashVersion');
  if (splashVer) splashVer.textContent = window.APP_VERSION;

  setTimeout(() => {
    var splash = document.getElementById('splashScreen');
    if (splash) splash.classList.add('gizle');
  }, 2000);

  await vergiYukle();

  var kayitliTema = localStorage.getItem(KEY_TEMA) || 'dark';
  document.documentElement.setAttribute('data-theme', kayitliTema);
  var iconBtn = document.querySelector('.icon-btn');
  if (iconBtn) iconBtn.textContent = kayitliTema === 'dark'? '🌙' : '☀️';

  var kayitliTakvim = localStorage.getItem(KEY_TAKVIM);
  if (kayitliTakvim) {
    try {
      takvimData = JSON.parse(kayitliTakvim);
    } catch (e) {
      console.error('Takvim parse hatası:', e);
      takvimData = {};
    }
  }

  var kayitliSayfa = parseInt(localStorage.getItem(KEY_SAYFA) || '0');
  aktifSekme = isNaN(kayitliSayfa)? 0 : kayitliSayfa;

  yukleAyarlar();
  if (typeof takvimOlustur === 'function') takvimOlustur();
  if (typeof besToggle === 'function') besToggle();
  if (typeof sendikaToggle === 'function') sendikaToggle();
  if (typeof borcToggle === 'function') borcToggle();
  swipeBaslat();
  sekmeDegistir(aktifSekme);

  var params = new URLSearchParams(window.location.search);
  var tabParam = parseInt(params.get('tab'));
  if (!isNaN(tabParam) && tabParam >= 0 && tabParam < TOPLAM_SEKME) {
    sekmeDegistir(tabParam);
  }

  var suEl = document.getElementById('saatlikUcret');
  if (suEl) {
    suEl.addEventListener('input', function() {
      if (typeof saatUcretiHesapla === 'function') saatUcretiHesapla();
      kaydetAyarlar();
    });
    suEl.addEventListener('blur', function() { formatInput(this) });
    suEl.addEventListener('focus', function() { unformatInput(this) });
  }

  var btEl = document.getElementById('besTutar');
  if (btEl) btEl.readOnly = true;

  ['yakacak', 'cocuk', 'a101Ceki', 'yillikIzinHarclik', 'borcToplam', 'manuelBrut'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', function() { formatInput(el) });
      el.addEventListener('focus', function() { unformatInput(el) });
      el.addEventListener('input', kaydetAyarlar);
    }
  });

  var mhEl = document.getElementById('mesaiHici');
  if (mhEl) {
    mhEl.addEventListener('blur', function(e) {
      var val = String(this.value || '').replace(',', '.');
      this.value = val;
      kaydetAyarlar();
    });
  }

  var gvEl = document.getElementById('geceVardiya');
  if (gvEl) {
    gvEl.addEventListener('blur', function(e) {
      var val = String(this.value || '').replace(',', '.');
      this.value = val;
      kaydetAyarlar();
    });
  }

  var mhoEl = document.getElementById('mesaiHiciOran');
  if (mhoEl) mhoEl.addEventListener('change', kaydetAyarlar);

  var mhsoEl = document.getElementById('mesaiHsonuOran');
  if (mhsoEl) mhsoEl.addEventListener('change', kaydetAyarlar);

  var bbaEl = document.getElementById('borcBaslangicAy');
  if (bbaEl) bbaEl.addEventListener('change', kaydetAyarlar);

  document.querySelectorAll('input[name="besVar"]').forEach(function(r) {
    r.addEventListener('change', function() { besToggle(); kaydetAyarlar() });
  });

  document.querySelectorAll('input[name="sendikaVar"]').forEach(function(r) {
    r.addEventListener('change', function() { sendikaToggle(); kaydetAyarlar() });
  });

  document.querySelectorAll('input[name="borcVar"]').forEach(function(r) {
    r.addEventListener('change', function() { borcToggle(); kaydetAyarlar() });
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=' + window.APP_VERSION).catch(function() {});
  }
};