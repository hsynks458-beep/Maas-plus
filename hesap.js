// ==========================================
// HESAP.JS - v64.49 - A101 Çeki İterasyonlu Hesap
// ==========================================

const KIDEM_ARALIKLARI = [
  { min: 0, max: 1, gun: 14 },
  { min: 1, max: 5, gun: 16 },
  { min: 5, max: 15, gun: 22 },
  { min: 15, max: 999, gun: 30 }
];

let appState = {
  saatlikUcret: 0,
  brutUcret: 0,
  toplamBrut: 0,
  netOdenecek: 0,
  aySonu: 0,
  avans: 0,
  ikramiye: 0,
  yakacak: 0,
  cocuk: 0,
  a101Ceki: 0,
  yillikIzinHarclik: 0,
  mesaiHici: 0,
  geceVardiya: 0,
  mesaiHiciOran: 2.0,
  mesaiHsonuOran: 2.0,
  sendikaVar: false,
  sendikaAidat: 0,
  besVar: false,
  besTutar: 0,
  borcVar: false,
  borcToplam: 0,
  borcTaksit: 0,
  borcBaslangicAy: '',
  borcTaksitSayisi: 0
};

var hesaplamaDevamEdiyor = false;

function formatPara(deger) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(deger || 0);
}

function parsePara(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
}

function formatla(s){
  var num=parseFloat(s)||0;
  return num.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
}

function getVal(id){
  var el=document.getElementById(id);
  if(!el||!el.value) return 0;
  var val=el.value.toString().trim().replace(/\./g,'').replace(',','.');
  var num=parseFloat(val);
  return isNaN(num)?0:num;
}

if (typeof window.formatInput === 'undefined') {
  window.formatInput = function(el) {
    if (!el) return;
    var val = el.value.toString().trim();
    if (!val) { el.value = ''; return; }
    val = val.replace(',', '.');
    var num = parseFloat(val) || 0;
    if (num == 0) { el.value = ''; return; }
    el.value = num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (typeof kaydetAyarlar === 'function') kaydetAyarlar();
  }
}

if (typeof window.unformatInput === 'undefined') {
  window.unformatInput = function(el) {
    if (!el) return;
    var val = el.value.toString().trim();
    if (!val) { el.value = ''; return; }
    val = val.replace(/\./g, '').replace(',', '.');
    var num = parseFloat(val) || 0;
    el.value = num == 0? '' : num.toString().replace('.', ',');
  }
}

function besToggle(){
  var besRadio = document.querySelector('input[name="besVar"]:checked');
  if(!besRadio) return;
  var besVar=parseInt(besRadio.value);
  var besGrup=document.getElementById('besTutarGrup');
  var besTutar=document.getElementById('besTutar');
  if(!besGrup ||!besTutar) return;
  if(besVar){
    besGrup.style.display='flex';
    besTutar.value='';
    var card = besGrup.closest('.card');
    if(card) {
      var body = card.querySelector('.card-body');
      var chevron = card.querySelector('.chevron');
      if(body) body.style.maxHeight = body.scrollHeight + 'px';
      if(chevron) chevron.classList.add('aktif');
    }
  }else{
    besGrup.style.display='none';
    besTutar.value='';
  }
}

function sendikaToggle(){
  var sendikaRadio = document.querySelector('input[name="sendikaVar"]:checked');
  if(!sendikaRadio) return;
  var sendikaVar=parseInt(sendikaRadio.value);
  var sendikaAidat=document.getElementById('sendikaAidat');
  if(!sendikaAidat) return;
  if(sendikaVar){
    var saatlik=getVal('saatlikUcret');
    var aidat=saatlik*7.5;
    sendikaAidat.value=aidat.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
    var card = sendikaAidat.closest('.card');
    if(card) {
      var body = card.querySelector('.card-body');
      var chevron = card.querySelector('.chevron');
      if(body) body.style.maxHeight = body.scrollHeight + 'px';
      if(chevron) chevron.classList.add('aktif');
    }
  }else{
    sendikaAidat.value='0,00';
  }
}

function borcToggle(){
  var borcRadio = document.querySelector('input[name="borcVar"]:checked');
  if(!borcRadio) return;
  var borcVar=parseInt(borcRadio.value);
  var gruplar = ['borcGrup', 'borcBaslangicGrup'];

  if(borcVar){
    gruplar.forEach(id => {
      var el = document.getElementById(id);
      if(el) el.style.display='flex';
    });
    var card = document.getElementById('borcGrup').closest('.card');
    if(card) {
      var body = card.querySelector('.card-body');
      var chevron = card.querySelector('.chevron');
      if(body) {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.padding = '0 16px 16px';
      }
      if(chevron) chevron.classList.add('aktif');
    }
  }else{
    gruplar.forEach(id => {
      var el = document.getElementById(id);
      if(el) el.style.display='none';
    });
    var borcToplamEl = document.getElementById('borcToplam');
    var borcBaslangicAyEl = document.getElementById('borcBaslangicAy');
    if(borcToplamEl) borcToplamEl.value = '';
    if(borcBaslangicAyEl) borcBaslangicAyEl.value = '';
    appState.borcToplam = 0;
    appState.borcTaksit = 0;
    appState.borcBaslangicAy = '';
    appState.borcTaksitSayisi = 0;
  }
}

