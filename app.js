//app.js

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let authenticatedUser = null;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const uri = 'mongodb+srv://marcobarbagallo:tUg8SjtVtJLpPtpz@pwm.d8c7nl0.mongodb.net/trackstack';

function hash(input) {
  return crypto.createHash('md5')
      .update(input)
      .digest('hex')
}

async function connectDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connesso al database MongoDB');
    return client.db();
  } catch (err) {
    console.error('Errore di connessione al database:', err);
    throw err;
  }
}

app.post('/register', async (req, res) => {
  const register = req.body;

  try {
    const db = await connectDatabase();

    // Verifica se esiste già un utente con lo stesso nome utente
    const existingUser = await db.collection('users').findOne({ username: register.regUsername });
    if (existingUser) {
      return res.status(400).send('Nome utente già esistente. Scegli un altro nome utente.');
    }

    const hashedPassword = hash(register.regPassword);

    // Aggiungi il nuovo utente al database
    await db.collection('users').insertOne({
      nome: register.regNome,
      cognome: register.regCognome,
      email: register.regEmail,
      username: register.regUsername,
      dataNascita: register.regDataNascita,
      password: hashedPassword,
    });

    console.log('Utente registrato:', { regUsername: register.regUsername });
    res.send('Registrazione completata con successo.');
  }catch (err) {
    console.error('Errore durante la registrazione:', err);
    res.status(500).send('Errore durante la registrazione.');
  }
});

// Nuova route per il login
app.post('/login', async (req, res) => {
  const { loginUsername, loginPassword } = req.body;

  try {
    const db = await connectDatabase();

    // Trova l'utente nel database
    const user = await db.collection('users').findOne({ username: loginUsername });
    if (!user) {
      return res.send('Utente non trovato. Controlla le credenziali.');
    }

    // Verifica la password
    const hashedPassword = hash(loginPassword);
    if (hashedPassword !== user.password) {
      return res.send('Password non valida. Controlla le credenziali.');
    }

    console.log('Utente autenticato:', { loginUsername });
    authenticatedUser = user._id;
    res.send('Login completato con successo.');
  } catch (err) {
    console.error('Errore durante il login:', err);
    res.status(500).send('Errore durante il login.');
  }
});


// Endpoint per il logout
app.post('/logout', (req, res) => {
  if (authenticatedUser) {
    // Simulazione di un processo di logout (puoi sostituire con un'implementazione reale)
    console.log('Utente sloggato:', { authenticatedUser });
    authenticatedUser = null;
    res.send('Logout avvenuto con successo');
  } else {
    res.status(401).send('Nessun utente autenticato per eseguire il logout');
  }
});

// Nuova route per l'eliminazione dell'account
app.delete('/delete', async (req, res) => {
  const { deleteUsername, deletePassword } = req.body;

  try {
    const db = await connectDatabase();

    // Verifica se l'utente esiste nel database
    const user = await db.collection('users').findOne({ username: deleteUsername });
    if (!user) {
      return res.send('Utente non trovato. Impossibile eliminare l\'account.');
    }

    // Verifica la password
    const hashedPassword = hash(deletePassword);
    if (hashedPassword !== user.password) {
      return res.send('Password non valida. Controlla le credenziali.');
    }

    // Elimina l'utente
    const result = await db.collection('users').deleteOne({ _id: user._id });

    if (result.deletedCount === 1) {
      console.log('Account eliminato:', { deleteUsername });
      return res.send('Account eliminato con successo.');
    } else {
      return res.send('Errore durante l\'eliminazione dell\'account.');
    }
  } catch (err) {
    console.error('Errore durante l\'eliminazione dell\'account:', err);
    res.status(500).send('Errore durante l\'eliminazione dell\'account.');
  }
});

//Route recupero dati utente
app.get('/getUserData', async (req, res) => {
  try {
      const db = await connectDatabase();

      // Ottieni l'ultimo dato dalla collezione
      const result = await db.collection('users').findOne({_id:authenticatedUser});

      if (result) {
          // Invia il risultato al client
          res.json({ 
            nome: result.nome,
            cognome: result.cognome,
            email: result.email,
            dataNascita: result.dataNascita,
            username: result.username,
           });
      } else {
          res.json({ nome: 'Nessun risultato disponibile' });
      }
  } catch (err) {
      console.error('Errore durante il recupero del risultato:', err);
      res.status(500).json({ error: 'Errore durante il recupero del risultato' });
  }
});


// Route for modifying user data
app.put('/modifyUserData', async (req, res) => {
  const { regNome, regCognome, regEmail, regUsername, regDataNascita, regOldPassword, regNewPassword } = req.body;

  try {
    const db = await connectDatabase();

    // Find the user in the database
    const user = await db.collection('users').findOne({ _id: authenticatedUser });

    if (!user) {
      return res.status(404).send('Utente non trovato.');
    }

    // Check if the new username is different from the current one
    if (regUsername !== user.username) {
      // Check if the new username is already used by another user
      const existingUser = await db.collection('users').findOne({ username: regUsername });
      if (existingUser && existingUser._id.toString() !== authenticatedUser) {
        return res.status(400).send('Nome utente già esistente. Scegli un altro nome utente.');
      }
    }

    // Verify the old password if provided
    if (regOldPassword) {
      const hashedOldPassword = hash(regOldPassword);
      if (hashedOldPassword !== user.password) {
        return res.status(401).send('Vecchia password non valida.');
      }
    }

    // Update user data
    await db.collection('users').updateOne(
      { _id: authenticatedUser },
      {
        $set: {
          nome: regNome,
          cognome: regCognome,
          email: regEmail,
          username: regUsername,
          dataNascita: regDataNascita,
          // Update the password only if the new password is provided
          ...(regNewPassword && { password: hash(regNewPassword) }),
        },
      }
    );

    console.log('Dati utente modificati:', { regUsername });
    res.send('Dati utente modificati con successo.');
  } catch (err) {
    console.error('Errore durante la modifica dei dati utente:', err);
    res.status(500).send(`Errore durante la modifica dei dati utente: ${err.message}`);
  }
});


// app.listen(PORT, () => {
//   console.log(`Server in ascolto sulla porta ${PORT}`);
// });


// app.post('/saveGenres', async (req, res) => {
//     if (!authenticatedUser) {
//         return res.status(401).send('Utente non autenticato.');
//     }

//     const { genres } = req.body;
    
//     try {
//         const db = await connectDatabase();

//         // Aggiorna i generi dell'utente nel database
//         await db.collection('users').updateOne(
//             { _id: ObjectId(authenticatedUser._id) },
//             { $set: { genres: genres } }
//         );

//         console.log('Generi salvati per l\'utente:', authenticatedUser.username);
//         res.sendStatus(200);
//     } catch (err) {
//         console.error('Errore durante il salvataggio dei generi:', err);
//         res.status(500).send('Errore durante il salvataggio dei generi.');
//     }
// });