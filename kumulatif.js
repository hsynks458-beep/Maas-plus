// ==========================================
// KUMULATIF.JS - v64.3 - iOS Uyumluluk + Şık Modal
// ==========================================

var KEY_YILLIK = window.KEY_YILLIK || 'maasYillik_v64';
var aktifYil = typeof window.aktifYil!== 'undefined'? window.aktifYil : new Date().getFullYear();
var aktifAy = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();

function getVal(id){
  var el=document.getElementById(id);
  if(!el||!el.value)return 0;
  return parseFloat(el.value.toString().trim().replace(/\./g,'').replace(',','.'))||0;
}

function formatla(s){
  var num=parseFloat(s)||0;
  return num.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
}

function getStorageData(){
  return {
    yillikData: JSON.parse(localStorage.getItem(KEY_YILLIK)||'{}')
  };
}

function veriTemizle(){
  var yillikData = JSON.parse(localStorage.getItem(KEY_YILLIK)||'{}');
  var degisti = false;
  var pMax = (typeof CONFIG!== 'undefined' && CONFIG.parametreler && CONFIG.parametreler.SGK_TAVAN)? CONFIG.parametreler.SGK_TAVAN * 2 : 1000000;

  Object.keys(yillikData).forEach(function(key){
    var ayData = yillikData[key];
    if(!ayData || typeof ayData.brut!== 'number' || ayData.brut > pMax || ayData.brut < 0 || isNaN(ayData.brut)){
      console.warn('Bozuk ay verisi silindi:', key, ayData);
      delete yillikData[key];
      degisti = true;
    }
  });
  if(degisti){
    localStorage.setItem(KEY_YILLIK, JSON.stringify(yillikData));
    console.log('LocalStorage temizlendi');
  }
  return yillikData;
}

