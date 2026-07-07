// ==========================================
// ANALIZ.JS - v64.32 - iOS Uyumluluk + Hata Yönetimi
// ==========================================

var KEY_YILLIK = window.KEY_YILLIK || 'maasYillik_v64';

function analizGuncelle() {
  // DÜZELTME 1: Nullish kaldırıldı
  var buAy = (typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth()) + 1;
  var yil = window.aktifYil || new Date().getFullYear();
  var key = yil + '-' + buAy;

  // DÜZELTME 5: localStorage güvenli parse
  var anaVeri = {};
  try {
    anaVeri = JSON.parse(localStorage.getItem(KEY_YILLIK) || '{}');
  } catch (e) {
    console.error('LocalStorage parse hatası:', e);
    anaVeri = {};
  }

  var buAyData = anaVeri[key] || {
    brut: 0, net: 0, mesaiHici: 0, gece: 0, mesaiHsonu: 0,
    yakacak: 0, cocuk: 0, a101: 0, yillikIzin: 0
  };

  var aylar = [];
  Object.keys(anaVeri).forEach(function(k) {
    if (k.indexOf(yil.toString()) === 0) {
      var d = anaVeri[k];
      if (d && d.brut > 0) {
        var kParca = k.split('-');
        var mAy = parseInt(kParca[1]) || 1;

        var yeniNesne = {
          brut: d.brut || 0,
          net: d.net || 0,
          mesaiHici: d.mesaiHici || 0,
          gece: d.gece || 0,
          mesaiHsonu: d.mesaiHsonu || 0,
          yakacak: d.yakacak || 0,
          cocuk: d.cocuk || 0,
          a101: d.a101 || 0,
          yillikIzin: d.yillikIzin || 0,
          ay: mAy
        };
        aylar.push(yeniNesne);
      }
    }
  });

  if (aylar.length === 0) {
    var elFark = document.getElementById('analizFark');
    var elBuAy = document.getElementById('analizBuAy');
    var elOrt = document.getElementById('analizOrtalama');
    if (elFark) elFark.textContent = 'Veri yok';
    if (elBuAy) elBuAy.textContent = formatTL(0);
    if (elOrt) elOrt.textContent = formatTL(0);
    grafikCizCanvas([]);
    return;
  }

  // Ortalamaların hesaplanması
  var tBrut = 0, tNet = 0, tMesai = 0, tGece = 0, tHsonu = 0;
  aylar.forEach(function(d) {
    tBrut += d.brut;
    tNet += d.net;
    tMesai += d.mesaiHici;
    tGece += d.gece;
    tHsonu += d.mesaiHsonu;
  });

  var ortBrut = tBrut / aylar.length;
  var ortNet = tNet / aylar.length;
  var ortMesai = tMesai / aylar.length;
  var ortGece = tGece / aylar.length;
  var ortHsonu = tHsonu / aylar.length;

  // En yüksek / en düşük
  var enYuksek = { brut: 0, ay: 0 };
  var enDusuk = { brut: Infinity, ay: 0 };
  var yilToplam = 0;

  aylar.forEach(function(d) {
    yilToplam += d.net;
    if (d.brut > enYuksek.brut) {
      enYuksek.brut = d.brut;
      enYuksek.ay = d.ay;
    }
    if (d.brut < enDusuk.brut) {
      enDusuk.brut = d.brut;
      enDusuk.ay = d.ay;
    }
  });

  var ayIsimleri = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  // DÜZELTME 4: getVal kullan, null kontrolü var
  var saatlik = getVal('saatlikUcret');
  var mesaiHiciOran = parseFloat(document.getElementById('mesaiHiciOran')?.value || 2.0);
  var mesaiHsonuOran = parseFloat(document.getElementById('mesaiHsonuOran')?.value || 2.0);

  var buAyMesaiGelir = ((buAyData.mesaiHici || 0) * saatlik * mesaiHiciOran) +
                       ((buAyData.mesaiHsonu || 0) * saatlik * mesaiHsonuOran) +
                       ((buAyData.gece || 0) * saatlik * 0.1);

  var ortMesaiGelir = (ortMesai * saatlik * mesaiHiciOran) +
                      (ortHsonu * saatlik * mesaiHsonuOran) +
                      (ortGece * saatlik * 0.1);

  var mesaiFark = buAyMesaiGelir - ortMesaiGelir;

  // DOM güncelle
  var elAnalizBuAy = document.getElementById('analizBuAy');
  var elAnalizOrt = document.getElementById('analizOrtalama');
  var elAnalizFark = document.getElementById('analizFark');

  if (elAnalizBuAy) elAnalizBuAy.textContent = formatTL(buAyData.brut);
  if (elAnalizOrt) elAnalizOrt.textContent = formatTL(ortBrut);
  if (elAnalizFark) {
    elAnalizFark.textContent = formatTL(buAyData.brut - ortBrut);
    elAnalizFark.style.color = buAyData.brut >= ortBrut? 'var(--basarili)' : 'var(--hata)';
  }

  var elHici = document.getElementById('analizMesaiHici');
  var elHiciOrt = document.getElementById('analizMesaiHiciOrt');
  var elGece = document.getElementById('analizGece');
  var elGeceOrt = document.getElementById('analizGeceOrt');
  var elHsonu = document.getElementById('analizHsonu');
  var elHsonuOrt = document.getElementById('analizHsonuOrt');
  var elMFark = document.getElementById('analizMesaiFark');

  if (elHici) elHici.textContent = (buAyData.mesaiHici || 0).toFixed(1) + ' saat';
  if (elHiciOrt) elHiciOrt.textContent = ortMesai.toFixed(1) + ' saat';
  if (elGece) elGece.textContent = (buAyData.gece || 0).toFixed(1) + ' saat';
  if (elGeceOrt) elGeceOrt.textContent = ortGece.toFixed(1) + ' saat';
  if (elHsonu) elHsonu.textContent = (buAyData.mesaiHsonu || 0).toFixed(1) + ' saat';
  if (elHsonuOrt) elHsonuOrt.textContent = ortHsonu.toFixed(1) + ' saat';
  if (elMFark) {
    elMFark.textContent = formatTL(mesaiFark);
    elMFark.style.color = mesaiFark >= 0? 'var(--basarili)' : 'var(--hata)';
  }

  var elBrut = document.getElementById('analizBrut');
  var elBrutOrt = document.getElementById('analizBrutOrt');
  var elNet = document.getElementById('analizNet');
  var elNetOrt = document.getElementById('analizNetOrt');
  var elMax = document.getElementById('analizEnYuksek');
  var elMin = document.getElementById('analizEnDusuk');
  var elYilTop = document.getElementById('analizYilToplam');

  if (elBrut) elBrut.textContent = formatTL(buAyData.brut);
  if (elBrutOrt) elBrutOrt.textContent = formatTL(ortBrut);
  if (elNet) elNet.textContent = formatTL(buAyData.net);
  if (elNetOrt) elNetOrt.textContent = formatTL(ortNet);
  if (elMax) elMax.textContent = ayIsimleri[enYuksek.ay] + ' - ' + formatTL(enYuksek.brut);
  if (elMin) elMin.textContent = ayIsimleri[enDusuk.ay] + ' - ' + formatTL(enDusuk.brut);
  if (elYilTop) elYilTop.textContent = formatTL(yilToplam);

  var tYakacak = 0, tCocuk = 0, tA101 = 0, tYillik = 0;
  aylar.forEach(function(d) {
    tYakacak += d.yakacak;
    tCocuk += d.cocuk;
    tA101 += d.a101;
    tYillik += d.yillikIzin;
  });

  var ortYakacak = tYakacak / aylar.length;
  var ortCocuk = tCocuk / aylar.length;
  var ortA101 = tA101 / aylar.length;
  var ortYillik = tYillik / aylar.length;

  var ekHTML = '';
  ekHTML += '<div class="data-row"><span>Bu Ay Yakacak</span><span>' + formatTL(buAyData.yakacak || 0) + '</span></div>';
  ekHTML += '<div class="data-row"><span>Ortalama Yakacak</span><span>' + formatTL(ortYakacak) + '</span></div>';
  ekHTML += '<div class="data-row"><span>Bu Ay Çocuk</span><span>' + formatTL(buAyData.cocuk || 0) + '</span></div>';
  ekHTML += '<div class="data-row"><span>Ortalama Çocuk</span><span>' + formatTL(ortCocuk) + '</span></div>';
  ekHTML += '<div class="data-row"><span>Bu Ay A101</span><span>' + formatTL(buAyData.a101 || 0) + '</span></div>';
  ekHTML += '<div class="data-row"><span>Ortalama A101</span><span>' + formatTL(ortA101) + '</span></div>';
  ekHTML += '<div class="data-row"><span>Bu Ay İzin Harçlığı</span><span>' + formatTL(buAyData.yillikIzin || 0) + '</span></div>';
  ekHTML += '<div class="data-row"><span>Ortalama İzin Harçlığı</span><span>' + formatTL(ortYillik) + '</span></div>';

  var elEkOdemeler = document.getElementById('analizEkOdemeler');
  if (elEkOdemeler) {
    elEkOdemeler.innerHTML = ekHTML;
  }

  // GRAFİK ÇİZ - PARLAK CANVAS
  grafikCizCanvas(aylar);
}

