// Funzione per il login
function login() {
  // Ottieni i valori dal form
  const loginUsername = document.getElementById('loginUsername').value;
  const loginPassword = document.getElementById('loginPassword').value;
  var loginSbagliato = document.getElementById('loginSbagliato');
  var registerChecked = document.getElementById('registerChecked');

  registerChecked.style.display = 'none';

  // Effettua una richiesta al server per il login
  fetch('http://127.0.0.1:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      loginUsername,
      loginPassword,
    }),
  })
  .then(response => response.text())
  .then(data => {
    // Verifica se il login è riuscito
    if (data === 'Login completato con successo.') {
      // Reindirizza l'utente alla pagina utenti
      window.location.href = 'home.html';
    } else {
      // Se il login non è riuscito, mostra un messaggio di errore
      console.error('Errore durante il login:', data);
      loginSbagliato.style.display = 'block';
    }
  })
  .catch(error => {
    console.error('Errore durante il login:', error);
  });
}

// Funzione per la registrazione
function register() {
  var regNome = document.getElementById('regNome').value;
  var regCognome = document.getElementById('regCognome').value;
  var regEmail = document.getElementById('regEmail').value;
  var regUsername = document.getElementById('regUsername').value;
  var regDataNascita = document.getElementById('regDataNascita').value;
  var regPassword = document.getElementById('regPassword').value;
  var mailSbagliata = document.getElementById('regEmail');
  var passwordSbagliata = document.getElementById('regPassword');
  var usrUtilizzato = document.getElementById('regUsername');
  var registerChecked = document.getElementById('registerChecked');

  if (!regNome || !regCognome || !regEmail || !regUsername || !regDataNascita || !regPassword) {
    alert('Compila tutti i campi prima di procedere.');
    return;
  }

  if (!isValidEmail(regEmail)) {
    mailSbagliata.classList.add('is-invalid');
    mailSbagliata.setAttribute('placeholder', 'formato "x@x.x"');
    mailSbagliata.value = "";
    // alert('Inserisci un indirizzo email valido nel formato "x@x.x".');
    return;
  }

  if (!isValidPassword(regPassword)) {
    passwordSbagliata.classList.add('is-invalid');
    passwordSbagliata.setAttribute('placeholder', 'min 5 caratteri + simbolo')
    passwordSbagliata.value = "";
    // alert('La password deve essere lunga almeno 5 caratteri e contenere almeno un numero e un segno speciale.');
    return;
  }

  const user = {
    regNome: regNome,
    regCognome: regCognome,
    regEmail: regEmail,
    regUsername: regUsername,
    regDataNascita: regDataNascita,
    regPassword: regPassword,
  };

  fetch('http://127.0.0.1:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
    .then(response => {
      if (response.status === 400) {
        // Se lo status della risposta è 400, gestisci l'errore
        return response.json().then(errorData => Promise.reject(errorData));
      } else {
        // Se la risposta è OK, continua con il parsing del testo
        return response.text();
      }
    })
    .then(data => {
      // La registrazione è avvenuta con successo
      resetLoginForm();
      registerChecked.style.display = 'block';
      // Inserire qui un controllo per dire che la registrazione è stata effettuata 
    })
    .catch(errorData => {
      // Gestisci l'errore quando lo status è 400
      console.error('Errore durante la registrazione:', errorData);

      // Aggiungi la classe is-invalid al campo regUsername
      document.getElementById('regUsername').classList.add('is-invalid'); //gestione senza creare una variabile in più senza il .value
      usrUtilizzato.setAttribute('placeholder', 'già in uso');
      usrUtilizzato.value = "";
    });
}

function registrationForm() {
  var loginFields = document.getElementById('loginFields');
  var registrationFields = document.getElementById('registrationFields');
  var loginButton = document.getElementById('loginButton');
  var registerButton = document.getElementById('registerButton');
  var typeAccedi = document.getElementById('typeAccedi');

  if (loginFields.style.display === 'block') {
      loginFields.style.display = 'none';
      registrationFields.style.display = 'block';
      registerButton.textContent = 'Iscriviti';
      loginButton.classList.remove('btn-success');
      loginButton.classList.add('btn-outline-success');
      loginButton.textContent = 'Annulla';
      registerButton.setAttribute('onclick', 'register()'); 
      registerButton.classList.remove('btn-outline-success')
      registerButton.classList.add('btn-success')
      loginButton.setAttribute('onclick', 'resetLoginForm()');
      typeAccedi.textContent = 'Iscriviti a TrackStack';
  }
}

function resetLoginForm() {
  var loginFields = document.getElementById('loginFields');
  var registrationFields = document.getElementById('registrationFields');
  var loginButton = document.getElementById('loginButton');
  var registerButton = document.getElementById('registerButton');
  var typeAccedi = document.getElementById('typeAccedi');

  loginFields.style.display = 'block';
  registrationFields.style.display = 'none'
  loginButton.textContent = 'Login'
  loginButton.setAttribute('onclick', 'login()')
  loginButton.classList.remove('btn-outline-success');
  loginButton.classList.add('btn-success');
  registerButton.textContent = 'Iscriviti'
  registerButton.setAttribute('onclick', 'registrationForm()') 
  registerButton.classList.remove('btn-success')
  registerButton.classList.add('btn-outline-success')
  typeAccedi.textContent = 'Accedi a TrackStack';
  loginSbagliato.style.display = 'none';
}

// Funzione per il logout
function logout() {
  // Effettua una richiesta al server per il logout
  fetch('http://127.0.0.1:3000/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.text())
  .then(data => {

    if(data === 'Logout avvenuto con successo'){
    // Reindirizza l'utente alla pagina di login dopo il logout
    window.location.href = 'index.html';
    }
  })
  .catch(error => {
    console.error('Errore durante il logout:', error);
  });
}

// Funzione per l'eliminazione dell'account
function deleteAccount() {
  // Ottieni i valori dal form
  const deleteUsername = document.getElementById('deleteUsername').value;
  const deletePassword = document.getElementById('deletePassword').value;
  const deleteSbagliato = document.getElementById('deleteSbagliato');

  // Effettua una richiesta al server per l'eliminazione dell'account
  fetch('http://127.0.0.1:3000/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deleteUsername,
      deletePassword,
    }),
  })
  .then(response => response.text())
  .then(data => {
    //alert(data); // Mostra l'esito dell'eliminazione dell'account
    // Controlla se l'eliminazione dell'account ha avuto successo prima di eseguire il logout
    if (data === 'Account eliminato con successo.') {
      logout();
    }else{
      deleteSbagliato.classList.remove('d-none');
    }
  })
  .catch(error => {
    console.error('Errore durante l\'eliminazione dell\'account:', error);
  });
}