function saatUcretiHesapla() {
  const saatlik = getVal('saatlikUcret');
  var brutEl = document.getElementById('brutUcret');
  var ikramiyeEl = document.getElementById('ikramiye');
  var avansEl = document.getElementById('avans');
  var sendikaEl = document.getElementById('sendikaAidat');

  if (!brutEl ||!ikramiyeEl ||!avansEl ||!sendikaEl) return;

  if (saatlik > 0) {
    const brut = saatlik * 225;
    const ikramiye = saatlik * 75;
    let avans = brut * 0.40;
    avans = Math.round(avans/5)*5;
    const sendikaRadio = document.querySelector('input[name="sendikaVar"]:checked');
    const sendikaVar = sendikaRadio? parseInt(sendikaRadio.value) : 0;
    const sendikaAidat = sendikaVar? saatlik * 7.5 : 0;
    brutEl.value = brut.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    ikramiyeEl.value = ikramiye.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    avansEl.value = avans.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    sendikaEl.value = sendikaAidat.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  } else {
    brutEl.value = '0,00';
    ikramiyeEl.value = '0,00';
    avansEl.value = '0,00';
    sendikaEl.value = '0,00';
  }
}

function personelBorcuHesapla() {
  var borcToplam = getVal('borcToplam');
  var borcBaslangicAy = document.getElementById('borcBaslangicAy')?.value || '';
  if (borcToplam <= 0 ||!borcBaslangicAy) return { ana: 0, avans: 0 };

  var borcTaksitSayisi = 6;
  var ay = window.aktifAy?? new Date().getMonth();
  var yil = window.aktifYil || new Date().getFullYear();
  var suankiAy = yil + '-' + String(ay + 1).padStart(2, '0');

  if (suankiAy < borcBaslangicAy) return { ana: 0, avans: 0 };

  const baslangic = new Date(borcBaslangicAy + '-01');
  const suan = new Date(suankiAy + '-01');
  const gecenAy = (suan.getFullYear() - baslangic.getFullYear()) * 12 + (suan.getMonth() - baslangic.getMonth());

  if (gecenAy >= borcTaksitSayisi) return { ana: 0, avans: 0 };

  var borcTaksit = Math.floor(borcToplam / borcTaksitSayisi);
  const odenmisTutar = borcTaksit * gecenAy;
  const kalanBorc = borcToplam - odenmisTutar;
  const buAyTaksit = (gecenAy === borcTaksitSayisi - 1)? kalanBorc : Math.min(borcTaksit, kalanBorc);
  const avansKismi = Math.round(buAyTaksit / 2 / 10) * 10;
  const anaKismi = buAyTaksit - avansKismi;

  return { ana: anaKismi, avans: avansKismi };
}

function getBorcTaksitBilgi() {
  var borcBaslangicAy = document.getElementById('borcBaslangicAy')?.value || '';
  var borcToplam = getVal('borcToplam');
  if (!borcBaslangicAy || borcToplam <= 0) return '';
  var ay = window.aktifAy?? new Date().getMonth();
  var yil = window.aktifYil || new Date().getFullYear();
  var suankiAy = yil + '-' + String(ay + 1).padStart(2, '0');
  const baslangic = new Date(borcBaslangicAy + '-01');
  const suan = new Date(suankiAy + '-01');
  const kacinci = (suan.getFullYear() - baslangic.getFullYear()) * 12 + (suan.getMonth() - baslangic.getMonth()) + 1;
  if (kacinci < 1 || kacinci > 6) return '';
  return `(${kacinci}/6)`;
}

function manuelBrutGir() {
  sikPrompt(
    'Brüt ücreti manuel girmek istiyorsunuz.\n\nLütfen brüt tutarı yazın:',
    function(brut) {
      if (brut!== null && brut!== '' &&!isNaN(parseFloat(brut))) {
        var brutDeger = parseFloat(brut);
        document.getElementById('brutUcret').value = brutDeger.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        var saatlik = brutDeger / 225;
        document.getElementById('saatlikUcret').value = saatlik.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        if (typeof kaydetAyarlar === 'function') kaydetAyarlar();
        sikAlert('Brüt ücret güncellendi.\n\nSaatlik: ' + saatlik.toFixed(2) + ' ₺', 'Başarılı');
      } else if (brut!== null) {
        sikAlert('Geçersiz değer girdiniz.\n\nLütfen sayısal bir değer yazın.', 'Hata');
      }
    },
    '',
    'Manuel Brüt Girişi'
  );
}