function hesaplaKumulatif(buAyBrut, buAyGv, buAyGvMatrah){
  aktifYil = typeof window.aktifYil!== 'undefined'? window.aktifYil : new Date().getFullYear();
  aktifAy = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();

  var yillikData = veriTemizle();
  var key = aktifYil + '-' + (aktifAy + 1);
  var pMax = (typeof CONFIG!== 'undefined' && CONFIG.parametreler && CONFIG.parametreler.SGK_TAVAN)? CONFIG.parametreler.SGK_TAVAN * 2 : 1000000;

  if(buAyBrut > pMax || buAyBrut < 0 || isNaN(buAyBrut)){
    console.error('HATA: Geçersiz buAyBrut:', buAyBrut);
    sikAlert('Hesaplama hatası: Brüt değer sınırları aşıyor.\n\nSayfayı yenileyin.', 'Hata');
    return;
  }

  if(buAyBrut > 0){
    var mesaiHici = getVal('mesaiHici');
    var geceVardiya = getVal('geceVardiya');
    var mesaiHsonu = 0;

    var takvimKey = aktifYil + '-' + (aktifAy + 1);
    var takvimAyData = (window.takvimData && window.takvimData[takvimKey]) || {};
    Object.keys(takvimAyData).forEach(function(gun){
      if(takvimAyData[gun] === 'mesai-haftasonu') mesaiHsonu++;
    });

    yillikData[key] = {
      brut: Number(buAyBrut) || 0,
      gv: Number(buAyGv) || 0,
      gvMatrah: Number(buAyGvMatrah) || 0,
      net: getVal('netOdenecek') || 0,
      mesaiHici: mesaiHici,
      gece: geceVardiya,
      mesaiHsonu: mesaiHsonu,
      yakacak: getVal('yakacak'),
      cocuk: getVal('cocuk'),
      a101: getVal('a101Ceki'),
      yillikIzin: getVal('yillikIzinHarclik'),
      ay: aktifAy + 1,
      guncelleme: new Date().toISOString()
    };
    localStorage.setItem(KEY_YILLIK, JSON.stringify(yillikData));
  }

  var kumulatifBrut = 0, kumulatifGv = 0, kumulatifGvMatrah = 0;
  var aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var dokumHtml = '';

  for(var i = 0; i < 12; i++){
    var ayKey = aktifYil + '-' + (i + 1);
    var ayData = yillikData[ayKey];
    if(ayData && ayData.brut > 0 && ayData.brut < pMax){
      kumulatifBrut += ayData.brut || 0;
      kumulatifGv += ayData.gv || 0;
      kumulatifGvMatrah += ayData.gvMatrah || 0;

      dokumHtml += '<div class="data-row" style="display:flex;justify-content:space-between;align-items:center">';
      dokumHtml += '<span>' + aylar[i] + '</span>';
      dokumHtml += '<div style="display:flex;align-items:center;gap:8px">';
      dokumHtml += '<span>' + formatla(ayData.brut) + '</span>';
      dokumHtml += '<button onclick="aySil(' + i + ')" style="background:var(--hata);border:none;border-radius:4px;color:white;width:24px;height:24px;cursor:pointer;font-size:12px;line-height:1">🗑️</button>';
      dokumHtml += '</div></div>';
    }
  }

  var kumBrutEl = document.getElementById('kumulatifBrut');
  var kumGvEl = document.getElementById('kumulatifGv');
  var dokumEl = document.getElementById('aylikDokum');
  if(kumBrutEl) kumBrutEl.textContent = formatla(kumulatifBrut);
  if(kumGvEl) kumGvEl.textContent = formatla(kumulatifGv);
  if(dokumEl) dokumEl.innerHTML = dokumHtml || '<div style="text-align:center;opacity:.5;padding:20px">Henüz veri yok</div>';

  var dilimler = (typeof CONFIG!== 'undefined' && CONFIG.dilimler)? CONFIG.dilimler : [];
  var aktifOran = 15;
  var sonrakiLimit = Infinity;
  var sonrakiOran = 0;

  if(dilimler.length > 0){
    for(var j = 0; j < dilimler.length; j++){
      var limit = dilimler[j].limit === null? Infinity : dilimler[j].limit;
      if(kumulatifGvMatrah <= limit){
        aktifOran = dilimler[j].oran * 100;
        sonrakiLimit = limit;
        sonrakiOran = j + 1 < dilimler.length? dilimler[j + 1].oran * 100 : 0;
        break;
      }
    }
  }

  var vergiDilimEl = document.getElementById('vergiDilim');
  var kumGvMatrahEl = document.getElementById('kumulatifGvMatrah');
  if(vergiDilimEl) vergiDilimEl.textContent = '%' + aktifOran;
  if(kumGvMatrahEl) kumGvMatrahEl.textContent = formatla(kumulatifGvMatrah);

  var kalan = sonrakiLimit - kumulatifGvMatrah;
  var dilimKalanEl = document.getElementById('dilimKalan');
  var dilimAyEl = document.getElementById('dilimAy');
  if(kalan > 0 && kalan < Infinity){
    if(dilimKalanEl) dilimKalanEl.textContent = formatla(kalan);
    if(dilimAyEl) dilimAyEl.textContent = '-';
  }else{
    if(dilimKalanEl) dilimKalanEl.textContent = '-';
    if(dilimAyEl) dilimAyEl.textContent = 'En üst dilim';
  }

  var uyariHtml = '';
  var kart = document.getElementById('kumulatifKart');
  if(kart) kart.className = 'result-card';

  if(aktifOran >= 27){
    uyariHtml += '<div class="uyari-kutu kirmizi">⚠️ %' + aktifOran + ' vergi dilimindesin.</div>';
    if(kart) kart.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
  }else if(kalan < 20000 && kalan > 0){
    uyariHtml += '<div class="uyari-kutu sari">⚠️ %' + sonrakiOran + ' dilimine ' + formatla(kalan) + ' kaldı.</div>';
    if(kart) kart.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)';
  }else{
    uyariHtml += '<div class="uyari-kutu yesil">✓ %' + aktifOran + ' dilimindesin.</div>';
    if(kart) kart.style.background = 'linear-gradient(135deg,#10b981,#059669)';
  }

  var kumUyariEl = document.getElementById('kumulatifUyari');
  if(kumUyariEl) kumUyariEl.innerHTML = uyariHtml;

  if(typeof analizGuncelle === 'function') analizGuncelle(yillikData);
}

function kumulatifGuncelle(){
  hesaplaKumulatif(0, 0, 0);
}

// ŞIK MODAL: Kümülatif temizle
function kumulatifTemizle(){
  sikConfirm(
    aktifYil + ' YILINA AİT TÜM AYLIK VERİLER SİLİNECEK.\n\nOcak\'tan Aralık\'a kadar tüm brüt, vergi ve matrah kayıtları silinecek.\n\nDevam edilsin mi?',
    function(onay) {
      if(!onay) return;
      localStorage.removeItem(KEY_YILLIK);
      if(typeof hesapla === 'function') hesapla();
      sikAlert('Kümülatif veriler silindi.', 'Başarılı');
    },
    'Tehlikeli İşlem'
  );
}