// Funzione per abilitare la modifica dei campi
function enableModify() {
  document.getElementById('regNomeData').disabled = false;
  document.getElementById('regCognomeData').disabled = false;
  document.getElementById('regEmailData').disabled = false;
  document.getElementById('regUsernameData').disabled = false;
  document.getElementById('regDataNascitaData').disabled = false;
  document.getElementById('regOldPasswordData').disabled = false;
  document.getElementById('regNewPasswordData').disabled = false;
  
  document.getElementById('profilesvg').classList.add('d-none')
  document.getElementById('regNomeDataField').classList.remove('d-none')
  document.getElementById('regCognomeDataField').classList.remove('d-none')
  document.getElementById('regDataNascitaDataField').classList.remove('d-none')
  document.getElementById('regOldPasswordDataField').classList.remove('d-none')
  document.getElementById('regNewPasswordDataField').classList.remove('d-none')
 
  document.getElementById('enableModify').classList.add('d-none')
  document.getElementById('modifyUser').classList.remove('d-none')
  document.getElementById('disableUser').classList.remove('d-none')
}

// Funzione per abilitare la modifica dei campi
function disableModify() {
  document.getElementById('regNomeData').disabled = true;
  document.getElementById('regCognomeData').disabled = true;
  document.getElementById('regEmailData').disabled = true;
  document.getElementById('regUsernameData').disabled = true;
  document.getElementById('regDataNascitaData').disabled = true;
  document.getElementById('regOldPasswordData').disabled = true;
  document.getElementById('regNewPasswordData').disabled = true;

  document.getElementById('profilesvg').classList.remove('d-none')
  document.getElementById('regNomeDataField').classList.add('d-none')
  document.getElementById('regCognomeDataField').classList.add('d-none')
  document.getElementById('regDataNascitaDataField').classList.add('d-none')
  document.getElementById('regOldPasswordDataField').classList.add('d-none')
  document.getElementById('regNewPasswordDataField').classList.add('d-none')

  document.getElementById('enableModify').classList.remove('d-none')
  document.getElementById('modifyUser').classList.add('d-none')
  document.getElementById('disableUser').classList.add('d-none')
}


// Funzione per ottenere i dati dell'utente
function getUserData() {
  fetch('http://127.0.0.1:3000/getUserData')
    .then(response => {
      if (!response.ok) {
        throw new Error('Utente non autenticato.');
      }
      return response.json();
    })
    .then(data => {
      console.log('Dati ricevuti dal server:', data);
      // Verifica e popola gli input con i dati dell'utente
      document.getElementById('regNomeData').value = data.nome || '';
      document.getElementById('regCognomeData').value = data.cognome || '';
      document.getElementById('regEmailData').value = data.email || '';
      document.getElementById('regUsernameData').value = data.username || '';
      document.getElementById('regDataNascitaData').value = data.dataNascita || '';
      document.getElementById('deleteUsername').value = data.username || '';
    })
    .catch(error => {
      console.error('Errore durante il recupero dei dati utente:', error);
      // Gestisci il caso in cui l'utente non è autenticato o ci sono altri errori
    });
}


