//spotifyApi.js

const client_id = "1e0705ffcf394f2bb16bc245b676e29c";
const client_secret = "6579e7209f9741fa8d5b0d96b7e6e583";
var url = "https://accounts.spotify.com/api/token";

function generateToken() {
    fetch(url, {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
    })
        .then((response) => response.json())
        .then((tokenResponse) => {
            const accessToken = tokenResponse.access_token;
            
            // Salva il token nel session storage
            sessionStorage.setItem('spotifyAccessToken', accessToken);
            console.log("Token salvato correttamente nel Sessionstorage")
            
        });
}

let currentAudio;
function playPreview(previewUrl, playButtonId, progressBarId) {
  const playButton = document.getElementById(playButtonId);
  const playPausePath = document.getElementById('playPausePath');
  const progressBar = document.getElementById(progressBarId);
  
  if (currentAudio && currentAudio.src === previewUrl) {
    if (currentAudio.paused) {
      currentAudio.play();
      playPausePath.setAttribute('d', 'M11 5H13V19H11V5Z');
    } else {
      currentAudio.pause();
      playPausePath.setAttribute('d', 'M6 5H8V19H6V5ZM16 5H18V19H16V5Z');
    }
  } else {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(previewUrl);

    audio.addEventListener('timeupdate', () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = progress + '%';
    });

    audio.addEventListener('ended', () => {
      progressBar.style.width = '0%';
      playPausePath.setAttribute('d', 'M6 5H8V19H6V5ZM16 5H18V19H16V5Z');
    });

    audio.play();
    currentAudio = audio;
    playPausePath.setAttribute('d', 'M11 5H13V19H11V5Z');
  }
}


