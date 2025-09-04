// =======================
// server.js
// =======================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const {
  handleCropInquiry,
  handleFollowUp,
  handleSensorAnalysis,
  handleWeatherInquiry,
  handleReportAndChat,
  normalizeCropName
} = require('./services/aiService');

const sessionStore = require('./services/sessionStore');
const User = require('./models/User');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

function getStageFromDays(crop, days) {
  crop = normalizeCropName(crop);
  if (crop === 'maize') {
    if (days <= 10) return 'germination';
    if (days <= 30) return 'vegetative';
    if (days <= 50) return 'flowering';
    return 'grain_filling';
  }
  if (crop === 'beans') {
    if (days <= 7) return 'germination';
    if (days <= 20) return 'vegetative';
    if (days <= 40) return 'flowering';
    return 'maturity';
  }
  if (crop === 'potato') {
    if (days <= 15) return 'sprouting';
    if (days <= 35) return 'vegetative';
    if (days <= 55) return 'tuber_initiation';
    return 'maturity';
  }
  return 'unknown';
}

app.post('/ussd', async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = text.split('*');
  const lastInput = inputs[inputs.length - 1];

  let session = await sessionStore.getSession(sessionId) || {
    currentMenu: 'main',
    data: {}
  };

  let response = '';
  try {
    let user = await User.findOne({ phoneNumber });

    if (!user || !user.registered) {
      switch (inputs.length) {
        case 1:
          response = `CON Welcome to FarmBotika.\nEnter your National ID:`;
          break;
        case 2:
          response = `CON Enter your County (e.g., Kiambu):`;
          break;
        case 3:
          response = `CON Create a 4-digit PIN:`;
          break;
        case 4:
          response = `CON Confirm your PIN:`;
          break;
        case 5:
          if (inputs[3] !== inputs[4]) return res.send(`END PINs do not match. Start again.`);
          const hashedPin = await bcrypt.hash(inputs[3], 10);
          if (user) {
            Object.assign(user, {
              nationalId: inputs[1],
              county: inputs[2],
              pin: hashedPin,
              registered: true
            });
            await user.save();
          } else {
            await new User({
              phoneNumber,
              nationalId: inputs[1],
              county: inputs[2],
              pin: hashedPin,
              registered: true
            }).save();
          }
          return res.send(`END Registration successful.`);
        default:
          return res.send(`END Invalid registration step.`);
      }
      await sessionStore.saveSession(sessionId, session);
      return res.send(response);
    }

    if (text === '' || lastInput === '0') {
      session.currentMenu = 'main';
      response = `CON Welcome to FarmBotika\n1. Make Inquiry\n2. Report\n0. Exit`;
    }

    else if (session.currentMenu === 'main') {
      switch (inputs[0]) {
        case '1':
          session.currentMenu = 'inquiry';
          response = `CON Choose Inquiry Type:\n1. Crop Suitability\n2. Follow-Up Advice\n3. Soil Info\n4. Weather Forecast`;
          break;
        case '2':
          session.currentMenu = 'report';
          response = `CON Report a Problem:\n1. Plant Disease or Pest\n2. Chat with AI`;
          break;
        default:
          response = `END Invalid option. Try again.`;
      }
    }

    else if (session.currentMenu === 'inquiry') {
      switch (inputs[1]) {
        case '1':
          session.currentMenu = 'inquiry_crop';
          response = `CON Enter crop name (e.g., maize):`;
          break;
        case '2':
          session.currentMenu = 'inquiry_follow';
          response = `CON Enter crop name (e.g., beans):`;
          break;
        case '3':
          session.currentMenu = 'inquiry_soil';
          response = `CON Enter crop for soil check:`;
          break;
        case '4':
          session.currentMenu = 'inquiry_weather';
          response = `CON Enter your location (e.g., Bungoma, Kitale):`;
          break;
        default:
          response = `END Invalid inquiry option.`;
      }
    }

    else if (session.currentMenu === 'inquiry_crop') {
      const crop = lastInput.toLowerCase();
      response = await handleCropInquiry(phoneNumber, crop, user.county);
      await sessionStore.deleteSession(sessionId);
    }

    else if (session.currentMenu === 'inquiry_follow') {
      session.data.crop = lastInput.toLowerCase();
      session.currentMenu = 'inquiry_follow_days';
      response = `CON How many days ago did you plant ${session.data.crop}?`;
    }

    else if (session.currentMenu === 'inquiry_follow_days') {
      const days = parseInt(lastInput.trim());
      const crop = session.data.crop;
      if (isNaN(days) || days < 0 || days > 200) {
        response = `END Please enter a valid number of days (e.g., 25).`;
      } else {
        const stage = getStageFromDays(crop, days);
        response = await handleFollowUp(phoneNumber, crop, stage, user.county);
        await sessionStore.deleteSession(sessionId);
      }
    }

    else if (session.currentMenu === 'inquiry_soil') {
      const crop = lastInput.toLowerCase();
      response = await handleSensorAnalysis(phoneNumber, crop, phoneNumber);
      await sessionStore.deleteSession(sessionId);
    }

    else if (session.currentMenu === 'inquiry_weather') {
      const location = lastInput.trim();
      response = await handleWeatherInquiry(phoneNumber, location);
      await sessionStore.deleteSession(sessionId);
    }

    else if (session.currentMenu === 'report') {
      switch (inputs[1]) {
        case '1':
          session.currentMenu = 'report_crop';
          response = `CON What crop is affected? (e.g., maize)`;
          break;
        case '2':
          response = await handleReportAndChat(phoneNumber, 'chat request');
          await sessionStore.deleteSession(sessionId);
          break;
        default:
          response = 'END Invalid report option.';
      }
    }

    else if (session.currentMenu === 'report_crop') {
      session.data.reportedCrop = lastInput.toLowerCase();
      session.currentMenu = 'report_description';
      response = `CON Describe the issue affecting your ${session.data.reportedCrop} (e.g., yellowing leaves):`;
    }

    else if (session.currentMenu === 'report_description') {
      const crop = session.data.reportedCrop;
      const description = `${crop} - ${lastInput.trim()}`;
      response = await handleReportAndChat(phoneNumber, description);
      await sessionStore.deleteSession(sessionId);
    }

    await sessionStore.saveSession(sessionId, session);
  } catch (err) {
    console.error('USSD Error:', err);
    response = 'END System error. Please try again.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

const admin = require('firebase-admin');
app.post('/sensor', async (req, res) => {
  const { farmId, moisture } = req.body;
  await admin.database().ref(`farms/${farmId}/sensors`).update({ moisture });
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FarmBotika server running on port ${PORT}`));
