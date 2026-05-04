const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));

// TEMP DATABASE (resets if server restarts)
let data = {};

// HOME
app.get("/", (req, res) => {
  res.send(`
    <h1>Curioustok 👀</h1>
    <p>Anonymous Q&A like Curious Cat</p>
    <p>Create profile: /username</p>
  `);
});

// PROFILE PAGE
app.get("/:username", (req, res) => {
  const user = req.params.username;

  if (!data[user]) {
    data[user] = { questions: [] };
  }

  const html = data[user].questions.map((q, i) => {
    return `
      <div style="margin:10px;padding:10px;border:1px solid #ccc;">
        <p>❓ ${q.text}</p>

        ${
          q.answer
            ? `<p>💬 ${q.answer}</p>`
            : `
              <form method="POST" action="/answer/${user}/${i}">
                <input name="answer" placeholder="Answer here" required />
                <button type="submit">Reply</button>
              </form>
            `
        }
      </div>
    `;
  }).join("");

  res.send(`
    <h1>@${user}</h1>
    <a href="/ask/${user}">Ask anonymously 👀</a>
    <hr/>
    ${html}
  `);
});

// ASK PAGE
app.get("/ask/:username", (req, res) => {
  const user = req.params.username;

  res.send(`
    <h2>Ask ${user} anonymously</h2>
    <form method="POST" action="/ask/${user}">
      <textarea name="message" required></textarea><br/>
      <button type="submit">Send</button>
    </form>
  `);
});

// SAVE QUESTION
app.post("/ask/:username", (req, res) => {
  const user = req.params.username;
  const message = req.body.message;

  if (!data[user]) {
    data[user] = { questions: [] };
  }

  data[user].questions.push({
    text: message,
    answer: null
  });

  res.send(`Sent 👀 <a href="/${user}">Go back</a>`);
});

// ANSWER QUESTION
app.post("/answer/:username/:id", (req, res) => {
  const user = req.params.username;
  const id = req.params.id;
  const answer = req.body.answer;

  data[user].questions[id].answer = answer;

  res.redirect(`/${user}`);
});

// EXPORT FOR VERCEL (IMPORTANT FIX)
module.exports = app;