async function aylikKontrol() {
  var sonKontrol = localStorage.getItem('sonVersiyonKontrol');
  var bugun = new Date().toDateString();
  if (sonKontrol === bugun) return;
  localStorage.setItem('sonVersiyonKontrol', bugun);
  try {
    var response = await fetch('versiyon.json?t=' + Date.now());
    var data = await response.json();
    var cacheKey = 'appCache_v' + data.app;
    var guncelSurum = localStorage.getItem(cacheKey);
    if (!guncelSurum) {
      localStorage.setItem(cacheKey, data.app);
      return;
    }
    if (guncelSurum!== data.app) {
      sikConfirm(
        `Yeni sürüm mevcut!\n\nMevcut: v${guncelSurum}\nYeni: v${data.app}\n\n${data.notlar || 'Güncellemeler yüklenecek.'}\n\nGüncellensin mi?`,
        function(onay) {
          if (onay) {
            localStorage.setItem(cacheKey, data.app);
            location.reload(true);
          }
        },
        'Güncelleme Mevcut'
      );
    }
  } catch (e) {
    console.log('Versiyon kontrol hatası:', e);
  }
}

function hesapla(){
  if (hesaplamaDevamEdiyor) return;
  hesaplamaDevamEdiyor = true;

  var saatlik=getVal('saatlikUcret');
  if(saatlik===0){
    sikAlert('Lütfen saatlik ücret girin.', 'Uyarı');
    hesaplamaDevamEdiyor = false;
    return;
  }
  if(typeof CONFIG === 'undefined' ||!CONFIG.parametreler){
    sikAlert('Vergi verisi yüklenmedi.\n\nLütfen sayfayı yenileyin.', 'Hata');
    hesaplamaDevamEdiyor = false;
    return;
  }

  var ay=window.aktifAy?? new Date().getMonth(),yil=window.aktifYil || new Date().getFullYear(),gunSayisi=new Date(yil,ay+1,0).getDate();
  var key=yil+'-'+(ay+1),data=window.takvimData?.[key]||{};
  var normalGun=0,pazarBosGun=0,resmiCalismaGun=0,mesaiHaftasonuGun=0,yillikGun=0;
  var raporBloklari=[];
  var mevcutBlok=null;
  var keyAy=(ay+1).toString();
  var buAyResmi=CONFIG.resmiTatiller?.[keyAy]||[];
  var toplamUcretsizIzinSaatTakvim = 0;
  var ucretsizAvansKesinti = 0;

  var avansTarih = new Date(yil,ay,20);
  var avansGun = avansTarih.getDay();
  var avansGercekTarih = 20;
  if(avansGun===0){avansGercekTarih = 18;}
  else if(avansGun===1){avansGercekTarih = 17;}
  else if(avansGun===6){avansGercekTarih = 19;}
  var kesimTarihi = avansGercekTarih - 2;

  for(var g=1;g<=gunSayisi;g++){
    var tip=data[g];
    var tarih=new Date(yil,ay,g);
    var gunHafta=tarih.getDay();
    if(tip && tip.startsWith('ucretsiz:')) {
      var saat = parseFloat(tip.split(':')[1]) || 0;
      toplamUcretsizIzinSaatTakvim += saat;
      if(g <= kesimTarihi){
        ucretsizAvansKesinti += saat * saatlik * 0.80;
      }
      continue;
    }
    if(!tip){
      if(gunHafta===0)tip='pazar-bos';
      else if(buAyResmi.indexOf(g)!==-1)tip='resmi-bos';
      else tip='calisma';
    }
    if(tip==='rapor' || tip==='rapor-yeni'){
      var buGunZorlaYeni = (tip==='rapor-yeni');
      if(!mevcutBlok)mevcutBlok={baslangic:g,bitis:g,zorlaYeni:buGunZorlaYeni};
      else mevcutBlok.bitis=g;
    }else{
      if(mevcutBlok){
        raporBloklari.push(mevcutBlok);
        mevcutBlok=null;
      }
      if(tip==='calisma')normalGun++;
      else if(tip==='mesai-haftasonu')mesaiHaftasonuGun++;
      else if(tip==='resmi-calisma')resmiCalismaGun++;
      else if(tip==='yillik')yillikGun++;
    }
  }
  if(mevcutBlok)raporBloklari.push(mevcutBlok);

  for(var g=1;g<=gunSayisi;g++){
    var tip=data[g];
    var tarih=new Date(yil,ay,g);
    var gunHafta=tarih.getDay();
    if(tip && tip.startsWith('ucretsiz:')) continue;
    if(!tip){
      if(gunHafta===0)tip='pazar-bos';
      else if(buAyResmi.indexOf(g)!==-1)tip='resmi-bos';
      else tip='calisma';
    }
    var rapordaMi = false;
    for(var rb=0; rb<raporBloklari.length; rb++){
      var blok = raporBloklari[rb];
      if(g >= blok.baslangic && g <= blok.bitis){
        rapordaMi = true;
        break;
      }
    }
    if(gunHafta===0 && tip!=='resmi-calisma' && tip!=='mesai-haftasonu' &&!rapordaMi){
      pazarBosGun++;
    }
    if(buAyResmi.indexOf(g)!==-1 && tip!=='resmi-calisma' && gunHafta!==0 &&!rapordaMi){
      pazarBosGun++;
    }
  }

  // Önceki ayın son günü de raporlu mu? (Bu ayın 1. günü raporsa, bu raporun
  // önceki aydan DEVAM ettiği ve "ilk 2 gün işveren öder" hakkının önceki ayda
  // zaten kullanılmış olduğu anlamına gelir — bu ayda tekrar sayılmamalı.)
  var oncekiAy = ay - 1, oncekiYil = yil;
  if(oncekiAy < 0){ oncekiAy = 11; oncekiYil = yil - 1; }
  var oncekiKey = oncekiYil + '-' + (oncekiAy + 1);
  var oncekiAyTakvim = window.takvimData?.[oncekiKey] || {};
  var oncekiAySonGun = new Date(oncekiYil, oncekiAy + 1, 0).getDate();
  var oncekiAySonGunTip = oncekiAyTakvim[oncekiAySonGun];
  var oncekiAySonGunRaporMu = oncekiAySonGunTip === 'rapor' || oncekiAySonGunTip === 'rapor-yeni';

  var raporOdenenGun=0;
  var raporKesilenGun=0;
  var raporAvansKesinti=0;
  var toplamRaporGun = 0;
  raporBloklari.forEach(function(blok){
    toplamRaporGun += blok.bitis - blok.baslangic + 1;
  });
  // HER BLOK için ayrı ayrı belirlenir (bloklar birbirini etkilemez):
  //  - Blok önceki aydan DEVAM ediyorsa (1. günden başlıyor ve önceki ayın son
  //    günü de raporluysa): işveren ödemesi hakkı zaten kullanılmış, 0 gün ödenir.
  //  - Blok 3 günden kısaysa (1 veya 2 gün): TÜM günler kesilir (ödenen gün yok)
  //  - Blok 3 gün ve üzeriyse: ilk 2 gün ödenir (kesilmez), 3. günden itibaren kesilir
  // Örnek: 1 gün->1 gün kesinti, 2 gün->2 gün kesinti, 3 gün->1 gün kesinti, 4 gün->2 gün kesinti
  raporBloklari.forEach(function(blok){
    var blokUzunluk = blok.bitis - blok.baslangic + 1;
    var devamEden = !blok.zorlaYeni && (blok.baslangic === 1 && oncekiAySonGunRaporMu);
    var odenenGunSayisi = devamEden? 0 : (blokUzunluk >= 3? 2 : 0);
    raporOdenenGun += odenenGunSayisi;
    var sayac = 0;
    for(var g=blok.baslangic; g<=blok.bitis; g++){
      sayac++;
      if(sayac > odenenGunSayisi && g <= kesimTarihi){
        raporAvansKesinti += saatlik*7.5*0.80;
      }

    }
  });
  raporAvansKesinti = Math.round(raporAvansKesinti/5)*5;
  raporKesilenGun = toplamRaporGun - raporOdenenGun;
  var raporTutar=raporOdenenGun*7.5*saatlik;

  var toplamUcretsizIzinSaat = toplamUcretsizIzinSaatTakvim;
  ucretsizAvansKesinti = Math.round(ucretsizAvansKesinti/5)*5;

  var toplamNormalSaat = normalGun * 7.5;
  toplamNormalSaat = Math.max(0, toplamNormalSaat);

  var normalCalismaTutar=toplamNormalSaat*saatlik;
  var haftaTatiliTutar=pazarBosGun*7.5*saatlik;
  var yillikIzinTutar=yillikGun*7.5*saatlik;
  var resmiCalismaTutar=resmiCalismaGun*7.5*saatlik*3;

  var mesaiHsonuOranEl = document.getElementById('mesaiHsonuOran');
  var mesaiHsonuOran = mesaiHsonuOranEl? parseFloat(mesaiHsonuOranEl.value) : 2.0;
  var mesaiHaftasonuTutar=mesaiHaftasonuGun*7.5*saatlik*mesaiHsonuOran;

  var mesaiHiciEl = document.getElementById('mesaiHici');
  var geceVardiyaEl = document.getElementById('geceVardiya');
  var mesaiHici = mesaiHiciEl? parseFloat(String(mesaiHiciEl.value).replace(',','.'))||0 : 0;
  var geceVardiya = geceVardiyaEl? parseFloat(String(geceVardiyaEl.value).replace(',','.'))||0 : 0;

  var mesaiHiciOranEl = document.getElementById('mesaiHiciOran');
  var mesaiHiciOran = mesaiHiciOranEl? parseFloat(mesaiHiciOranEl.value) : 2.0;

  var yakacak=getVal('yakacak');
  var cocuk=getVal('cocuk');
  var a101CekiGiris=getVal('a101Ceki');
  var yillikIzinHarclik=getVal('yillikIzinHarclik');
  var besRadio = document.querySelector('input[name="besVar"]:checked');
  var besVar = besRadio? parseInt(besRadio.value) : 0;

  var mesaiHiciTutar=mesaiHici*saatlik*mesaiHiciOran;
  var geceVardiyaTutar=geceVardiya*saatlik*0.1;

  var ikramiye=saatlik*75;
  var ikramiyeEl = document.getElementById('ikramiye');
  if(ikramiyeEl) ikramiyeEl.value=ikramiye.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});

  var sendikaRadio = document.querySelector('input[name="sendikaVar"]:checked');
  var sendikaVar = sendikaRadio? parseInt(sendikaRadio.value) : 0;
  var sendikaAidat=sendikaVar?saatlik*7.5:0;
  var sendikaEl = document.getElementById('sendikaAidat');
  if(sendikaEl) sendikaEl.value=sendikaAidat.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});

  var brutUcret=saatlik*225;
  var brutEl = document.getElementById('brutUcret');
  if(brutEl) brutEl.value=brutUcret.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});

  var borcKesinti = personelBorcuHesapla();

  // Vergi dilimini hesaplamadan ÖNCE bozuk/geçersiz ay verilerini temizle.
  // (Daha önce bu temizlik sadece hesaplaKumulatif() içinde, vergi hesaplandıktan
  // SONRA yapılıyordu; bu da kirli veri varsa gelir vergisinin bir basışta çok
  // yüksek/düşük, bir sonraki basışta normal çıkmasına sebep oluyordu.)
  var yillikData = (typeof veriTemizle === 'function') ? veriTemizle() : JSON.parse(localStorage.getItem(KEY_YILLIK)||'{}');
  var kumulatifGvMatrah=0;
  for(var i=0;i<(window.aktifAy?? new Date().getMonth());i++){
    var ayKey=(window.aktifYil || new Date().getFullYear())+'-'+(i+1);
    var ayData=yillikData[ayKey];
    if(ayData) kumulatifGvMatrah+=ayData.gvMatrah||0;
  }

  var geciciToplamBrut=normalCalismaTutar+haftaTatiliTutar+yillikIzinTutar+resmiCalismaTutar+mesaiHaftasonuTutar+raporTutar+ikramiye+mesaiHiciTutar+geceVardiyaTutar+yakacak+cocuk+yillikIzinHarclik;

  var p=CONFIG.parametreler||{};
  var sgkTavan = p.SGK_TAVAN||750000;
  var sskIsciOran = p.SSK_ISCI_ORAN||0.14;
  var issizlikIsciOran = p.ISSIZLIK_ISCI_ORAN||0.01;
  var besOran = p.BES_ORAN||0.03;
  var damgaOran = p.DAMGA_ORAN||0.00759;
  var asgariUcret = CONFIG.asgariUcret||28075.50;

  var yasalCocukMuafiyeti = asgariUcret * 0.02;
  var sskMuafCocukTutari = Math.min(cocuk, yasalCocukMuafiyeti);

  var geciciSskMatrah = geciciToplamBrut - sskMuafCocukTutari;
  geciciSskMatrah = Math.min(geciciSskMatrah, sgkTavan);
  geciciSskMatrah = Math.max(0, geciciSskMatrah);

  var geciciSskIsci=geciciSskMatrah*sskIsciOran;
  var geciciIssizlikIsci=geciciSskMatrah*issizlikIsciOran;
  var sendikaKesinti=sendikaAidat;

  var geciciGvMatrah=geciciToplamBrut-geciciSskIsci-geciciIssizlikIsci-sendikaKesinti-sskMuafCocukTutari;

  var dilimler=CONFIG.dilimler||[
    {limit:190000, oran:0.15},
    {limit:400000, oran:0.20},
    {limit:1500000, oran:0.27},
    {limit:5300000, oran:0.35},
    {limit:null, oran:0.40}
  ];

  var geciciGelirVergisi=0;
  var kalanMatrah=geciciGvMatrah;
  var oncekiKumulatif=kumulatifGvMatrah;

  for(var j=0;j<dilimler.length;j++){
    var dilim=dilimler[j];
    var dilimUstLimit=dilim.limit === null? Infinity : dilim.limit;
    if(oncekiKumulatif>=dilimUstLimit)continue;
    var buDilimdeKalan=Math.min(dilimUstLimit-oncekiKumulatif,kalanMatrah);
    if(buDilimdeKalan<=0)break;
    geciciGelirVergisi+=buDilimdeKalan*dilim.oran;
    kalanMatrah-=buDilimdeKalan;
    oncekiKumulatif+=buDilimdeKalan;
    if(kalanMatrah<=0)break;
  }

  var asgariDvIstisna = 250.70;
  var asgariGvIstisna = 4211.33;
  var guncelAy = (window.aktifAy?? new Date().getMonth()) + 1;

  if (guncelAy === 7) {
    asgariGvIstisna = 4537.75;
  } else if (guncelAy >= 8) {
    asgariGvIstisna = 5615.10;
  }

  var gercekKesintiOrani = 0;
  if(geciciGvMatrah > 0){
    gercekKesintiOrani = (geciciGelirVergisi - asgariGvIstisna) / geciciGvMatrah;
    gercekKesintiOrani = Math.max(0, gercekKesintiOrani);
  }

  // 4. A101ÇEKİ DİNAMİK BRÜTLEŞTİRME - BASİT
