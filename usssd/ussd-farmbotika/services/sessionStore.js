// Simple in-memory session store for USSD sessions

const sessions = {};

function getSession(sessionId) {
    return sessions[sessionId] || null;
}

function saveSession(sessionId, data) {
    sessions[sessionId] = data;
}

function deleteSession(sessionId) {
    delete sessions[sessionId];
}

module.exports = {
    getSession,
    saveSession,
    deleteSession
};