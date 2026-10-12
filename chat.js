/* ============================================================
   CHAT ENGINE — an endless, coherent conversation for the
   "Chatty" card. Instead of random one-liners, the engine knows
   a stack of complete mini-dialogues that actually make sense.
   It plays one through (typing pauses, alternating speakers),
   then starts another at random — so the chat flows forever
   and never feels like a loop. Reduced-motion visitors get a
   calm, static exchange instead.
   ============================================================ */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const CONVERSATIONS = [
  ["hi! 👋", "hey! how was the weekend? 🙂", "pretty good — built a new game 🎮", "no way! send me the link 🤩"],
  ["wanna play something? 🎮", "sure — obby or tycoon?", "tycoon, obviously 💵", "haha, race you to a million 😄"],
  ["did you see the lightning last night? ⚡", "yes!! the whole sky lit up 😲", "I tried to film it 🎥", "send the video!! 🎬"],
  ["guess what? 🤔", "what?", "I finished my new song 🎵", "that's awesome! play it for me 🎧"],
  ["brb, dinner 🍝", "ok, save my spot 😄", "back! what did I miss?", "nothing much — the chat missed you 🥲"],
  ["random question: planets or stars? 🪐", "planets. moons are cozy 🌙", "bold choice 😏", "the Moon IS pretty great 🌕"],
  ["homework done? 📚", "mostly… just the math page left ➗", "want the study notes? 📝", "you're the best 🙌"],
  ["I'm bored 😑", "so invent a game 💡", "good idea… an obstacle course in space 🚀", "I call dibs on testing it 🕹️"],
  ["what's the weather doing? ⛅", "raining again 🌧️", "perfect for a stormy song 🎶", "that's literally your whole playlist 😂"],
  ["ok, one more round 🔁", "you said that three rounds ago 🙄", "this time I mean it 😤", "haha, sure you do 😆"],
  ["new high score! 🏆", "screenshot or it didn't happen 📸", "sending it now", "ok, that's actually wild 🔥"],
  ["do you think aliens like music? 👽", "obviously — that's what static is 📻", "haha, cosmic radio ✨", "the universe is chatty 🌌"],
  ["I named my plant 🌱", "what's its name?", "Captain Leaves 🍃", "promoted to Admiral immediately 🎖️"],
  ["tea or hot chocolate? ☕", "hot chocolate, no contest 🍫", "correct answer ✅", "team cocoa forever 🍫"],
];

function makeBubble(text, side) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble--${side}`;
  bubble.textContent = text;
  return bubble;
}

function makeTyping(side) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble--${side} chat-typing`;
  bubble.innerHTML = "<span></span><span></span><span></span>";
  return bubble;
}

function startChat(scene) {
  const log = scene.querySelector(".chat-log");
  if (!log) return;

  const trim = () => {
    while (log.children.length > 6) log.firstElementChild.remove();
  };

  const say = (text, side) => {
    const bubble = makeBubble(text, side);
    bubble.addEventListener("animationend", () => bubble.remove());
    log.appendChild(bubble);
    trim();
  };

  const other = (side) => (side === "left" ? "right" : "left");
  let nextSpeaker = Math.random() < 0.5 ? "left" : "right";

  function playConversation() {
    const convo = CONVERSATIONS[Math.floor(Math.random() * CONVERSATIONS.length)];
    let line = 0;

    const step = () => {
      if (line >= convo.length) {
        // Conversation over — a fresh one begins after a natural pause
        setTimeout(playConversation, 1400 + Math.random() * 1800);
        return;
      }

      const text = convo[line++];
      const speaker = nextSpeaker;
      nextSpeaker = other(nextSpeaker);

      // Longer replies sometimes "type" first, like a real person
      const thinksAboutIt = text.length > 10 && Math.random() < 0.45;
      const delay = thinksAboutIt ? 750 + Math.random() * 450 : 0;
      let typingBubble = null;

      if (thinksAboutIt) {
        typingBubble = makeTyping(speaker);
        log.appendChild(typingBubble);
        trim();
      }

      setTimeout(() => {
        if (typingBubble) typingBubble.remove();
        say(text, speaker);
        // People take longer to type longer messages
        setTimeout(step, 600 + Math.min(2400, text.length * 55));
      }, delay);
    };

    step();
  }

  playConversation();
}

if (prefersReducedMotion) {
  // Calm version: one friendly exchange, no animation loop
  document.querySelectorAll("[data-chat] .chat-log").forEach((log) => {
    const convo = CONVERSATIONS[0];
    convo.slice(0, 3).forEach((text, i) => {
      log.appendChild(makeBubble(text, i % 2 === 0 ? "left" : "right"));
    });
  });
} else {
  document.querySelectorAll("[data-chat]").forEach(startChat);
}
