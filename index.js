const makeWASocket = require("@whiskeysockets/baileys").default
const { useMultiFileAuthState } = require("@whiskeysockets/baileys")
const pino = require("pino")
const PHONE_NUMBER = "263776752205"
async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["ZOITA", "Chrome", "1.0"]
  })
  sock.ev.on("creds.update", saveCreds)
  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PHONE_NUMBER)
        console.log(`\n\nYOUR PAIRING CODE IS: ${code}\n\n`)
      } catch(e){ console.log("Error getting code", e) }
    }, 3000)
  }
  sock.ev.on("connection.update", u => {
    if(u.connection === "open") console.log("BOT ONLINE 24/7 READY")
  })
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if(!msg.message || msg.key.fromMe) return
    const e = ["👋","🔥","👍","😎"][Math.floor(Math.random()*3)]
    await sock.sendMessage(msg.key.remoteJid, { react: { text: e, key: msg.key } })
    console.log("Reacted with " + e)
  })
}
start()