var a101CekiBrut = 0;
var a101CekiNetKesinti = 0;

if (a101CekiGiris > 0) {
  a101CekiNetKesinti = a101CekiGiris * 0.91;
  a101CekiNetKesinti = Number(a101CekiNetKesinti.toFixed(2));

  // Basit kontrol: Vergi 0'dan büyük mü?
  if (geciciGelirVergisi > asgariGvIstisna) {
    // Vergi var - sabit %15.759 ile brütleştir
    a101CekiBrut = a101CekiNetKesinti / 0.84241;
    a101CekiBrut = Number(a101CekiBrut.toFixed(2));
  } else {
    // Vergi yok
    a101CekiBrut = a101CekiNetKesinti;
  }
}

  var toplamBrut=geciciToplamBrut+a101CekiBrut;

  var sskMatrah = toplamBrut - a101CekiBrut - sskMuafCocukTutari;
  sskMatrah = Math.min(sskMatrah, sgkTavan);
  sskMatrah = Math.max(0, sskMatrah);

  var issizlikMatrah = sskMatrah;
  var dvMatrah = toplamBrut;

  var sskIsci=sskMatrah*sskIsciOran;
  var issizlikIsci=issizlikMatrah*issizlikIsciOran;

  var bes=0;
  if(besVar){
    bes=sskMatrah*besOran;
    bes=Math.round(bes);
    var besTutarEl = document.getElementById('besTutar');
    if(besTutarEl) besTutarEl.value=bes.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  var gvMatrah=toplamBrut-sskIsci-issizlikIsci-sendikaKesinti-sskMuafCocukTutari;
  var damgaVergisi=(dvMatrah*damgaOran)||0;

  var gelirVergisi=0;
  kalanMatrah=gvMatrah;
  oncekiKumulatif=kumulatifGvMatrah;

  for(var j=0;j<dilimler.length;j++){
    var dilim=dilimler[j];
    var dilimUstLimit=dilim.limit === null? Infinity : dilim.limit;
    if(oncekiKumulatif>=dilimUstLimit)continue;
    var buDilimdeKalan=Math.min(dilimUstLimit-oncekiKumulatif,kalanMatrah);
    if(buDilimdeKalan<=0)break;
    gelirVergisi+=buDilimdeKalan*dilim.oran;
    kalanMatrah-=buDilimdeKalan;
    oncekiKumulatif+=buDilimdeKalan;
    if(kalanMatrah<=0)break;
  }

  var farkGelirVergisi = Math.max(0, gelirVergisi - asgariGvIstisna);
  var farkDamgaVergisi = Math.max(0, damgaVergisi - asgariDvIstisna);

  var normalAvans=brutUcret*0.40;
  normalAvans=Math.round(normalAvans/5)*5;

  var avans=normalAvans-raporAvansKesinti-ucretsizAvansKesinti-borcKesinti.avans;
  avans=Math.max(0,avans);
  avans=Math.round(avans/5)*5;
  var avansEl = document.getElementById('avans');
  if(avansEl) avansEl.value=avans.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});

  var toplamKesinti=(sskIsci||0)+(issizlikIsci||0)+(sendikaKesinti||0)+(bes||0)+(farkGelirVergisi||0)+(farkDamgaVergisi||0)+(a101CekiNetKesinti||0)+(borcKesinti.ana||0)+(borcKesinti.avans||0);

  var netOdenecek=toplamBrut-toplamKesinti;
  var aySonu=netOdenecek-avans;

  var netEl = document.getElementById('netOdenecek');
  var avansGosEl = document.getElementById('avansGoster');
  var aySonuEl = document.getElementById('aySonu');
  var toplamBrutGosEl = document.getElementById('toplamBrutGoster');
  var aySonuGosEl = document.getElementById('aySonuGoster');

  if(netEl) netEl.textContent=formatla(netOdenecek);
  if(avansGosEl) avansGosEl.textContent=formatla(avans);
  if(aySonuEl) aySonuEl.textContent=formatla(aySonu);
  if(toplamBrutGosEl) toplamBrutGosEl.value = formatla(toplamBrut).replace(' ₺','');
  if(aySonuGosEl) aySonuGosEl.value = formatla(aySonu).replace(' ₺','');

    var kazancHtml = '';
  if (normalCalismaTutar > 0) kazancHtml += '<div class="data-row"><span>Normal Çalışma (' + toplamNormalSaat.toFixed(1) + ' Saat)</span><span>' + formatla(normalCalismaTutar) + '</span></div>';
  if (haftaTatiliTutar > 0) kazancHtml += '<div class="data-row"><span>Hafta Tatili Ücreti (' + (pazarBosGun * 7.5).toFixed(1) + ' Saat)</span><span>' + formatla(haftaTatiliTutar) + '</span></div>';
  if (yillikIzinTutar > 0) kazancHtml += '<div class="data-row"><span>Yıllık İzin (' + (yillikGun * 7.5).toFixed(1) + ' Saat)</span><span>' + formatla(yillikIzinTutar) + '</span></div>';
  if (resmiCalismaTutar > 0) kazancHtml += '<div class="data-row"><span>Resmi Tatil Çalışma (' + (resmiCalismaGun * 7.5).toFixed(1) + ' Saat x3)</span><span>' + formatla(resmiCalismaTutar) + '</span></div>';
  if (mesaiHaftasonuTutar > 0) kazancHtml += '<div class="data-row"><span>Mesai Hafta Sonu (' + (mesaiHaftasonuGun * 7.5).toFixed(1) + ' Saat x' + mesaiHsonuOran + ')</span><span>' + formatla(mesaiHaftasonuTutar) + '</span></div>';
  if (toplamRaporGun > 0) kazancHtml += '<div class="data-row"><span>Rapor (Toplam ' + toplamRaporGun + ' Gün, Ödenen ' + raporOdenenGun + ' Gün)</span><span>' + formatla(raporTutar) + '</span></div>';
  kazancHtml += '<div class="data-row"><span>İkramiye</span><span>' + formatla(ikramiye) + '</span></div>';
  if (mesaiHiciTutar > 0) kazancHtml += '<div class="data-row"><span>Mesai İçi (' + mesaiHici + ' Saat x%' + ((mesaiHiciOran - 1) * 100).toFixed(0) + ')</span><span>' + formatla(mesaiHiciTutar) + '</span></div>';
  if (geceVardiyaTutar > 0) kazancHtml += '<div class="data-row"><span>Gece Vardiya (' + geceVardiya + ' Saat x%10)</span><span>' + formatla(geceVardiyaTutar) + '</span></div>';
  if (yakacak > 0) kazancHtml += '<div class="data-row"><span>Yakacak Yardımı</span><span>' + formatla(yakacak) + '</span></div>';
  if (cocuk > 0) kazancHtml += '<div class="data-row"><span>Çocuk Yardımı</span><span>' + formatla(cocuk) + '</span></div>';
  if (a101CekiBrut > 0) kazancHtml += '<div class="data-row"><span>Alışveriş Çeki (Brüt)</span><span>' + formatla(a101CekiBrut) + '</span></div>';
  if (yillikIzinHarclik > 0) kazancHtml += '<div class="data-row"><span>Yıllık İzin Harçlığı</span><span>' + formatla(yillikIzinHarclik) + '</span></div>';
  kazancHtml += '<div class="data-row total"><span>TOPLAM BRÜT</span><span>' + formatla(toplamBrut) + '</span></div>';
  
  var kazancEl = document.getElementById('kazancDetay');
  if (kazancEl) kazancEl.innerHTML = kazancHtml;
  
  var kesintiHtml = '';
  kesintiHtml += '<div class="data-row"><span>SSK İşçi Payı</span><span>' + formatla(sskIsci) + '</span></div>';
  kesintiHtml += '<div class="data-row"><span>İşsizlik Sigortası</span><span>' + formatla(issizlikIsci) + '</span></div>';
  if (sendikaKesinti > 0) kesintiHtml += '<div class="data-row"><span>Sendika Aidat</span><span>' + formatla(sendikaKesinti) + '</span></div>';
  if (bes > 0) kesintiHtml += '<div class="data-row"><span>BES</span><span>' + formatla(bes) + '</span></div>';
  if (a101CekiNetKesinti > 0) kesintiHtml += '<div class="data-row"><span>Alışveriş Çeki Kesintisi</span><span>' + formatla(a101CekiNetKesinti) + '</span></div>';
  if (borcKesinti.ana > 0 || borcKesinti.avans > 0) kesintiHtml += '<div class="data-row"><span>Personel Borcu ' + getBorcTaksitBilgi() + '</span><span>' + formatla(borcKesinti.ana + borcKesinti.avans) + '</span></div>';
  kesintiHtml += '<div class="data-row"><span>Gelir Vergisi</span><span>' + formatla(farkGelirVergisi) + '</span></div>';
  kesintiHtml += '<div class="data-row"><span>Damga Vergisi</span><span>' + formatla(farkDamgaVergisi) + '</span></div>';
  kesintiHtml += '<div class="data-row total"><span>TOPLAM KESİNTİ</span><span>' + formatla(toplamKesinti) + '</span></div>';
  
  var kesintiEl = document.getElementById('kesintiDetay');
  if (kesintiEl) kesintiEl.innerHTML = kesintiHtml;
  
  var sgkEl = document.getElementById('matrahSgk');
  var gvEl = document.getElementById('matrahGv');
  var dvEl = document.getElementById('matrahDv');
  if (sgkEl) sgkEl.textContent = formatla(sskMatrah);
  if (gvEl) gvEl.textContent = formatla(gvMatrah);
  if (dvEl) dvEl.textContent = formatla(dvMatrah);
  
  if (typeof hesaplaKumulatif === 'function') hesaplaKumulatif(toplamBrut, farkGelirVergisi, gvMatrah);
  if (typeof kaydetAyarlar === 'function') kaydetAyarlar();
  if (typeof sekmeDegistir === 'function') sekmeDegistir(1);
  
  hesaplamaDevamEdiyor = false;
  }
  
  // Event Listeners
  document.addEventListener('DOMContentLoaded', function() {
    var saatlikEl = document.getElementById('saatlikUcret');
    if (saatlikEl) {
      saatlikEl.addEventListener('blur', formatInput.bind(null, saatlikEl));
      saatlikEl.addEventListener('focus', unformatInput.bind(null, saatlikEl));
      saatlikEl.addEventListener('input', saatUcretiHesapla);
    }
    
    ['yakacak', 'cocuk', 'a101Ceki', 'yillikIzinHarclik', 'besTutar', 'borcToplam'].forEach(id => {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('blur', formatInput.bind(null, el));
        el.addEventListener('focus', unformatInput.bind(null, el));
      }
    });
    
    var borcAyEl = document.getElementById('borcBaslangicAy');
    if (borcAyEl) borcAyEl.addEventListener('change', function() {});
    
    document.querySelectorAll('input[name="sendikaVar"]').forEach(r => r.addEventListener('change', sendikaToggle));
    document.querySelectorAll('input[name="besVar"]').forEach(r => r.addEventListener('change', besToggle));
    document.querySelectorAll('input[name="borcVar"]').forEach(r => r.addEventListener('change', borcToggle));
    
    ['mesaiHici', 'geceVardiya'].forEach(id => {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('blur', function() {
          var val = parseFloat(this.value.replace(',', '.')) || 0;
          this.value = val === 0 ? '' : val.toString().replace('.', ',');
        });
        el.addEventListener('focus', function() {
          this.value = this.value.replace(',', '.');
        });
      }
    });
    
    var mesaiHiciOranEl = document.getElementById('mesaiHiciOran');
    var mesaiHsonuOranEl = document.getElementById('mesaiHsonuOran');
    if (mesaiHiciOranEl) mesaiHiciOranEl.addEventListener('change', function() {
      if (typeof kaydetAyarlar === 'function') kaydetAyarlar();
    });
    if (mesaiHsonuOranEl) mesaiHsonuOranEl.addEventListener('change', function() {
      if (typeof kaydetAyarlar === 'function') kaydetAyarlar();
    });
    
    if (typeof ayarlariYukle === 'function') ayarlariYukle();
    saatUcretiHesapla();
    sendikaToggle();
    besToggle();
    borcToggle();
  });
  
  // Global fonksiyonlar
  window.hesapla = hesapla;
  window.saatUcretiHesapla = saatUcretiHesapla;
  window.besToggle = besToggle;
  window.sendikaToggle = sendikaToggle;
  window.borcToggle = borcToggle;
  window.personelBorcuHesapla = personelBorcuHesapla;
  window.getBorcTaksitBilgi = getBorcTaksitBilgi;
  window.formatInput = formatInput;
  window.unformatInput = unformatInput;
  window.getVal = getVal;
  window.formatla = formatla;
  window.formatPara = formatPara;
  window.parsePara = parsePara;
  window.manuelBrutGir = manuelBrutGir;
  window.aylikKontrol = aylikKontrol;