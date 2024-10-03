let JSONdata = null;
let rahamaara = 50;
let panos = 1;
let voitto = 0;
let panosTeksti;
let voittoTeksti;
let rahamaaraTeksti;
let lock1 = false;
let lock2 = false;
let lock3 = false;
let lock4 = false;
let isPlaying = false;

const voitot = {
    cherry: [3, 6, 9, 12, 15],
    pear: [4, 8, 12, 16, 20],
    melon: [5, 10, 15, 20, 25],
    apple: [6, 12, 18, 24, 30],
    number7: [10, 20, 30, 40, 50],
    number7x3: [5, 10, 15, 20, 25]
};

window.addEventListener('load', function () {

    document.getElementById('peliohje').textContent = "Aseta panos ja paina 'Pelaa' -nappia!"; // Peliohjeet alussa
    peliohje.style.color = "yellow";
    peliohje.style.fontSize = "20px";
    peliohje.style.marginBottom = "20px";
    panosTeksti = document.getElementById('panos');
    rahamaaraTeksti = document.getElementById('raha');
    voittoTeksti = document.getElementById('voittoTeksti');

    panosTeksti.textContent = `Panos: ${panos}€`;
    rahamaaraTeksti.textContent = `Rahaa: ${rahamaara}€`;

    loadData();


    // Klikkaustapahtumat
    document.getElementById('asetaPanos').addEventListener('click', panoksenValinta);
    document.getElementById('pelaa').addEventListener('click', pelaaPeli);
    document.getElementById('lock1').addEventListener('click', () => lukitseSlotti(1));
    document.getElementById('lock2').addEventListener('click', () => lukitseSlotti(2));
    document.getElementById('lock3').addEventListener('click', () => lukitseSlotti(3));
    document.getElementById('lock4').addEventListener('click', () => lukitseSlotti(4));
});

function loadData() {                                                                           // Lataa JSON-tiedosto
    let ajax = new XMLHttpRequest();                                                            // Luo uusi XMLHttpRequest-olio
    ajax.onload = function () {                                                                 // Kun tiedosto on ladattu
        JSONdata = JSON.parse(this.responseText);                                               // Parsi JSON-tiedosto
        console.log(JSONdata);                                                                  // Tulosta JSON-tiedoston sisältö konsoliin
        getContent();                                                                           // Hae JSON-tiedoston sisältö
    }
    ajax.open('GET', 'settings.json', true);                                                    // Avaa tiedosto
    ajax.send();                                                                                // Lähetä pyyntö
}

function panoksenValinta() {
    if (panos < 5) {                                                                            // Panos voi olla maksimissaan 5€
        panos++;
    } else {
        panos = 1;
    }
    panosTeksti.textContent = `Panos: ${panos}€`;
}

function otaRahaa() {

    voittoTeksti = document.getElementById('voittoTeksti');                                     // Hae voittoilmoitus-elementti

    if (!lock1 && !lock2 && !lock3 && !lock4) {                                                 // Jos kaikki slotit ovat lukitsemattomia
        if (rahamaara >= panos) {                                                               // Jos rahaa on tarpeeksi pelaamiseen
            rahamaara -= panos;                                                                 // Vähennetään rahaa panoksen verran
            rahamaaraTeksti.textContent = `Rahaa: ${rahamaara}€`;                               // Päivitetään näkyvä rahamäärä
            voittoTeksti.textContent = '';                                                      // Tyhjennetään voittoilmoitus
            return true;
        } else {                                                                                // Jos rahaa ei ole tarpeeksi
            voittoTeksti.textContent = 'Sinulla ei ole tarpeeksi rahaa!';                        // Näytetään ilmoitus
        }
    } else {                                                                                    // jos joku sloteista on lukittu, ei vähennetä rahaa
        return true;
    }
}

function lisaaRahaa(randomImages) {

    if (voitot[randomImages]) {
        voitto = voitot[randomImages][panos - 1];
        rahamaara += voitto;
    }
}

function getRandomImages(slot) {
    const images = [];
    for (let i = 1; i <= 5; i++) {
        images.push(slot[`image${i}`]);
    }

    const randomImages = [];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * images.length);
        randomImages.push(images[randomIndex]);
    }

    return randomImages;
}

function lukitseSlotti(index) {

    if (isPlaying) {
        if (!eval(`lock${index}`)) {
            eval(`lock${index} = true`);
            document.getElementById(`lock${index}`).textContent = 'Lukittu';
            document.getElementById(`lock${index}`).style.backgroundColor = 'orange';
        } else {
            eval(`lock${index} = false`);
            document.getElementById(`lock${index}`).textContent = 'Lukitse';
            document.getElementById(`lock${index}`).style.backgroundColor = 'red';
        }
    }
}

