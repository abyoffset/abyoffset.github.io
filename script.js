<script>
    let temaAktif = localStorage.getItem('ceklok_theme') || 'light';
    document.documentElement.setAttribute('data-theme', temaAktif);
    document.getElementById('theme-toggle-btn').innerText = (temaAktif === 'dark') ? '🌙' : '🌞';

    function updateJamDigital() {
        const sekarang = new Date();
        const jam = String(sekarang.getHours()).padStart(2, '0');
        const menit = String(sekarang.getMinutes()).padStart(2, '0');
        const detik = String(sekarang.getSeconds()).padStart(2, '0');
        document.getElementById('live-clock').innerText = `${jam}:${menit}:${detik}`;
        
        const daftarHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const daftarBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        const formatTgl = `${daftarHari[sekarang.getDay()]}, ${sekarang.getDate()} ${daftarBulan[sekarang.getMonth()]} ${sekarang.getFullYear()}`;
        document.getElementById('live-date').innerText = formatTgl;
        document.getElementById('nota-tanggal-cetak').innerText = formatTgl;
    }
    updateJamDigital();
    setInterval(updateJamDigital, 1000);

    const templateHari = () => ({
        "minggu": { "jam_masuk": "0", "jam_pulang_reguler": "0", "jam_pulang_lembur": "0", "is_pulang": false },
        "senin": { "jam_masuk": "0", "jam_pulang_reguler": "0", "jam_pulang_lembur": "0", "is_pulang": false },
        "selasa": { "jam_masuk": "0", "jam_pulang_reguler": "0", "jam_pulang_lembur": "0", "is_pulang": false },
        "rabu": { "jam_masuk": "0", "jam_pulang_reguler": "0", "jam_pulang_lembur": "0", "is_pulang": false },
        "kamis": { "jam_masuk": "0", "jam_pulang_reguler": "0", "jam_pulang_lembur": "0", "is_pulang": false },
        "jumat": { "jam_masuk": "0", "jam_pulang_reguler": "0", "jam_pulang_lembur": "0", "is_pulang": false },
        "sabtu": { "jam_masuk": "0", "jam_pulang_reguler": "0", "jam_pulang_lembur": "0", "is_pulang": false }
    });

    const listHari = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const namaHariIndo = { 'minggu': 'Min', 'senin': 'Sen', 'selasa': 'Sel', 'rabu': 'Rab', 'kamis': 'Kam', 'jumat': "Jum", 'sabtu': 'Sab' };
    
    let databaseKaryawan = JSON.parse(localStorage.getItem('multiCeklok_DB')) || [];
    let karyawanAktifNama = localStorage.getItem('multiCeklok_AktifNama') || "";
    let masterJamReguler = Number(localStorage.getItem('dataLemburHP_MasterJamReguler')) || 8;

    document.getElementById('master-jam-reguler-input').value = masterJamReguler;

    function tampilAlertKustom(pesan) {
        document.getElementById('alert-custom-message').innerHTML = pesan;
        document.getElementById('modal-alert-custom').style.display = 'flex';
    }
    function tutupAlertKustom() { document.getElementById('modal-alert-custom').style.display = 'none'; }

    function toggleTemaKerja() {
        temaAktif = (temaAktif === 'light') ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', temaAktif);
        localStorage.setItem('ceklok_theme', temaAktif);
        document.getElementById('theme-toggle-btn').innerText = (temaAktif === 'dark') ? '🌙' : '🌞';
        renderTabelKaryawan();
    }

    function normalisirNominal(val) {
        let num = Number(val);
        if (num > 0 && num < 1000) return num * 1000;
        return num;
    }

    function bukaModalKasbon() { 
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        if(!krw) {
            tampilAlertKustom("⚠️ Silakan import file Excel data karyawan terlebih dahulu!");
            return;
        }
        document.getElementById('judul-modal-kasbon').innerText = `💸 Kasbon & Bonus: ${krw.nama.toUpperCase()}`;
        document.getElementById('master-kasbon-input').value = krw.kasbon || '';
        document.getElementById('master-bonus-input').value = krw.bonus || '';
        document.getElementById('modal-pengaturan-kasbon').style.display = 'flex'; 
    }
    function tutupModalKasbon() { document.getElementById('modal-pengaturan-kasbon').style.display = 'none'; }

    function bukaModalKaryawanBaru(listNama) {
        let htmlList = '';
        listNama.forEach((nama, index) => {
            htmlList += `<div class="badge-karyawan-baru">👤 ${index + 1}. ${nama.toUpperCase()}</div>`;
        });
        document.getElementById('list-nama-karyawan-baru').innerHTML = htmlList;
        document.getElementById('modal-karyawan-baru').style.display = 'flex';
    }
    function tutupModalKaryawanBaru() { document.getElementById('modal-karyawan-baru').style.display = 'none'; }

    function togglePengaturanMenu() {
        const panel = document.getElementById('panel-pengaturan');
        const btnConfig = document.getElementById('btn-config');
        
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
            btnConfig.innerText = "⚙️ Menu";
            btnConfig.classList.remove('kembali-mode');
        } else {
            panel.style.display = 'block';
            btnConfig.innerText = "⬅️ Kembali";
            btnConfig.classList.add('kembali-mode');
        }
    }

    function hitungTotalJamKerjaNyata(masuk, pulang) {
        if (masuk === "0" || pulang === "0" || !masuk || !pulang) return 0;
        const [h1, m1] = masuk.split(':').map(Number);
        const [h2, m2] = pulang.split(':').map(Number);
        let selisihMenit = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (selisihMenit < 0) selisihMenit += 24 * 60; 
        return parseFloat((selisihMenit / 60).toFixed(2));
    }

    function bukaModalJamRegulerMaster() { 
        document.getElementById('master-jam-reguler-input').value = masterJamReguler;
        document.getElementById('modal-jam-reguler-master').style.display = 'flex'; 
    }
    function tutupModalJamRegulerMaster() { document.getElementById('modal-jam-reguler-master').style.display = 'none'; }
    
    function simpanMasterJamReguler() {
        masterJamReguler = Number(document.getElementById('master-jam-reguler-input').value) || 8;
        localStorage.setItem('dataLemburHP_MasterJamReguler', masterJamReguler);
        tutupModalJamRegulerMaster();
        renderTabelKaryawan();
        tampilAlertKustom(`⏱️ Sukses! Jam kerja reguler diubah menjadi <b>${masterJamReguler} Jam</b>.`);
    }

    function mocoFileExcelMesinFinger(inputElement) {
        const file = inputElement.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                let tempDB = [];
                let tampunganKaryawanBaru = []; 
                const namaHariMesinMap = { 'sn': 'senin', 'sl': 'selasa', 'ra': 'rabu', 'ka': 'kamis', 'ju': 'jumat', 'sa': 'sabtu', 'mg': 'minggu', 'mi': 'minggu' };

                workbook.SheetNames.forEach(sheetName => {
                    if (sheetName === 'Rekap' || sheetName === 'Log') return;

                    const worksheet = workbook.Sheets[sheetName];
                    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    for (let r = 0; r < Math.min(rawRows.length, 4); r++) {
                        let row = rawRows[r];
                        if (!row) continue;

                        for (let c = 0; c < row.length; c++) {
                            let cellVal = String(row[c] || '').trim();
                            
                            if (cellVal.toLowerCase() === "nama") {
                                let namaKaryawan = String(row[c + 1] || '').trim();
                                if (!namaKaryawan) continue;

                                let namaDepartemen = "Umum";
                                for(let checkC = 0; checkC < row.length; checkC++) {
                                    let checkVal = String(row[checkC] || '').trim().toLowerCase();
                                    if(checkVal === "departemen") {
                                        namaDepartemen = String(row[checkC + 1] || 'Umum').trim();
                                        break;
                                    }
                                }

                                let krwExist = databaseKaryawan.find(x => x.nama === namaKaryawan);
                                
                                if (!krwExist) {
                                    tampunganKaryawanBaru.push(`${namaKaryawan} (${namaDepartemen})`); 
                                    krwExist = { 
                                        nama: namaKaryawan,
                                        departemen: namaDepartemen,
                                        kasbon: 0, 
                                        bonus: 0, 
                                        gajiPokok: 0, 
                                        tarifLembur: 0, 
                                        gajiMinggu: 0, 
                                        tarifLemburMinggu: 0,
                                        infoKerja: templateHari() 
                                    };
                                } else {
                                    krwExist.departemen = namaDepartemen;
                                    krwExist.infoKerja = templateHari();
                                }

                                if (!tempDB.find(x => x.nama === namaKaryawan)) {
                                    tempDB.push(krwExist);
                                }

                                for (let subR = 4; subR < rawRows.length; subR++) {
                                    let subRow = rawRows[subR];
                                    if (!subRow) continue;

                                    let cellHariTgl = String(subRow[c - 7] || subRow[c - 8] || subRow[c] || '').trim();
                                    let matchHari = cellHariTgl.match(/(\d+)\s+([A-Za-z]+)/);
                                    
                                    if (matchHari) {
                                        let kodeHari = matchHari[2].toLowerCase();
                                        let keyHariIndo = namaHariMesinMap[kodeHari];

                                        if (keyHariIndo) {
                                            let jamMasukRaw = "";
                                            let jamPulangRaw = "";

                                            for (let offset = 0; offset <= 14; offset++) {
                                                let subCell = String(subRow[c + offset] || '').trim().replace(/\n/g, ' ');
                                                let matchJam = subCell.match(/([0-1][0-9]|2[0-3]):[0-5][0-9]/g);
                                                if (matchJam) {
                                                    if (!jamMasukRaw) jamMasukRaw = matchJam[0];
                                                    jamPulangRaw = matchJam[matchJam.length - 1];
                                                }
                                            }

                                            if (jamMasukRaw) {
                                                krwExist.infoKerja[keyHariIndo].jam_masuk = jamMasukRaw;
                                                if (jamPulangRaw && jamPulangRaw !== jamMasukRaw) {
                                                    krwExist.infoKerja[keyHariIndo].is_pulang = true;
                                                    const totalJam = hitungTotalJamKerjaNyata(jamMasukRaw, jamPulangRaw);
                                                    
                                                    if (totalJam <= masterJamReguler) {
                                                        krwExist.infoKerja[keyHariIndo].jam_pulang_reguler = jamPulangRaw;
                                                        krwExist.infoKerja[keyHariIndo].jam_pulang_lembur = "0";
                                                    } else {
                                                        const [hM, mM] = jamMasukRaw.split(':').map(Number);
                                                        let jReg = hM + masterJamReguler;
                                                        while (jReg >= 24) jReg -= 24;
                                                        
                                                        krwExist.infoKerja[keyHariIndo].jam_pulang_reguler = `${String(jReg).padStart(2, '0')}:${String(mM).padStart(2, '0')}`;
                                                        krwExist.infoKerja[keyHariIndo].jam_pulang_lembur = jamPulangRaw;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                if (tempDB.length > 0) {
                    databaseKaryawan = tempDB;
                    if (!karyawanAktifNama || !databaseKaryawan.find(x => x.nama === karyawanAktifNama)) {
                        karyawanAktifNama = databaseKaryawan[0].nama;
                    }
                    
                    localStorage.setItem('multiCeklok_DB', JSON.stringify(databaseKaryawan));
                    localStorage.setItem('multiCeklok_AktifNama', karyawanAktifNama);
                    
                    updateDropdownKaryawan();
                    renderTabelKaryawan();

                    if (tampunganKaryawanBaru.length > 0) {
                        bukaModalKaryawanBaru(tampunganKaryawanBaru);
                    } else {
                        tampilAlertKustom("✅ SUKSES! Jam Absen Berhasil Dibaca. Semua tarif gaji karyawan lama tetap aman.");
                    }
                } else {
                    tampilAlertKustom("⚠️ Gagal membaca format jam, pastikan berkas yang diunggah berisi sheet laporan riwayat jam kerja asli dari mesin.");
                }
            } catch (err) {
                tampilAlertKustom("❌ Gagal membaca berkas Excel: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
        inputElement.value = '';
    }

    function updateDropdownKaryawan() {
        const select = document.getElementById('select-karyawan-aktif');
        if (databaseKaryawan.length === 0) {
            select.innerHTML = '<option value="">-- Belum Ada Data / Import Excel --</option>';
            return;
        }
        let htmlOptions = '';
        databaseKaryawan.forEach(k => {
            let selected = (k.nama === karyawanAktifNama) ? 'selected' : '';
            let deptLabel = k.departemen ? ` [${k.departemen}]` : '';
            htmlOptions += `<option value="${k.nama}" ${selected}>👤 ${k.nama}${deptLabel}</option>`;
        });
        select.innerHTML = htmlOptions;
    }

    function gantiKaryawanAktif() {
        karyawanAktifNama = document.getElementById('select-karyawan-aktif').value;
        localStorage.setItem('multiCeklok_AktifNama', karyawanAktifNama);
        renderTabelKaryawan();
    }

    function renderTabelKaryawan() {
        if (databaseKaryawan.length === 0) {
            document.getElementById('display-nama-karyawan').innerText = "Belum Ada Data";
            return;
        }
        
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        if (!krw) krw = databaseKaryawan[0];

        let deptLabel = krw.departemen ? ` [${krw.departemen.toUpperCase()}]` : '';
        document.getElementById('display-nama-karyawan').innerText = `👤 ${krw.nama.toUpperCase()}${deptLabel}`;

        let infoBagian = krw.departemen ? ` - BAGIAN: ${krw.departemen.toUpperCase()}` : '';
        document.getElementById('label-total-user').innerText = `TOTAL PENDAPATAN BERSIH (${krw.nama.toUpperCase()}${infoBagian})`;

        document.getElementById('nota-nama').innerText = krw.nama.toUpperCase();
        document.getElementById('nota-dept').innerText = krw.departemen ? krw.departemen.toUpperCase() : 'UMUM';

        let htmlRows = '';
        let htmlNotaRows = '';
        let totalRegulerGaji = 0;
        let totalLemburGaji = 0;

        let kGajiPokok = krw.gajiPokok || 0;
        let kTarifLembur = krw.tarifLembur || 0;
        let kGajiMinggu = krw.gajiMinggu || 0;
        let kTarifLemburMinggu = krw.tarifLemburMinggu || 0;

        listHari.forEach(hari => {
            const d = krw.infoKerja[hari];
            const belumPulang = !d.is_pulang;
            const isLibur = d.jam_masuk === "0" || d.jam_masuk === "" || (belumPulang && d.jam_pulang_lembur === "0");
            
            let tarifGajiHariIni = (hari === 'minggu') ? kGajiMinggu : kGajiPokok;
            let tarifLemburHariIni = (hari === 'minggu') ? kTarifLemburMinggu : kTarifLembur;

            let gajiHariIni = 0;
            let durasiLembur = 0;

            if (!isLibur) {
                if (d.jam_pulang_lembur !== "0" && d.jam_pulang_lembur !== "") {
                    gajiHariIni = tarifGajiHariIni;
                    durasiLembur = hitungTotalJamKerjaNyata(d.jam_pulang_reguler, d.jam_pulang_lembur);
                } else {
                    const jamKerjaRegulerNyata = hitungTotalJamKerjaNyata(d.jam_masuk, d.jam_pulang_reguler);
                    gajiHariIni = (jamKerjaRegulerNyata >= masterJamReguler) ? tarifGajiHariIni : Math.round((jamKerjaRegulerNyata / masterJamReguler) * tarifGajiHariIni);
                }
            }

            const gajiLembur = Math.round(durasiLembur * tarifLemburHariIni);
            totalRegulerGaji += gajiHariIni;
            totalLemburGaji += gajiLembur;

            // STRUKTUR DATA UTAMA: Kolom P.Lbr dipindah setelah Gaji Pokok
            htmlRows += `<tr>
                <td class="${hari === 'minggu' ? 'hari hari-minggu' : 'hari'}">${namaHariIndo[hari]}</td>
                <td>${d.jam_masuk === "0" ? '0' : d.jam_masuk}</td>
                <td>${belumPulang || d.jam_masuk === "0" ? '0' : d.jam_pulang_reguler}</td>
                <td>${gajiHariIni === 0 ? '<span class="nol">0</span>' : '<span class="nilai-uang">' + gajiHariIni.toLocaleString('id-ID') + '</span>'}</td>
                <td>${belumPulang || d.jam_pulang_lembur === "0" ? '0' : d.jam_pulang_lembur}</td>
                <td>${durasiLembur > 0 ? '<strong>' + durasiLembur + '</strong>' : '0'}</td>
                <td>${gajiLembur === 0 ? '<span class="nol">0</span>' : '<span class="nilai-uang">' + gajiLembur.toLocaleString('id-ID') + '</span>'}</td>
            </tr>`;

            let nJamMasuk = d.jam_masuk === "0" ? '-' : d.jam_masuk;
            let nJamPulangReg = belumPulang || d.jam_masuk === "0" ? '-' : d.jam_pulang_reguler;
            let nJamPulangLbr = belumPulang || d.jam_pulang_lembur === "0" ? '-' : d.jam_pulang_lembur;

            // STRUKTUR DATA NOTA SLIP: Kolom P.Lbr disamakan, berada setelah Gaji Pokok
            htmlNotaRows += `<tr>
                <td style="font-weight:bold; ${hari==='minggu'?'color:#ef4444;':''}">${namaHariIndo[hari]}</td>
                <td>${nJamMasuk}</td>
                <td>${nJamPulangReg}</td>
                <td>${gajiHariIni === 0 ? '0' : gajiHariIni.toLocaleString('id-ID')}</td>
                <td>${nJamPulangLbr}</td>
                <td>${durasiLembur > 0 ? durasiLembur : '0'}</td>
                <td>${gajiLembur === 0 ? '0' : gajiLembur.toLocaleString('id-ID')}</td>
            </tr>`;
        });

        let grandTotalBersih = (totalRegulerGaji + totalLemburGaji + (krw.bonus || 0)) - (krw.kasbon || 0);
        if (grandTotalBersih < 0) grandTotalBersih = 0;

        // Penyamaan posisi total di baris paling bawah tabel
        htmlRows += `<tr class="total-row"><td colspan="3">TOTAL</td><td>${totalRegulerGaji.toLocaleString('id-ID')}</td><td></td><td></td><td>${totalLemburGaji.toLocaleString('id-ID')}</td></tr>`;
        
        htmlNotaRows += `<tr style="font-weight:bold; background-color:#f8fafc;"><td colspan="3" style="text-align:left; padding-left:4px;">TOTAL</td><td>${totalRegulerGaji.toLocaleString('id-ID')}</td><td></td><td></td><td>${totalLemburGaji.toLocaleString('id-ID')}</td></tr>`;

        document.getElementById('tabel-body').innerHTML = htmlRows;
        document.getElementById('nota-tabel-body').innerHTML = htmlNotaRows;
        
        document.getElementById('text-tambahan-bonus').innerText = krw.bonus > 0 ? '+ Rp ' + krw.bonus.toLocaleString('id-ID') : 'Rp 0';
        document.getElementById('text-potongan-kasbon').innerText = krw.kasbon > 0 ? '- Rp ' + krw.kasbon.toLocaleString('id-ID') : 'Rp 0';
        document.getElementById('grand-total').innerText = 'Rp ' + grandTotalBersih.toLocaleString('id-ID');

        document.getElementById('nota-bonus').innerText = krw.bonus > 0 ? 'Rp ' + krw.bonus.toLocaleString('id-ID') : 'Rp 0';
        document.getElementById('nota-kasbon').innerText = krw.kasbon > 0 ? 'Rp ' + krw.kasbon.toLocaleString('id-ID') : 'Rp 0';
        document.getElementById('nota-grand-total').innerText = 'Rp ' + grandTotalBersih.toLocaleString('id-ID');
    }

    function bukaModalJamManual() { 
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        if(!krw) {
            tampilAlertKustom("⚠️ Silakan import file Excel data karyawan terlebih dahulu!");
            return;
        }
        document.getElementById('modal-jam-manual').style.display = 'flex'; 
        loadJamHariPilihan(); 
    }
    function tutupModalJamManual() { document.getElementById('modal-jam-manual').style.display = 'none'; }
    
    function loadJamHariPilihan() {
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        const hari = document.getElementById('select-hari-edit').value;
        if(krw) {
            document.getElementById('modal-jam-masuk').value = krw.infoKerja[hari].jam_masuk === "0" ? "" : krw.infoKerja[hari].jam_masuk;
            let jamAkhir = krw.infoKerja[hari].jam_pulang_lembur !== "0" ? krw.infoKerja[hari].jam_pulang_lembur : krw.infoKerja[hari].jam_pulang_reguler;
            document.getElementById('modal-jam-plem').value = jamAkhir === "0" ? "" : jamAkhir;
        }
    }
    
    function simpanJamManualDariModal() {
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        const hari = document.getElementById('select-hari-edit').value;
        
        if(krw) {
            let jamMasukRaw = document.getElementById('modal-jam-masuk').value.trim();
            let jamPulangRaw = document.getElementById('modal-jam-plem').value.trim();

            if (!jamMasukRaw || jamMasukRaw === "0" || !jamPulangRaw || jamPulangRaw === "0") {
                krw.infoKerja[hari].jam_masuk = "0";
                krw.infoKerja[hari].jam_pulang_reguler = "0";
                krw.infoKerja[hari].jam_pulang_lembur = "0";
                krw.infoKerja[hari].is_pulang = false;
            } else {
                krw.infoKerja[hari].jam_masuk = jamMasukRaw;
                krw.infoKerja[hari].is_pulang = true;
                
                const totalJam = hitungTotalJamKerjaNyata(jamMasukRaw, jamPulangRaw);
                
                if (totalJam <= masterJamReguler) {
                    krw.infoKerja[hari].jam_pulang_reguler = jamPulangRaw;
                    krw.infoKerja[hari].jam_pulang_lembur = "0";
                } else {
                    const [hM, mM] = jamMasukRaw.split(':').map(Number);
                    let jReg = hM + masterJamReguler;
                    while (jReg >= 24) jReg -= 24;
                    
                    krw.infoKerja[hari].jam_pulang_reguler = `${String(jReg).padStart(2, '0')}:${String(mM).padStart(2, '0')}`;
                    krw.infoKerja[hari].jam_pulang_lembur = jamPulangRaw;
                }
            }

            localStorage.setItem('multiCeklok_DB', JSON.stringify(databaseKaryawan));
            renderTabelKaryawan();
            tutupModalJamManual();
            tampilAlertKustom(`✅ Jam manual hari <b>${hari.toUpperCase()}</b> berhasil diperbarui otomatis!`);
        }
    }

    function bukaModalTarif() { 
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        if(!krw) {
            tampilAlertKustom("⚠️ Silakan import file Excel data karyawan terlebih dahulu!");
            return;
        }
        document.getElementById('judul-modal-tarif').innerText = `💰 Tarif Gaji: ${krw.nama}`;
        document.getElementById('master-gaji').value = krw.gajiPokok || '';
        document.getElementById('master-tarif').value = krw.tarifLembur || '';
        document.getElementById('minggu-gaji').value = krw.gajiMinggu || '';
        document.getElementById('minggu-tarif').value = krw.tarifLemburMinggu || '';
        document.getElementById('modal-pengaturan-tarif').style.display = 'flex'; 
    }
    function tutupModalTarif() { document.getElementById('modal-pengaturan-tarif').style.display = 'none'; }
    
    function simpanTarifGajiDariModal() {
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        if(krw) {
            krw.gajiPokok = normalisirNominal(document.getElementById('master-gaji').value);
            krw.tarifLembur = normalisirNominal(document.getElementById('master-tarif').value);
            krw.gajiMinggu = normalisirNominal(document.getElementById('minggu-gaji').value);
            krw.tarifLemburMinggu = normalisirNominal(document.getElementById('minggu-tarif').value);
            
            localStorage.setItem('multiCeklok_DB', JSON.stringify(databaseKaryawan));
            tutupModalTarif(); 
            renderTabelKaryawan();
            tampilAlertKustom(`💰 Sukses! Tarif khusus untuk <b>${krw.nama}</b> berhasil disimpan.`);
        }
    }
    
    function simpanKasbonDanBonus() {
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        if(krw) {
            krw.kasbon = normalisirNominal(document.getElementById('master-kasbon-input').value);
            krw.bonus = normalisirNominal(document.getElementById('master-bonus-input').value);
            
            localStorage.setItem('multiCeklok_DB', JSON.stringify(databaseKaryawan));
            renderTabelKaryawan();
            tutupModalKasbon();
            tampilAlertKustom(`💸 Sukses! Kasbon & Bonus untuk <b>${krw.nama}</b> berhasil diperbarui.`);
        }
    }

    function bukaModalKonfirmasiReset() { document.getElementById('modal-konfirmasi-reset').style.display = 'flex'; }
    function tutupModalKonfirmasiReset() { document.getElementById('modal-konfirmasi-reset').style.display = 'none'; }

    function eksekusiResetDataKerja() {
        localStorage.removeItem('multiCeklok_DB');
        localStorage.removeItem('multiCeklok_AktifNama');
        databaseKaryawan = [];
        karyawanAktifNama = "";
        
        updateDropdownKaryawan();
        document.getElementById('tabel-body').innerHTML = '';
        document.getElementById('text-tambahan-bonus').innerText = 'Rp 0';
        document.getElementById('text-potongan-kasbon').innerText = 'Rp 0';
        document.getElementById('grand-total').innerText = 'Rp 0';
        document.getElementById('label-total-user').innerText = 'TOTAL PENDAPATAN BERSIH';
        document.getElementById('display-nama-karyawan').innerText = "Belum Ada Data";
        
        tutupModalKonfirmasiReset();
        
        const panel = document.getElementById('panel-pengaturan');
        panel.style.display = 'none';
        const btnConfig = document.getElementById('btn-config');
        btnConfig.innerText = "⚙️ Menu";
        btnConfig.classList.remove('kembali-mode');
        
        tampilAlertKustom("🔄 Sukses! Semua data karyawan berhasil direset.");
    }

    function ambilScreenshotLaporan() {
        let krw = databaseKaryawan.find(x => x.nama === karyawanAktifNama);
        if(!krw) {
            tampilAlertKustom("⚠️ Belum ada data karyawan yang bisa dicetak!");
            return;
        }
        document.getElementById('panel-pengaturan').style.display = 'none';
        const btnConfig = document.getElementById('btn-config');
        btnConfig.innerText = "⚙️ Menu";
        btnConfig.classList.remove('kembali-mode');

        document.getElementById('modal-nota-slip').style.display = 'flex';
    }

    function tutupModalNotaSlip() {
        document.getElementById('modal-nota-slip').style.display = 'none';
    }

    function eksekusiPotretNota() {
        const areaNota = document.getElementById('area-foto-nota');
        
        html2canvas(areaNota, { scale: 2, useCORS: true }).then(canvas => {
            const a = document.createElement('a');
            a.download = `Slip_Gaji_${karyawanAktifNama || 'Karyawan'}.png`;
            a.href = canvas.toDataURL('image/png'); 
            a.click();
            
            tutupModalNotaSlip();
        });
    }

    updateDropdownKaryawan();
    renderTabelKaryawan();