function modifyUser() {
  const regNome = document.getElementById('regNomeData').value;
  const regCognome = document.getElementById('regCognomeData').value;
  const regEmail = document.getElementById('regEmailData').value;
  const regUsername = document.getElementById('regUsernameData').value;
  const regDataNascita = document.getElementById('regDataNascitaData').value;
  const regOldPassword = document.getElementById('regOldPasswordData').value;
  const regNewPassword = document.getElementById('regNewPasswordData').value;

  if (!regNome || !regCognome || !regEmail || !regUsername || !regDataNascita) {
    alert('Compila tutti i campi obbligatori prima di procedere.');
    return;
  }

  // Verifica del pattern dell'indirizzo email
  if (!isValidEmail(regEmail)) {
    alert('Inserisci un indirizzo email valido nel formato "x@x.x".');
    return;
  }

  // Aggiunta della validazione della password
  if (regOldPassword && !isValidPassword(regOldPassword)) {
    alert('La password deve essere lunga almeno 5 caratteri e contenere almeno un numero e un segno speciale.');
    return;
  }

  // Aggiunta della validazione della nuova password, se fornita
  if (regNewPassword && !isValidPassword(regNewPassword)) {
    alert('La nuova password deve essere lunga almeno 5 caratteri e contenere almeno un numero e un segno speciale.');
    return;
  }

  if (regOldPassword) {
    enableModify();
  }

  const modifiedUser = {
    regNome,
    regCognome,
    regEmail,
    regUsername,
    regDataNascita,
    regOldPassword,
    regNewPassword,
  };
  

  fetch('http://127.0.0.1:3000/modifyUserData', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(modifiedUser),
  })
    .then(response => response.text())
    .then(data => {
      if(data === 'Dati utente modificati con successo.'){
      // Reload user data after modification
      getUserData();
      disableModify()
      }
    })
    .catch(error => {
      console.error('Errore durante la modifica dei dati utente:', error);
    });
}

// Funzione per verificare il pattern dell'indirizzo email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Funzione per validare la password
function isValidPassword(password) {
  // Lunghezza minima 5 caratteri
  if (password.length < 5) {
    return false;
  }

  // Almeno un numero
  if (!/\d/.test(password)) {
    return false;
  }

  // Almeno un segno speciale (puoi aggiungere altri segni speciali a seconda delle tue esigenze)
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }

  // La password ha superato tutte le condizioni di validazione
  return true;
}

function enableDelete(){
  var delUsername = document.getElementById('delUsername');
  var delPassword = document.getElementById('delPassword');
  var eliminaAccount = document.getElementById('eliminaAccount')
  var confermaDelete = document.getElementById('confermaDelete')
  var annullDelete = document.getElementById('annullDelete')

  delUsername.classList.remove('d-none')
  delPassword.classList.remove('d-none')
  eliminaAccount.classList.add('d-none')
  confermaDelete.classList.remove('d-none')
  annullDelete.classList.remove('d-none')

}

function annullaDelete(){
  var delUsername = document.getElementById('delUsername');
  var delPassword = document.getElementById('delPassword');
  var eliminaAccount = document.getElementById('eliminaAccount')
  var confermaDelete = document.getElementById('confermaDelete')
  var annullDelete = document.getElementById('annullDelete')
  var deleteSbagliato = document.getElementById('deleteSbagliato');

  delUsername.classList.add('d-none')
  delPassword.classList.add('d-none')
  eliminaAccount.classList.remove('d-none')
  confermaDelete.classList.add('d-none')
  annullDelete.classList.add('d-none')
  deleteSbagliato.classList.add('d-none')

}


// //funzione per salvare in un array i generi e salvare nel database
// function salvageneri(){
//   document.getElementById('salvaGeneri').addEventListener('click', () => {
//     // Ottieni tutti i checkbox dei generi
//     const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
//     const selectedGenres = [];

//     // Itera su ogni checkbox selezionato e aggiungi il genere all'array
//     checkboxes.forEach(checkbox => {
//         selectedGenres.push(checkbox.value);
//     });

//     // Invia l'array dei generi selezionati al server
//     fetch('/saveGenres', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ genres: selectedGenres })
//     })
//     .then(response => {
//         if (response.ok) {
//             console.log('Generi salvati con successo!');
//             // Aggiungi qui eventuali azioni dopo il salvataggio
//         } else {
//             console.error('Errore durante il salvataggio dei generi:', response.statusText);
//         }
//     })
//     .catch(error => {
//         console.error('Errore durante il salvataggio dei generi:', error);
//     });
//   });
// }