function pelaaPeli() {
    if (!isPlaying) {
        if (rahamaara >= panos) {
            otaRahaa();
            arvoSlotit();
            isPlaying = true;
            peliohje.textContent = "";
        } else {
            voittoTeksti.textContent = 'Sinulla ei ole tarpeeksi rahaa!';
        }
    } else {
        arvoLukitsemattomatSlotit();
        vapautaSlotit();
        isPlaying = false;
        peliohje.textContent = "Pyöräytä uudestaan!";
    }

    tarkistaVoitto();
}

function vapautaSlotit() {

    lock1 = false;
    lock2 = false;
    lock3 = false;
    lock4 = false;

    for (let i = 1; i <= 4; i++) {
        document.getElementById(`lock${i}`).textContent = 'Lukitse';
        document.getElementById(`lock${i}`).style.backgroundColor = 'red';
    }
}

function arvoSlotit() {

    let flexContainer = document.querySelector('.flex-container');
    let slotItems = flexContainer.querySelectorAll('.flex-item');

    JSONdata.slotit.forEach((slot, index) => {
        let flexItem = slotItems[index];
        const images = getRandomImages(slot);
        flexItem.innerHTML = '';

        images.forEach((src, imgIndex) => {
            let img = document.createElement('img');
            img.src = src;
            img.alt = `${slot.name} - Image ${imgIndex + 1}`;
            flexItem.appendChild(img);
        });

        // Animaatio
        let slotImages = flexItem.querySelectorAll('img');
        gsap.fromTo(slotImages, { y: -100 }, {
            y: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: "power1.out",
        });
    });
}

function arvoLukitsemattomatSlotit() {

    let flexContainer = document.querySelector('.flex-container');
    let slotItems = flexContainer.querySelectorAll('.flex-item');

    JSONdata.slotit.forEach((slot, index) => {
        let flexItem = slotItems[index];

        if (!eval(`lock${index + 1}`)) {
            const images = getRandomImages(slot);
            flexItem.innerHTML = '';

            images.forEach((src, imgIndex) => {
                let img = document.createElement('img');
                img.src = src;
                img.alt = `${slot.name} - Image ${imgIndex + 1}`;
                flexItem.appendChild(img);
            });

            let slotImages = flexItem.querySelectorAll('img');
            gsap.fromTo(slotImages, { y: -100 }, {
                y: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: "power1.out",
            });
        }
    });
}

function tarkistaVoitto() {
    const slots = Array.from(document.querySelectorAll('.flex-item img'));
    const rows = 3;

    // Tyhjennetään edellinen voittoilmoitus
    const voittoTeksti = document.getElementById('voittoTeksti');
    voittoTeksti.textContent = '';

    // Tarkistetaan jokainen rivi
    for (let rivi = 0; rivi < rows; rivi++) {
        const rivinKuvat = [];
        for (let slot = 0; slot < slots.length; slot += rows) {
            rivinKuvat.push(slots[slot + rivi]?.src);
        }

        console.log(`Rivi: ${rivi}, Kuvia: ${rivinKuvat}`);

        // Tarkistetaan, ovatko kaikki kuvat samoja
        const kaikkiSamoja = rivinKuvat.every(kuva => kuva === rivinKuvat[0]);

        if (kaikkiSamoja && rivinKuvat[0]) {                                                    // Jos kaikki kuvat ovat samoja, voitto
            const voittavaKuva = rivinKuvat[0].split('/').pop().split('.')[0];                  // Hae kuvan nimi
            const voittoSumma = voitot[voittavaKuva][panos - 1];                                // Hae voitto taulukosta panoksen mukaan
            rahamaara += voittoSumma;                                                           // Lisää voitto rahamäärään
            rahamaaraTeksti.textContent = `Rahaa: ${rahamaara}€`;                               // Päivitä rahamäärä
            voittoTeksti.textContent = `VOITIT! ${voittoSumma}€`;                               // Näytä voittoilmoitus
            voittoTeksti.style.color = "yellow";
            voittoTeksti.style.fontSize = "20px";
            setTimeout(() => {
                voittoTeksti.textContent = '';
            }, 3000);
            peliohje.textContent = "Pyöräytä uudestaan!";

            return;
        }


        // Jos kolme ensimmäistä kuvaa ovat numero 7 
        if (rivinKuvat[0]?.includes('number7') && rivinKuvat[1]?.includes('number7') && rivinKuvat[2]?.includes('number7')) {
            const voittoSumma = voitot["number7x3"][panos - 1];
            rahamaara += voittoSumma;
            rahamaaraTeksti.textContent = `Rahaa: ${rahamaara}€`;
            voittoTeksti.textContent = `VOITIT! ${voittoSumma}€`;
            setTimeout(() => {
                voittoTeksti.textContent = '';
            }, 3000);
            peliohje.textContent = "Pyöräytä uudestaan!";

            return;
        }
    }
}