// ŞIK MODAL: Ay sil
function aySil(ayIndex){
  var aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  sikConfirm(
    aylar[ayIndex] + ' ayı silinecek.\n\nEmin misin?',
    function(onay) {
      if(!onay) return;
      var yillikData = JSON.parse(localStorage.getItem(KEY_YILLIK) || '{}');
      var key = aktifYil + '-' + (ayIndex + 1);
      delete yillikData[key];
      localStorage.setItem(KEY_YILLIK, JSON.stringify(yillikData));
      hesaplaKumulatif(0, 0, 0);
      sikAlert(aylar[ayIndex] + ' ayı silindi.', 'Başarılı');
    },
    'Ay Sil'
  );
}

// TOPLU GİRİŞ: Her satırı "Ay Brüt Matrah(opsiyonel)" olarak ayrıştırıp hepsini tek seferde kaydeder
var AY_ISIMLERI_NORMALIZE = {
  'ocak':1,'subat':2,'şubat':2,'mart':3,'nisan':4,'mayis':5,'mayıs':5,'haziran':6,
  'temmuz':7,'agustos':8,'ağustos':8,'eylul':9,'eylül':9,'ekim':10,'kasim':11,'kasım':11,'aralik':12,'aralık':12
};

function ayAdiCoz(kelime){
  var n = kelime.toString().trim().toLowerCase()
    .replace('ş','s').replace('ı','i').replace('ğ','g').replace('ü','u').replace('ö','o').replace('ç','c');
  var direkSayi = parseInt(kelime);
  if(!isNaN(direkSayi) && direkSayi >= 1 && direkSayi <= 12) return direkSayi;
  var eslesme = {
    'ocak':1,'subat':2,'mart':3,'nisan':4,'mayis':5,'haziran':6,
    'temmuz':7,'agustos':8,'eylul':9,'ekim':10,'kasim':11,'aralik':12
  };
  return eslesme[n] || null;
}

function topluGirisKaydet(){
  var metinEl = document.getElementById('topluGirisMetin');
  if(!metinEl || !metinEl.value.trim()){
    sikAlert('Önce en az bir satır yaz.', 'Uyarı');
    return;
  }
  var pMax = (typeof CONFIG!== 'undefined' && CONFIG.parametreler && CONFIG.parametreler.SGK_TAVAN)? CONFIG.parametreler.SGK_TAVAN * 2 : 1000000;
  var sskOran = (typeof CONFIG!== 'undefined' && CONFIG.parametreler)? CONFIG.parametreler.SSK_ISCI_ORAN : 0.14;
  var issizlikOran = (typeof CONFIG!== 'undefined' && CONFIG.parametreler)? CONFIG.parametreler.ISSIZLIK_ISCI_ORAN : 0.01;
  var damgaOran = (typeof CONFIG!== 'undefined' && CONFIG.parametreler)? CONFIG.parametreler.DAMGA_ORAN : 0.00759;
  var tahminiKesintiOran = sskOran + issizlikOran + damgaOran + 0.15;

  var satirlar = metinEl.value.split('\n');
  var yillikData = JSON.parse(localStorage.getItem(KEY_YILLIK) || '{}');
  var kaydedilen = [];
  var hatalar = [];
  var aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  satirlar.forEach(function(satir, idx){
    satir = satir.trim();
    if(!satir) return;
    var parcalar = satir.split(/[\s,;\t]+/).filter(Boolean);
    if(parcalar.length < 2){
      hatalar.push('Satır ' + (idx+1) + ': eksik veri (' + satir + ')');
      return;
    }
    var ay = ayAdiCoz(parcalar[0]);
    var brut = parseFloat(parcalar[1].replace(/\./g,'').replace(',','.'));
    var matrahGiris = parcalar[2]? parseFloat(parcalar[2].replace(/\./g,'').replace(',','.')) : 0;

    if(!ay){
      hatalar.push('Satır ' + (idx+1) + ': ay tanınamadı (' + parcalar[0] + ')');
      return;
    }
    if(isNaN(brut) || brut <= 0 || brut > pMax){
      hatalar.push('Satır ' + (idx+1) + ' (' + aylar[ay-1] + '): geçersiz brüt');
      return;
    }
    if(matrahGiris && (isNaN(matrahGiris) || matrahGiris > pMax)){
      hatalar.push('Satır ' + (idx+1) + ' (' + aylar[ay-1] + '): geçersiz matrah');
      return;
    }

    var gvMatrah = matrahGiris > 0? matrahGiris : brut * (1 - sskOran - issizlikOran);
    var tahminiNet = brut * (1 - tahminiKesintiOran);
    var key = aktifYil + '-' + ay;
    yillikData[key] = {
      brut: brut, gv: 0, gvMatrah: gvMatrah, net: tahminiNet,
      mesaiHici: 0, gece: 0, mesaiHsonu: 0, yakacak: 0, cocuk: 0, a101: 0, yillikIzin: 0,
      ay: ay, manuel: true
    };
    kaydedilen.push(aylar[ay-1]);
  });

  localStorage.setItem(KEY_YILLIK, JSON.stringify(yillikData));
  hesaplaKumulatif(0, 0, 0);

  var mesaj = '';
  if(kaydedilen.length) mesaj += kaydedilen.length + ' ay kaydedildi:\n' + kaydedilen.join(', ');
  if(hatalar.length) mesaj += (mesaj? '\n\n':'') + 'Atlanan satırlar:\n' + hatalar.join('\n');
  if(!kaydedilen.length && !hatalar.length) mesaj = 'Kaydedilecek geçerli satır bulunamadı.';

  sikAlert(mesaj, hatalar.length && !kaydedilen.length? 'Hata' : 'Başarılı');
  if(kaydedilen.length) metinEl.value = '';
}