// DÜZELTME v64.32: Parlak ve net grafik
function grafikCizCanvas(aylar) {
  var canvas = document.getElementById('brutGrafik');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Tema renkleri
  var tema = document.documentElement.getAttribute('data-theme') || 'dark';
  var textColor = tema === 'dark'? '#f1f5f9' : '#0f172a';
  var gridColor = tema === 'dark'? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)';

  // 12 ayın hepsini göster
  var ayIsimleri = ['','Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var data = [];
  for(var i = 1; i <= 12; i++) {
    var ayData = aylar.find(a => a.ay === i);
    data.push(ayData? ayData.brut : 0);
  }

  var maxBrut = Math.max(...data, 1000);
  var barWidth = (w - 40) / 12;
  var chartHeight = h - 60;

  // Arka plan grid - parlak
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 2;
  for(var i = 0; i <= 4; i++) {
    var y = h - 40 - (i * chartHeight / 4);
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(w - 15, y);
    ctx.stroke();

    // Y ekseni etiket - büyük font
    ctx.fillStyle = textColor;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(((maxBrut * i / 4)/1000).toFixed(0) + 'K', 30, y + 4);
  }

  // DÜZELTME 3: i === aktifAy kontrolü - iki kere +1 yok
  var guncelAy = typeof window.aktifAy!== 'undefined'? window.aktifAy : new Date().getMonth();

  // Çubukları çiz - gradient + parlak
  for(var i = 0; i < 12; i++) {
    var x = 40 + i * barWidth;
    var barHeight = (data[i] / maxBrut) * chartHeight;
    var y = h - 40 - barHeight;
    var isCurrentMonth = i === guncelAy;

    // Gradient çubuk
    var gradient = ctx.createLinearGradient(0, y, 0, h - 40);
    if (isCurrentMonth) {
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#ec4899');
    } else {
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#059669');
    }

    ctx.fillStyle = gradient;
    ctx.shadowColor = isCurrentMonth? 'rgba(139, 92, 246, 0.6)' : 'rgba(16, 185, 129, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillRect(x + 3, y, barWidth - 6, barHeight);
    ctx.shadowBlur = 0;

    // Çubuk kenarlık
    ctx.strokeStyle = isCurrentMonth? '#a78bfa' : '#34d399';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y, barWidth - 6, barHeight);

    // Ay yazısı - büyük
    ctx.fillStyle = textColor;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ayIsimleri[i + 1], x + barWidth/2, h - 20);

    // Tutar - üstte
    if(data[i] > 0) {
      ctx.fillStyle = isCurrentMonth? '#c084fc' : '#6ee7b7';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText((data[i]/1000).toFixed(0) + 'K', x + barWidth/2, y - 5);
    }
  }

  // Başlık
  ctx.fillStyle = textColor;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Aylık Brüt ₺', 40, 18);
}

function formatTL(tutar) {
  if (typeof tutar!== 'number') tutar = 0;
  return tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

// Global export
window.analizGuncelle = analizGuncelle;