function getContent() {
    document.title = JSONdata.otsikko;                                      // Aseta sivun otsikoksi JSON-tiedostosta haettu otsikko
    document.querySelector('h1').textContent = JSONdata.otsikko;            // Aseta h1-elementin tekstiksi JSON-tiedostosta haettu otsikko

    let flexContainer = document.querySelector('.flex-container');          // Hae flex-container
    let voittotaulu = document.getElementById('voitonjako');

    flexContainer.innerHTML = '';

    // Slotit flex-containeriin
    JSONdata.slotit.forEach(slot => {
        let flexItem = document.createElement('div');
        flexItem.classList.add('flex-item');
        flexContainer.appendChild(flexItem);

        const randomImages = getRandomImages(slot);

        randomImages.forEach((src, index) => {
            let img = document.createElement('img');
            img.src = src;
            img.alt = `${slot.name} - Image ${index + 1}`;
            flexItem.appendChild(img);
        });
    });


    // Voitonjako-taulukko
    const voitonjako = JSONdata.Voitonjako;

    // Voittojen määrittelyt
    const voitot = {
        "number7": "1€ = 10€, 2€ = 20€, 3€ = 30€, 4€ = 40€, 5€ = 50€",
        "number7x3": "1€ = 5€, 2€ = 10€, 3€ = 15€, 4€ = 20€, 5€ = 25€",
        "apple": "1€ = 6€, 2€ = 12€, 3€ = 18€, 4€ = 24€, 5€ = 30€",
        "melon": "1€ = 5€, 2€ = 10€, 3€ = 15€, 4€ = 20€, 5€ = 25€",
        "pear": "1€ = 4€, 2€ = 8€, 3€ = 12€, 4€ = 16€, 5€ = 20€",
        "cherry": "1€ = 3€, 2€ = 6€, 3€ = 9€, 4€ = 12€, 5€ = 15€"
    };

    // Toistetaan jokainen hedelmä ja lisätään myös rivi kolmella numerolla 7
    for (const [hedelma, kuva] of Object.entries(voitonjako)) {
        let div = document.createElement('div');
        let img = document.createElement('img');
        img.src = kuva;
        img.alt = `${hedelma} kuva`;

        div.appendChild(img);
        voittotaulu.appendChild(div);

        // Jos kyseessä on "number7x3", näytetään vain kolme kuvaa
        if (hedelma === "number7x3") {
            for (let i = 1; i < 3; i++) { // Vain 2 lisäkuvaa, jolloin yhteensä 3
                let imgCopy = document.createElement('img');
                imgCopy.src = kuva;
                imgCopy.alt = `${hedelma} kuva`;
                div.appendChild(imgCopy);
            }
            // Lisätään marginaali viimeisen kuvan jälkeen jotta teksti tasoittuisi
            let marginDiv = document.createElement('div');
            marginDiv.style.marginLeft = '40px';
            div.appendChild(marginDiv);
        } else {
            // Muut hedelmät ja neljä numeroa 7
            for (let i = 1; i < 4; i++) { // Kolme lisäkuvaa, jolloin yhteensä 4
                let imgCopy = document.createElement('img');
                imgCopy.src = kuva;
                imgCopy.alt = `${hedelma} kuva`;
                div.appendChild(imgCopy);
            }
        }

        // Otsikko voitonjako-osiolle
        let voitonjakoOtsikko = document.createElement('h2');
        voitonjakoOtsikko.textContent = "Panos ja voitto:";
        voitonjakoOtsikko.style.marginRight = "20px";
        voitonjakoOtsikko.style.marginLeft = "20px";
        div.appendChild(voitonjakoOtsikko);

        // Voitonjakoteksti
        let voitonjakoTeksti = document.createElement('p');
        voitonjakoTeksti.textContent = voitot[hedelma];
        voitonjakoTeksti.style.fontSize = "15px";
        div.appendChild(voitonjakoTeksti);
    }
}
