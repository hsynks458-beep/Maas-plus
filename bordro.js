// ==========================================
// BORDRO.JS - v64.3 - Font + Uyumluluk + Şık Modal
// ==========================================

function bordroIndir() {
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    sikAlert('PDF kütüphanesi yüklenemedi.\n\nİnternet bağlantınızı kontrol edin.', 'Hata');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  var aktifYil = window.aktifYil || new Date().getFullYear();
  var aktifAy = typeof window.aktifAy !== 'undefined' ? window.aktifAy : new Date().getMonth();
  var aylar = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  doc.text('MAAS BORDROSU v64.3', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text(aylar[aktifAy] + ' ' + aktifYil + ' - ' + new Date().toLocaleDateString('tr-TR'), 105, 22, { align: 'center' });
  doc.line(10, 25, 200, 25);
  
  var y = 35;
  var sayfaNo = 1;
  
  function sayfaKontrol() {
    if (y > 270) {
      doc.addPage();
      doc.setFont('helvetica', 'normal');
      sayfaNo++;
      y = 20;
      doc.setFontSize(8);
      doc.text('Sayfa ' + sayfaNo, 190, 285, { align: 'right' });
    }
  }
  
  doc.setFontSize(12);
  doc.text('KAZANCLAR:', 10, y);
  y += 7;
  doc.setFontSize(9);
  
  var kazancEl = document.getElementById('kazancDetay');
  if (kazancEl) {
    var kazancSatirlar = kazancEl.querySelectorAll('.data-row');
    kazancSatirlar.forEach(function(satir) {
      var spanlar = satir.querySelectorAll('span');
      if (spanlar.length >= 2) {
        sayfaKontrol();
        var metin = spanlar[0].textContent.replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's').replace(/İ/g, 'I');
        doc.text(metin, 15, y);
        doc.text(spanlar[1].textContent, 190, y, { align: 'right' });
        y += 6;
      }
    });
  }
  
  y += 5;
  sayfaKontrol();
  doc.setFontSize(12);
  doc.text('KESINTILER:', 10, y);
  y += 7;
  doc.setFontSize(9);
  
  var kesintiEl = document.getElementById('kesintiDetay');
  if (kesintiEl) {
    var kesintiSatirlar = kesintiEl.querySelectorAll('.data-row');
    kesintiSatirlar.forEach(function(satir) {
      var spanlar = satir.querySelectorAll('span');
      if (spanlar.length >= 2) {
        sayfaKontrol();
        var metin = spanlar[0].textContent.replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's').replace(/İ/g, 'I');
        doc.text(metin, 15, y);
        doc.text(spanlar[1].textContent, 190, y, { align: 'right' });
        y += 6;
      }
    });
  }
  
  y += 5;
  sayfaKontrol();
  doc.line(10, y, 200, y);
  y += 7;
  
  sayfaKontrol();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NET ODENECEK:', 10, y);
  var netEl = document.getElementById('netOdenecek');
  doc.text(netEl ? netEl.textContent : '0,00 ₺', 190, y, { align: 'right' });
  y += 8;
  
  sayfaKontrol();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Avans:', 10, y);
  var avansEl = document.getElementById('avansGoster');
  doc.text(avansEl ? avansEl.textContent : '0,00 ₺', 190, y, { align: 'right' });
  y += 6;
  
  sayfaKontrol();
  doc.setFont('helvetica', 'bold');
  doc.text('Ay Sonu:', 10, y);
  var aySonuEl = document.getElementById('aySonu');
  doc.text(aySonuEl ? aySonuEl.textContent : '0,00 ₺', 190, y, { align: 'right' });
  
  y += 10;
  sayfaKontrol();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  var dilimEl = document.getElementById('vergiDilim');
  var dilimText = dilimEl ? dilimEl.textContent : 'Bilinmiyor';
  doc.text('Bulundugun Vergi Dilimi: ' + dilimText, 10, y);
  
  doc.setFontSize(8);
  doc.text('Sayfa 1/' + sayfaNo, 190, 285, { align: 'right' });
  
  doc.save('Bordro_v64.3_' + aktifYil + '_' + (aktifAy + 1) + '.pdf');
  
  // Başarılı uyarısı
  sikAlert('Bordro PDF başarıyla oluşturuldu.\n\nDosya indirilenler klasörüne kaydedildi.', 'Başarılı');
}

// Global export
window.bordroIndir = bordroIndir;