// Aggiorna la funzione searchTracks
function searchTracks() {
  // Ottieni il valore dell'input di ricerca
  const searchInput = document.getElementById('searchtrackinput').value;
  

  // Controlla se il token è presente nel session storage
  const accessToken = sessionStorage.getItem('spotifyAccessToken');
  if (!accessToken) {
    console.error('Access token non presente nel Sessionstorage. Assicurati di aver chiamato la funzione generateToken() prima.');
    return;
  }

  // Controlla se l'input di ricerca è vuoto

  const resultTemplate = document.getElementById('resultTemplate');
  resultTemplate.classList.remove('d-none');


  // Effettua la chiamata API per cercare i brani
  fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=track`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      // Ottieni la lista dei brani dai dati della risposta
      const tracks = data.tracks.items;

      // Ottieni il template della card
      const resultTemplate = document.getElementById('resultTemplate');

      // Ottieni il contenitore in cui inserire le card cloni
      const resultsContainer = document.querySelector('.scrollable');

      // Pulisci il contenuto del contenitore prima di aggiungere nuove card
      resultsContainer.innerHTML = '';

      // Per ogni brano, crea una card clone e aggiungila al contenitore
      tracks.forEach((track, index) => {
        const clone = resultTemplate.cloneNode(true);
        clone.style.display = ''; // Rendi visibile il clone

        // Aggiorna il testo e le immagini della card con i dati del brano corrente
        clone.querySelector('.card-title').textContent = track.artists[0].name;
        clone.querySelector('.card-text').textContent = track.name;
        clone.querySelector('img').src = track.album.images[0].url;

        // Aggiungi elementi univoci per la barra di avanzamento e il pulsante di riproduzione
        const progressBarId = `progressBar${index}`;
        const playButtonId = `playButton${index}`;

        // Sostituisci %TRACK_PREVIEW_URL% con l'effettivo track.preview_url
        const previewButton = clone.querySelector('.btn-success');
        previewButton.setAttribute('onclick', `playPreview('${track.preview_url}', '${progressBarId}', '${playButtonId}')`);

        // Aggiungi il clone al contenitore
        resultsContainer.appendChild(clone);
      });
    })
    .catch(error => console.error('Errore nella ricerca dei brani:', error));
}

function top50global() {
  const accessToken = sessionStorage.getItem('spotifyAccessToken');
  if (!accessToken) {
      console.error('Access token non presente nel Sessionstorage. Assicurati di aver chiamato la funzione generateToken() prima.');
      return;
  }

  var topglo = document.getElementById('topglo');
  var tuttelecard = document.getElementById('tuttelecard');
  const resultTemplate = document.getElementById('resultTemplate');

  // Effettua la chiamata API per ottenere i brani dalla playlist
  fetch("https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks", {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
      },
  })
  .then(response => response.json())
  .then(data => {
      // Ottieni la lista dei brani dai dati della risposta
      const tracks = data.items;

      // Ottieni il template della card
      const resultTemplate = document.getElementById('resultTemplate');

      // Ottieni il contenitore in cui inserire le card cloni
      const resultsContainer = document.querySelector('.scrollable');

      // Pulisci il contenuto del contenitore prima di aggiungere nuove card
      resultsContainer.innerHTML = '';

      // Per ogni brano, crea una card clone e aggiungila al contenitore
      tracks.forEach((track, index) => {
          const trackData = track.track; // Dati del brano
          const clone = resultTemplate.cloneNode(true);
          clone.style.display = ''; // Rendi visibile il clone

          // Aggiorna il testo e le immagini della card con i dati del brano corrente
          clone.querySelector('.card-title').textContent = trackData.artists[0].name;
          clone.querySelector('.card-text').textContent = trackData.name;
          clone.querySelector('img').src = trackData.album.images[0].url;

          // Aggiungi elementi univoci per la barra di avanzamento e il pulsante di riproduzione
          const progressBarId = `progressBar${index}`;
          const playButtonId = `playButton${index}`;

          // Sostituisci %TRACK_PREVIEW_URL% con l'effettivo track.preview_url
          const previewButton = clone.querySelector('.btn-success');
          previewButton.setAttribute('onclick', `playPreview('${trackData.preview_url}', '${progressBarId}', '${playButtonId}')`);

          // Aggiungi il clone al contenitore
          resultsContainer.appendChild(clone);
      });
  })
  .catch(error => console.error('Errore nel popolare dalla playlist:', error));

  //far aspettare 1 secondo a questo if
  if (!topglo.classList.contains('d-none') && topglo.classList.contains('btn-success')) {
        resultTemplate.classList.add('d-none');
        tuttelecard.classList.add('d-none');
    }else {
    tuttelecard.classList.remove('d-none');
    resultTemplate.classList.remove('d-none');
}
}

function top50italia() {
  const accessToken = sessionStorage.getItem('spotifyAccessToken');
  if (!accessToken) {
      console.error('Access token non presente nel Sessionstorage. Assicurati di aver chiamato la funzione generateToken() prima.');
      return;
  }

  var topita = document.getElementById('topita');
  var tuttelecard = document.getElementById('tuttelecard');
  const resultTemplate = document.getElementById('resultTemplate');


  if (!topita.classList.contains('d-none') && topita.classList.contains('btn-success')) {
    resultTemplate.classList.add('d-none');
    tuttelecard.classList.add('d-none');
  }else{
    tuttelecard.classList.remove('d-none');
    resultTemplate.classList.remove('d-none');
  }


  // Effettua la chiamata API per ottenere i brani dalla playlist
  fetch("https://api.spotify.com/v1/playlists/37i9dQZEVXbIQnj7RRhdSX/tracks", {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
      },
  })
  .then(response => response.json())
  .then(data => {
      // Ottieni la lista dei brani dai dati della risposta
      const tracks = data.items;

      // Ottieni il template della card
      const resultTemplate = document.getElementById('resultTemplate');

      // Ottieni il contenitore in cui inserire le card cloni
      const resultsContainer = document.querySelector('.scrollable');

      // Pulisci il contenuto del contenitore prima di aggiungere nuove card
      resultsContainer.innerHTML = '';

      // Per ogni brano, crea una card clone e aggiungila al contenitore
      tracks.forEach((track, index) => {
          const trackData = track.track; // Dati del brano
          const clone = resultTemplate.cloneNode(true);
          clone.style.display = ''; // Rendi visibile il clone

          // Aggiorna il testo e le immagini della card con i dati del brano corrente
          clone.querySelector('.card-title').textContent = trackData.artists[0].name;
          clone.querySelector('.card-text').textContent = trackData.name;
          clone.querySelector('img').src = trackData.album.images[0].url;

          // Aggiungi elementi univoci per la barra di avanzamento e il pulsante di riproduzione
          const progressBarId = `progressBar${index}`;
          const playButtonId = `playButton${index}`;

          // Sostituisci %TRACK_PREVIEW_URL% con l'effettivo track.preview_url
          const previewButton = clone.querySelector('.btn-success');
          previewButton.setAttribute('onclick', `playPreview('${trackData.preview_url}', '${progressBarId}', '${playButtonId}')`);

          // Aggiungi il clone al contenitore
          resultsContainer.appendChild(clone);
      });
  })
  .catch(error => console.error('Errore nel popolare dalla playlist:', error));
}

function topStream() {

  const accessToken = sessionStorage.getItem('spotifyAccessToken');
  if (!accessToken) {
      console.error('Access token non presente nel Sessionstorage. Assicurati di aver chiamato la funzione generateToken() prima.');
      return;
  }

  const tuttelecard = document.getElementById('tuttelecard');
  var topspo = document.getElementById('topspo');
  const resultTemplate = document.getElementById('resultTemplate');
  
  if (!topspo.classList.contains('d-none') && topspo.classList.contains('btn-success')) {
    resultTemplate.classList.add('d-none');
    tuttelecard.classList.add('d-none');
  }else{
    tuttelecard.classList.remove('d-none');
    resultTemplate.classList.remove('d-none');
  }

  // Effettua la chiamata API per ottenere i brani dalla playlist
  fetch("https://api.spotify.com/v1/playlists/5ABHKGoOzxkaa28ttQV9sE/tracks", {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
      },
  })
  .then(response => response.json())
  .then(data => {
      // Ottieni la lista dei brani dai dati della risposta
      const tracks = data.items;

      // Ottieni il template della card
      const resultTemplate = document.getElementById('resultTemplate');

      // Ottieni il contenitore in cui inserire le card cloni
      const resultsContainer = document.querySelector('.scrollable');

      // Pulisci il contenuto del contenitore prima di aggiungere nuove card
      resultsContainer.innerHTML = '';

      // Per ogni brano, crea una card clone e aggiungila al contenitore
      tracks.forEach((track, index) => {
          const trackData = track.track; // Dati del brano
          const clone = resultTemplate.cloneNode(true);
          clone.style.display = ''; // Rendi visibile il clone

          // Aggiorna il testo e le immagini della card con i dati del brano corrente
          clone.querySelector('.card-title').textContent = trackData.artists[0].name;
          clone.querySelector('.card-text').textContent = trackData.name;
          clone.querySelector('img').src = trackData.album.images[0].url;

          // Aggiungi elementi univoci per la barra di avanzamento e il pulsante di riproduzione
          const progressBarId = `progressBar${index}`;
          const playButtonId = `playButton${index}`;

          // Sostituisci %TRACK_PREVIEW_URL% con l'effettivo track.preview_url
          const previewButton = clone.querySelector('.btn-success');
          previewButton.setAttribute('onclick', `playPreview('${trackData.preview_url}', '${progressBarId}', '${playButtonId}')`);

          // Aggiungi il clone al contenitore
          resultsContainer.appendChild(clone);
      });
  })
  .catch(error => console.error('Errore nel popolare dalla playlist:', error));
}

function fixcharts(){

  var topita = document.getElementById('topita');
  var topspo = document.getElementById('topspo');
  var topglo = document.getElementById('topglo');

  topita.addEventListener('click', function() {
    if(topita.classList.contains('btn-success')){
      topita.classList.remove('btn-success');
      topita.classList.add('btn-outline-success');
    }else{
    topita.classList.add('btn-success');
    topita.classList.remove('btn-outline-success');
    topspo.classList.remove('btn-success');
    topglo.classList.remove('btn-success');
    topspo.classList.add('btn-outline-success');
    topglo.classList.add('btn-outline-success');
    }
  });

  topspo.addEventListener('click', function() {
    if(topspo.classList.contains('btn-success')){
      topspo.classList.remove('btn-success');
      topspo.classList.add('btn-outline-success');
    }else{
    topspo.classList.add('btn-success');
    topspo.classList.remove('btn-outline-success');
    topita.classList.remove('btn-success');
    topglo.classList.remove('btn-success');
    topita.classList.add('btn-outline-success');
    topglo.classList.add('btn-outline-success');
    }
  });

  topglo.addEventListener('click', function() {
    if(topglo.classList.contains('btn-success')){
      topglo.classList.remove('btn-success');
      topglo.classList.add('btn-outline-success');
    }else{
    topglo.classList.add('btn-success');
    topglo.classList.remove('btn-outline-success');
    topita.classList.remove('btn-success');
    topspo.classList.remove('btn-success');
    topita.classList.add('btn-outline-success');
    topspo.classList.add('btn-outline-success');
    }
  });


}


function ottienigeneri() {
  const accessToken = sessionStorage.getItem('spotifyAccessToken');
  if (!accessToken) {
    console.error('Access token non presente nel Sessionstorage. Assicurati di aver chiamato la funzione generateToken() prima.');
    return;
  }

  fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
    const availableGenres = data.genres;
    const genreList = document.getElementById('genreList');

    // Creazione del div per la btn-group
    const btnGroupDiv = document.createElement('div');
    btnGroupDiv.classList.add('btn-group-vertical');
    btnGroupDiv.setAttribute('role', 'group');
    btnGroupDiv.setAttribute('aria-label', 'Basic checkbox toggle button group');

    availableGenres.forEach(genre => {
      // Creazione dell'input checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('btn-check');
      checkbox.id = `btncheck-${genre}`;
      checkbox.autocomplete = 'off';

      // Creazione della label per il checkbox
      const label = document.createElement('label');
      label.classList.add('btn', 'btn-outline-success', 'btn-sm', 'mb-2', 'rounded-5', 'w-100', 'text-start'); // Aggiunto w-100 e text-start per allineare il testo a sinistra e far espandere la label su tutta la larghezza
      label.htmlFor = `btncheck-${genre}`;
      label.appendChild(document.createTextNode(genre));

      // Creazione di un div per contenere il checkbox e la label
      const checkboxDiv = document.createElement('div');
      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);

      // Aggiunta del div contenente il checkbox e la label al div della btn-group
      btnGroupDiv.appendChild(checkboxDiv);
    });

    // Aggiunta del div della btn-group alla lista dei generi
    genreList.appendChild(btnGroupDiv);
  })
  .catch(error => console.error('Errore nel recupero dei generi disponibili:', error));
}
