const venom = require('venom-bot');
const schedule = require('node-schedule');

venom
  .create({
    session: 'session-name', // nome da sessão, pode ser qualquer string
  })
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });

let users = {};
let todayPhotos = {};

function start(client) {
  client.onMessage((message) => {
    if (message.isMedia && message.type === 'image') {
      const sender = message.sender.pushname || message.sender.verifiedName || message.sender.name || message.from;

      if (!users[sender]) {
        users[sender] = 0;
      }

      users[sender]++;
      todayPhotos[sender] = true;

      let ranking = getRanking();
      client.sendText(message.from, `Parabéns pelo exercício, ${sender}! Você ganhou +1 ponto. ??????\n\nRanking Mensal de Exercícios do Marombas do iFood:\n\n${ranking}`);
    }

    if (message.body.toLowerCase() === '!ranking') {
      let ranking = getRanking();
      client.sendText(message.from, `Ranking Mensal de Exercícios do Marombas do iFood:\n\n${ranking}`);
    }
  });

  // Job to remind at 19:00 who didn't send a photo
  schedule.scheduleJob('0 19 * * *', () => {
    let participants = Object.keys(users);
    let missingParticipants = participants.filter(participant => !todayPhotos[participant]);

    missingParticipants.forEach(participant => {
      client.sendText(participant, `Oi, ${participant}! Notamos que você ainda não enviou sua foto de treino hoje. Por que você não foi treinar? Ainda dá tempo de conquistar seus pontos! ??`);
    });
  });

  // Job to send ranking at 22:00 every day
  schedule.scheduleJob('0 22 * * *', () => {
    let ranking = getRanking();
    client.sendText('YOUR_GROUP_ID_HERE', `Boa noite, pessoal! Aqui está o ranking atualizado de hoje:\n\nRanking Mensal de Exercícios do Marombas do iFood:\n\n${ranking}`);
    todayPhotos = {}; // Reset today's photos
  });
}

function getRanking() {
  let ranking = Object.entries(users)
    .sort((a, b) => b[1] - a[1])
    .map(([user, count], index) => `${index + 1}. ${user}: ${count} fotos`)
    .join('\n');
  
  return ranking;
}