window.topluGirisKaydet = topluGirisKaydet;
window.ayAdiCoz = ayAdiCoz;

// ŞIK MODAL: Manuel brüt ekle
function manuelBrutEkle(){
  var manuelAyEl = document.getElementById('manuelAy');
  if(!manuelAyEl) return;
  var ay = parseInt(manuelAyEl.value);
  var brut = getVal('manuelBrut');
  var manuelMatrahGiris = getVal('manuelMatrah');
  var pMax = (typeof CONFIG!== 'undefined' && CONFIG.parametreler && CONFIG.parametreler.SGK_TAVAN)? CONFIG.parametreler.SGK_TAVAN * 2 : 1000000;

  if(brut <= 0 || brut > pMax){
    sikAlert('Geçerli brüt gir!\n\nSınırlar dahilinde olmalı.', 'Hata');
    return;
  }
  if(manuelMatrahGiris > pMax){
    sikAlert('GV Matrahı sınırları aşıyor.\n\nDaha küçük bir değer gir.', 'Hata');
    return;
  }

  var sskOran = (typeof CONFIG!== 'undefined' && CONFIG.parametreler)? CONFIG.parametreler.SSK_ISCI_ORAN : 0.14;
  var issizlikOran = (typeof CONFIG!== 'undefined' && CONFIG.parametreler)? CONFIG.parametreler.ISSIZLIK_ISCI_ORAN : 0.01;
  var damgaOran = (typeof CONFIG!== 'undefined' && CONFIG.parametreler)? CONFIG.parametreler.DAMGA_ORAN : 0.00759;
  var tahminiKesintiOran = sskOran + issizlikOran + damgaOran + 0.15;
  // GV Matrahı elle girildiyse onu birebir kullan, girilmediyse Brüt×(1-SSK-İşsizlik) ile yaklaşık hesapla
  var gvMatrah = manuelMatrahGiris > 0? manuelMatrahGiris : brut * (1 - sskOran - issizlikOran);
  var tahminiNet = brut * (1 - tahminiKesintiOran);

  var yillikData = JSON.parse(localStorage.getItem(KEY_YILLIK) || '{}');
  var key = aktifYil + '-' + ay;
  yillikData[key] = {
    brut: brut,
    gv: 0,
    gvMatrah: gvMatrah,
    net: tahminiNet,
    mesaiHici: 0,
    gece: 0,
    mesaiHsonu: 0,
    yakacak: 0,
    cocuk: 0,
    a101: 0,
    yillikIzin: 0,
    ay: ay,
    manuel: true
  };
  localStorage.setItem(KEY_YILLIK, JSON.stringify(yillikData));
  var manuelBrutEl = document.getElementById('manuelBrut');
  var manuelMatrahEl = document.getElementById('manuelMatrah');
  if(manuelBrutEl) manuelBrutEl.value = '';
  if(manuelMatrahEl) manuelMatrahEl.value = '';
  hesaplaKumulatif(0, 0, 0);
  var aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var matrahNotu = manuelMatrahGiris > 0? '\nGV Matrahı: ' + formatla(gvMatrah) + ' (elle girildi)' : '\nGV Matrahı: ' + formatla(gvMatrah) + ' (otomatik tahmin)';
  sikAlert(aylar[ay - 1] + ' ayı brüt eklendi:\n\n' + formatla(brut) + matrahNotu, 'Başarılı');
}

// Global export
window.hesaplaKumulatif = hesaplaKumulatif;
window.kumulatifGuncelle = kumulatifGuncelle;
window.kumulatifTemizle = kumulatifTemizle;
window.aySil = aySil;
window.manuelBrutEkle = manuelBrutEkle;