/**
 * dialogues.js - NPC Dialogue Trees
 * Contains all dialogue data for NPCs in the game
 *
 * Dialogue Structure:
 * - Each NPC has a dialogue tree with multiple nodes
 * - Nodes contain: id, speaker, text, choices
 * - Choices can trigger actions: 'giveQuest:quest_id', 'giveMail:recipient', 'endDialogue'
 */

// Quest definitions that can be given through dialogue
export const QUESTS = {
  deliver_package: {
    id: 'deliver_package',
    title: 'Package Delivery',
    description: 'Deliver a package to the Shopkeeper',
    objectives: [
      { description: 'Deliver the package to the Shopkeeper', complete: false }
    ],
    rewards: { coins: 25, reputation: 10 },
  },
  find_sketchbook: {
    id: 'find_sketchbook',
    title: 'Lost Sketchbook',
    description: 'Help the Artist find their missing sketchbook',
    objectives: [
      { description: 'Ask around about the sketchbook', complete: false },
      { description: 'Return the sketchbook to the Artist', complete: false }
    ],
    rewards: { coins: 40, reputation: 15 },
  },
  mail_route_help: {
    id: 'mail_route_help',
    title: 'Mail Route Assistant',
    description: 'Help the Mail Carrier with deliveries',
    objectives: [
      { description: 'Deliver mail to 3 residents', complete: false }
    ],
    rewards: { coins: 50, reputation: 20 },
  },
  student_notes: {
    id: 'student_notes',
    title: 'Study Buddy',
    description: 'Help the Student with their lost notes',
    objectives: [
      { description: 'Find the notes near the north path', complete: false },
      { description: 'Return notes to the Student', complete: false }
    ],
    rewards: { coins: 30, reputation: 10 },
  },
  wanderer_stories: {
    id: 'wanderer_stories',
    title: 'Tales of the World',
    description: 'Listen to the Wanderer\'s stories',
    objectives: [
      { description: 'Visit 3 locations the Wanderer mentions', complete: false }
    ],
    rewards: { coins: 35, reputation: 25 },
  },
  // --- New quests added for variety ---
  urgent_restock: {
    id: 'urgent_restock',
    title: 'Emergency Restock',
    description: 'The Shopkeeper urgently needs supplies delivered before closing time!',
    objectives: [
      { description: 'Pick up supply crate from the Mail Carrier', complete: false },
      { description: 'Deliver supplies to the Shopkeeper', complete: false }
    ],
    rewards: { coins: 60, reputation: 15 },
    priority: 'urgent',
    timeLimit: 120,
  },
  planet_tour: {
    id: 'planet_tour',
    title: 'Grand Planet Tour',
    description: 'Deliver welcome packets to residents across the whole planet.',
    objectives: [
      { description: 'Deliver packet to the Student', complete: false },
      { description: 'Deliver packet to the Artist', complete: false },
      { description: 'Deliver packet to the Wanderer', complete: false },
      { description: 'Return to the Villager', complete: false }
    ],
    rewards: { coins: 75, reputation: 30 },
  },
  art_supplies_run: {
    id: 'art_supplies_run',
    title: 'Art Supply Run',
    description: 'Collect art supplies scattered around the planet for the Artist.',
    objectives: [
      { description: 'Find paint tubes near the east path', complete: false },
      { description: 'Find brushes near the north path', complete: false },
      { description: 'Find canvas near the south path', complete: false },
      { description: 'Bring all supplies to the Artist', complete: false }
    ],
    rewards: { coins: 55, reputation: 20 },
  },
  social_butterfly: {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Talk to every resident on the planet and learn their stories.',
    objectives: [
      { description: 'Talk to the Villager', complete: false },
      { description: 'Talk to the Shopkeeper', complete: false },
      { description: 'Talk to the Student', complete: false },
      { description: 'Talk to the Artist', complete: false },
      { description: 'Talk to the Mail Carrier', complete: false },
      { description: 'Talk to the Wanderer', complete: false }
    ],
    rewards: { coins: 100, reputation: 50 },
  },
};

// Mail items that can be given through dialogue
export const MAIL_ITEMS = {
  letter_shopkeeper: {
    id: 'letter_shopkeeper',
    from: 'Villager',
    to: 'Shopkeeper',
    priority: 'normal',
    description: 'A friendly letter',
  },
  urgent_artist: {
    id: 'urgent_artist',
    from: 'Student',
    to: 'Artist',
    priority: 'urgent',
    description: 'An urgent art supply request',
  },
  package_wanderer: {
    id: 'package_wanderer',
    from: 'Mail Carrier',
    to: 'Wanderer',
    priority: 'normal',
    description: 'A small package',
  },
  // --- New mail items ---
  supply_crate: {
    id: 'supply_crate',
    from: 'Mail Carrier',
    to: 'Shopkeeper',
    priority: 'urgent',
    description: 'A heavy supply crate - handle with care!',
  },
  welcome_packet_student: {
    id: 'welcome_packet_student',
    from: 'Villager',
    to: 'Student',
    priority: 'normal',
    description: 'A welcome packet with a hand-drawn map',
  },
  welcome_packet_artist: {
    id: 'welcome_packet_artist',
    from: 'Villager',
    to: 'Artist',
    priority: 'normal',
    description: 'A welcome packet with local flower seeds',
  },
  welcome_packet_wanderer: {
    id: 'welcome_packet_wanderer',
    from: 'Villager',
    to: 'Wanderer',
    priority: 'normal',
    description: 'A welcome packet with trail mix',
  },
  artist_thank_you: {
    id: 'artist_thank_you',
    from: 'Artist',
    to: 'Student',
    priority: 'normal',
    description: 'A hand-painted thank you card',
  },
};

/**
 * Dialogue trees for each NPC
 * Keys match NPC definition IDs from NPCData.js
 */
export const DIALOGUE_TREES = {
  // ============================================
  // VILLAGER 1 (npc-townCenter1)
  // ============================================
  'npc-townCenter1': {
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Villager',
        text: "Oh hello there! Nice day for a walk, isn't it? I don't think I've seen you around before.",
        choices: [
          { text: "I'm new here. What is this place?", nextNode: 'about_place' },
          { text: "I'm a mail carrier!", nextNode: 'mail_carrier' },
          { text: "Know everyone around here?", nextNode: 'social_intro' },
          { text: "Just passing through. Goodbye!", nextNode: null, action: 'endDialogue' },
        ],
      },
      about_place: {
        id: 'about_place',
        speaker: 'Villager',
        text: "This is our little planet! It's small, but we love it here. Everyone knows everyone. The Shopkeeper runs the store on the east path, and you'll find all sorts of interesting folks wandering around.",
        choices: [
          { text: "Sounds lovely. Anyone need help with anything?", nextNode: 'need_help' },
          { text: "I'd love to meet everyone!", nextNode: 'social_intro' },
          { text: "Thanks for the info!", nextNode: null, action: 'endDialogue' },
        ],
      },
      mail_carrier: {
        id: 'mail_carrier',
        speaker: 'Villager',
        text: "A mail carrier? Oh wonderful! Actually, I have a letter I've been meaning to send to the Shopkeeper. Would you mind delivering it for me?",
        choices: [
          { text: "Sure, I'd be happy to help!", nextNode: 'give_letter', action: 'giveMail:letter_shopkeeper' },
          { text: "Sorry, I'm a bit busy right now.", nextNode: 'busy_response' },
        ],
      },
      give_letter: {
        id: 'give_letter',
        speaker: 'Villager',
        text: "Thank you so much! The Shopkeeper is usually around the east path. They'll be so happy to receive this!",
        choices: [
          { text: "I'll get it there safely!", nextNode: null, action: 'endDialogue' },
          { text: "Anything else I can do?", nextNode: 'planet_tour_offer' },
        ],
      },
      busy_response: {
        id: 'busy_response',
        speaker: 'Villager',
        text: "No worries at all! If you change your mind, just come talk to me again.",
        choices: [
          { text: "Will do. Take care!", nextNode: null, action: 'endDialogue' },
        ],
      },
      need_help: {
        id: 'need_help',
        speaker: 'Villager',
        text: "Well, I do have this letter for the Shopkeeper... Would you mind delivering it?",
        choices: [
          { text: "Of course!", nextNode: 'give_letter', action: 'giveMail:letter_shopkeeper' },
          { text: "Maybe later.", nextNode: 'busy_response' },
        ],
      },
      social_intro: {
        id: 'social_intro',
        speaker: 'Villager',
        text: "Oh, you want to meet everyone? That's the spirit! We have the Shopkeeper, a Student, an Artist, a Mail Carrier, and a Wanderer. If you talk to all of them, you'll really feel at home here!",
        choices: [
          { text: "I'll go introduce myself to everyone!", nextNode: 'social_quest_accept', action: 'giveQuest:social_butterfly' },
          { text: "Maybe I'll bump into them naturally.", nextNode: null, action: 'endDialogue' },
        ],
      },
      social_quest_accept: {
        id: 'social_quest_accept',
        speaker: 'Villager',
        text: "Wonderful! Just walk up to each person and have a chat. Everyone here is friendly. Come back and tell me how it goes!",
        choices: [
          { text: "On my way!", nextNode: null, action: 'endDialogue' },
        ],
      },
      planet_tour_offer: {
        id: 'planet_tour_offer',
        speaker: 'Villager',
        text: "Actually, yes! I've been meaning to send welcome packets to a few people around the planet. Could you deliver them for me? One for the Student, one for the Artist, and one for the Wanderer.",
        choices: [
          { text: "A grand tour? Count me in!", nextNode: 'planet_tour_accept', action: 'giveQuest:planet_tour' },
          { text: "That's a lot of walking... maybe later.", nextNode: 'busy_response' },
        ],
      },
      planet_tour_accept: {
        id: 'planet_tour_accept',
        speaker: 'Villager',
        text: "Here are three welcome packets! *hands them over* The Student is usually near the south path, the Artist on the west side, and the Wanderer... well, they wander! Come back when you're done.",
        choices: [
          { text: "I'll deliver them all!", nextNode: null, action: 'giveMail:welcome_packet_student' },
        ],
      },
    },
  },

  // ============================================
  // SHOPKEEPER (npc-townCenter2)
  // ============================================
  'npc-townCenter2': {
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Shopkeeper',
        text: "Welcome, welcome! Always nice to see a new face around here. I'm the local shopkeeper - if you need anything, I'm your person!",
        choices: [
          { text: "What do you sell here?", nextNode: 'what_sell' },
          { text: "I have a delivery for you!", nextNode: 'delivery' },
          { text: "Need any urgent help?", nextNode: 'urgent_help' },
          { text: "Just browsing. Goodbye!", nextNode: null, action: 'endDialogue' },
        ],
      },
      what_sell: {
        id: 'what_sell',
        speaker: 'Shopkeeper',
        text: "A little bit of everything! Mostly supplies for our small community. The Artist comes by for paints, the Student needs notebooks... Say, you look like someone who could help with deliveries!",
        choices: [
          { text: "I could help with that!", nextNode: 'delivery_offer' },
          { text: "What's your busiest day like?", nextNode: 'busy_day' },
          { text: "Maybe another time.", nextNode: null, action: 'endDialogue' },
        ],
      },
      delivery: {
        id: 'delivery',
        speaker: 'Shopkeeper',
        text: "Oh wonderful! A letter from the Villager? Let me see... *reads letter* ...How thoughtful! Thank you for bringing this to me!",
        choices: [
          { text: "Happy to help!", nextNode: 'delivery_thanks' },
        ],
      },
      delivery_thanks: {
        id: 'delivery_thanks',
        speaker: 'Shopkeeper',
        text: "You know, we could use more helpful folks like you around here. If you're looking for work, I sometimes have packages that need delivering.",
        choices: [
          { text: "I'd love to help more!", nextNode: 'delivery_offer' },
          { text: "Got anything urgent?", nextNode: 'urgent_help' },
          { text: "I'll keep that in mind. Thanks!", nextNode: null, action: 'endDialogue' },
        ],
      },
      delivery_offer: {
        id: 'delivery_offer',
        speaker: 'Shopkeeper',
        text: "Excellent! I actually have a package that needs to go to the Wanderer. They're always moving around, but you might find them on the far paths. Interested?",
        choices: [
          { text: "Count me in!", nextNode: 'give_quest', action: 'giveQuest:deliver_package' },
          { text: "Not right now, but thanks.", nextNode: null, action: 'endDialogue' },
        ],
      },
      give_quest: {
        id: 'give_quest',
        speaker: 'Shopkeeper',
        text: "Here's the package. The Wanderer usually travels between the far north and far south. Good luck, and thanks again!",
        choices: [
          { text: "I'm on my way!", nextNode: null, action: 'endDialogue' },
        ],
      },
      busy_day: {
        id: 'busy_day',
        speaker: 'Shopkeeper',
        text: "Oh, you wouldn't believe it! Restock days are chaos. The Mail Carrier brings in crates and I have to sort everything before closing. Sometimes I could really use an extra pair of hands...",
        choices: [
          { text: "I could help with restocking!", nextNode: 'urgent_help' },
          { text: "Sounds hectic! Good luck with that.", nextNode: null, action: 'endDialogue' },
        ],
      },
      urgent_help: {
        id: 'urgent_help',
        speaker: 'Shopkeeper',
        text: "*looks worried* Actually, yes! I'm expecting an urgent supply crate from the Mail Carrier, but they're running late. Could you find them and bring the crate here FAST? I need it before closing!",
        choices: [
          { text: "An urgent delivery? I'm on it!", nextNode: 'urgent_accept', action: 'giveQuest:urgent_restock' },
          { text: "That sounds stressful... maybe later.", nextNode: null, action: 'endDialogue' },
        ],
      },
      urgent_accept: {
        id: 'urgent_accept',
        speaker: 'Shopkeeper',
        text: "Thank you! The Mail Carrier should be somewhere on the south or north path. Hurry - the clock is ticking! I'll make it worth your while!",
        choices: [
          { text: "I'll be back in no time!", nextNode: null, action: 'endDialogue' },
        ],
      },
    },
  },

  // ============================================
  // STUDENT (npc-student)
  // ============================================
  'npc-student': {
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Student',
        text: "*huffing* Oh, hi! Sorry, I'm always running late for something. Are you new here?",
        choices: [
          { text: "Yes, just arrived. Why the rush?", nextNode: 'why_rush' },
          { text: "Need any help with anything?", nextNode: 'need_help' },
          { text: "What are you studying?", nextNode: 'studying' },
          { text: "I won't keep you. Bye!", nextNode: null, action: 'endDialogue' },
        ],
      },
      why_rush: {
        id: 'why_rush',
        speaker: 'Student',
        text: "I'm studying to be a cartographer! Someone has to map this little planet, right? But I keep losing my notes... I think I dropped some near the north path earlier.",
        choices: [
          { text: "I could look for them!", nextNode: 'offer_help' },
          { text: "A cartographer? Tell me more!", nextNode: 'studying' },
          { text: "Good luck with that!", nextNode: null, action: 'endDialogue' },
        ],
      },
      need_help: {
        id: 'need_help',
        speaker: 'Student',
        text: "Actually... yes! I lost some important study notes somewhere near the north path. Would you mind looking for them?",
        choices: [
          { text: "Sure, I'll find them!", nextNode: 'offer_help' },
          { text: "Sorry, I can't right now.", nextNode: 'cant_help' },
        ],
      },
      studying: {
        id: 'studying',
        speaker: 'Student',
        text: "I'm mapping every path and landmark on this planet! It's trickier than it sounds - everything curves back on itself. The Wanderer has been to every corner and gives great tips. You should talk to them!",
        choices: [
          { text: "Sounds fascinating! Need help with anything?", nextNode: 'need_help' },
          { text: "I'll seek out the Wanderer. Thanks!", nextNode: null, action: 'endDialogue' },
        ],
      },
      offer_help: {
        id: 'offer_help',
        speaker: 'Student',
        text: "Really? You're a lifesaver! The notes should be somewhere near the north path. They're in a blue folder. I also need to send an urgent message to the Artist about some art supplies!",
        choices: [
          { text: "I'll find your notes AND deliver the message!", nextNode: 'accept_both', action: 'giveQuest:student_notes' },
          { text: "Just the notes for now.", nextNode: 'accept_notes', action: 'giveQuest:student_notes' },
        ],
      },
      accept_both: {
        id: 'accept_both',
        speaker: 'Student',
        text: "Thank you so much! Here's the message for the Artist - it's urgent! *hands you a note* The Artist usually hangs around the west path.",
        choices: [
          { text: "I'll take care of everything!", nextNode: null, action: 'giveMail:urgent_artist' },
        ],
      },
      accept_notes: {
        id: 'accept_notes',
        speaker: 'Student',
        text: "Thanks! I really appreciate it. Come find me when you have them!",
        choices: [
          { text: "Will do!", nextNode: null, action: 'endDialogue' },
        ],
      },
      cant_help: {
        id: 'cant_help',
        speaker: 'Student',
        text: "No worries! If you change your mind, the notes are somewhere near the north path. Gotta run!",
        choices: [
          { text: "Good luck!", nextNode: null, action: 'endDialogue' },
        ],
      },
    },
  },

  // ============================================
  // ARTIST (npc-artist)
  // ============================================
  'npc-artist': {
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Artist',
        text: "*gazing at the sky* Oh! Hello there. Isn't the light just beautiful today? I could paint this forever...",
        choices: [
          { text: "It really is beautiful here.", nextNode: 'appreciate_beauty' },
          { text: "I have a message for you from the Student.", nextNode: 'student_message' },
          { text: "Are you working on something?", nextNode: 'working_on' },
          { text: "I'll let you enjoy the view. Bye!", nextNode: null, action: 'endDialogue' },
        ],
      },
      appreciate_beauty: {
        id: 'appreciate_beauty',
        speaker: 'Artist',
        text: "You have an eye for beauty! Not everyone stops to appreciate the little things. Say, would you like to help me with something? I've lost my favorite sketchbook somewhere on this planet...",
        choices: [
          { text: "I'll help you look for it!", nextNode: 'sketchbook_quest', action: 'giveQuest:find_sketchbook' },
          { text: "Hmm, anything else you need?", nextNode: 'supplies_needed' },
          { text: "Sorry, I'm a bit busy.", nextNode: 'busy' },
        ],
      },
      student_message: {
        id: 'student_message',
        speaker: 'Artist',
        text: "*reads note* Oh my, the Student needs more art supplies urgently? I'll have to visit the Shopkeeper right away. Thank you for delivering this!",
        choices: [
          { text: "Happy to help! Need anything else?", nextNode: 'need_else' },
          { text: "You're welcome. Take care!", nextNode: null, action: 'endDialogue' },
        ],
      },
      need_else: {
        id: 'need_else',
        speaker: 'Artist',
        text: "Actually... I've been looking for my sketchbook. I must have set it down somewhere while painting. Would you keep an eye out for it?",
        choices: [
          { text: "Of course! I'll look for it.", nextNode: 'sketchbook_quest', action: 'giveQuest:find_sketchbook' },
          { text: "What about art supplies?", nextNode: 'supplies_needed' },
          { text: "I'll try to remember.", nextNode: null, action: 'endDialogue' },
        ],
      },
      working_on: {
        id: 'working_on',
        speaker: 'Artist',
        text: "I'm trying to capture the essence of our little world! But I've hit a creative block... and I can't find my sketchbook anywhere. It has all my best ideas in it.",
        choices: [
          { text: "Let me help you find it!", nextNode: 'sketchbook_quest', action: 'giveQuest:find_sketchbook' },
          { text: "Maybe new supplies would help?", nextNode: 'supplies_needed' },
          { text: "I hope inspiration finds you soon!", nextNode: 'busy' },
        ],
      },
      sketchbook_quest: {
        id: 'sketchbook_quest',
        speaker: 'Artist',
        text: "You would? Oh, thank you! I last remember having it near the far north, watching the sunset. But I've wandered so much since then... Ask around, maybe someone has seen it?",
        choices: [
          { text: "I'll find it!", nextNode: null, action: 'endDialogue' },
        ],
      },
      supplies_needed: {
        id: 'supplies_needed',
        speaker: 'Artist',
        text: "*eyes light up* You know what, I AM running low on supplies! I dropped paint tubes near the east path, left brushes by the north path, and my last canvas blew away toward the south. If you could gather them...",
        choices: [
          { text: "A scavenger hunt for art supplies? Fun!", nextNode: 'supplies_quest_accept', action: 'giveQuest:art_supplies_run' },
          { text: "That's a lot of ground to cover...", nextNode: 'busy' },
        ],
      },
      supplies_quest_accept: {
        id: 'supplies_quest_accept',
        speaker: 'Artist',
        text: "You're a lifesaver! Paint tubes east, brushes north, canvas south. Bring them all back and I'll paint you something special! Oh, and please send a thank-you card to the Student for me.",
        choices: [
          { text: "I'll find everything!", nextNode: null, action: 'giveMail:artist_thank_you' },
        ],
      },
      busy: {
        id: 'busy',
        speaker: 'Artist',
        text: "That's alright. The muse will return when she's ready. Safe travels, friend!",
        choices: [
          { text: "Goodbye!", nextNode: null, action: 'endDialogue' },
        ],
      },
    },
  },

  // ============================================
  // MAIL CARRIER (npc-mailCarrier)
  // ============================================
  'npc-mailCarrier': {
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Mail Carrier',
        text: "Hey there! Another mail carrier, huh? Or just getting started? This planet may be small, but there's always mail to deliver!",
        choices: [
          { text: "Any tips for a newcomer?", nextNode: 'tips' },
          { text: "Need help with your route?", nextNode: 'help_route' },
          { text: "The Shopkeeper needs a supply crate urgently!", nextNode: 'supply_crate' },
          { text: "Just saying hi! Keep up the good work!", nextNode: null, action: 'endDialogue' },
        ],
      },
      tips: {
        id: 'tips',
        speaker: 'Mail Carrier',
        text: "First rule: learn the paths! Town center connects to everywhere. North and south paths are the longest routes. And always be friendly - happy residents mean better tips!",
        choices: [
          { text: "That's helpful! Can I help you with deliveries?", nextNode: 'help_route' },
          { text: "What's the hardest part of the job?", nextNode: 'hardest_part' },
          { text: "Thanks for the advice!", nextNode: null, action: 'endDialogue' },
        ],
      },
      hardest_part: {
        id: 'hardest_part',
        speaker: 'Mail Carrier',
        text: "Keeping up with demand! Some days the mail just piles up. And urgent deliveries? Those are the worst - everyone wants their stuff yesterday! But the coins are good, and the exercise is great.",
        choices: [
          { text: "I could take some off your hands!", nextNode: 'help_route' },
          { text: "Sounds tough but rewarding!", nextNode: null, action: 'endDialogue' },
        ],
      },
      help_route: {
        id: 'help_route',
        speaker: 'Mail Carrier',
        text: "Would you? That'd be fantastic! I've got more mail than I can handle today. Think you can deliver to three residents? I'll split the pay with you!",
        choices: [
          { text: "I'm in! Hand over those letters!", nextNode: 'accept_route', action: 'giveQuest:mail_route_help' },
          { text: "Maybe another time.", nextNode: 'decline_route' },
        ],
      },
      accept_route: {
        id: 'accept_route',
        speaker: 'Mail Carrier',
        text: "Here you go - three pieces of mail! One for the Villager at town center, one for the Student on the south path, and one for the Artist on the west path. Good luck!",
        choices: [
          { text: "Consider it done!", nextNode: null, action: 'endDialogue' },
        ],
      },
      decline_route: {
        id: 'decline_route',
        speaker: 'Mail Carrier',
        text: "No problem! The offer stands whenever you're ready. This little planet isn't going anywhere! *chuckles*",
        choices: [
          { text: "I'll keep that in mind. See you around!", nextNode: null, action: 'endDialogue' },
        ],
      },
      supply_crate: {
        id: 'supply_crate',
        speaker: 'Mail Carrier',
        text: "Oh no, I completely forgot about the Shopkeeper's crate! *rummages through bag* Here it is! Can you take it over? I'm swamped with other deliveries right now.",
        choices: [
          { text: "Hand it over, I'll rush it there!", nextNode: 'supply_crate_accept', action: 'giveMail:supply_crate' },
          { text: "You should deliver it yourself...", nextNode: 'decline_route' },
        ],
      },
      supply_crate_accept: {
        id: 'supply_crate_accept',
        speaker: 'Mail Carrier',
        text: "You're a legend! The Shopkeeper is on the east path. Hurry - they said it was urgent! And tell them I'm sorry for the delay!",
        choices: [
          { text: "On my way!", nextNode: null, action: 'endDialogue' },
        ],
      },
    },
  },

  // ============================================
  // WANDERER (npc-wanderer)
  // ============================================
  'npc-wanderer': {
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Wanderer',
        text: "Ah, a fellow traveler! I've been walking this little world for ages. Every corner has a story, you know.",
        choices: [
          { text: "Tell me about this place!", nextNode: 'tell_stories' },
          { text: "I have a package for you from the Shopkeeper.", nextNode: 'receive_package' },
          { text: "What's your favorite spot?", nextNode: 'favorite_spot' },
          { text: "Safe travels! Goodbye.", nextNode: null, action: 'endDialogue' },
        ],
      },
      tell_stories: {
        id: 'tell_stories',
        speaker: 'Wanderer',
        text: "Oh, where to begin? The far north has the most beautiful sunsets. The southeast has the coziest little nook. And town center... that's where everyone gathers. You should visit them all!",
        choices: [
          { text: "That sounds like a quest!", nextNode: 'story_quest', action: 'giveQuest:wanderer_stories' },
          { text: "What about the other residents?", nextNode: 'about_residents' },
          { text: "Maybe someday. Thanks for sharing!", nextNode: null, action: 'endDialogue' },
        ],
      },
      about_residents: {
        id: 'about_residents',
        speaker: 'Wanderer',
        text: "Everyone here has their own charm. The Villager is the heart of town center, always welcoming. The Student is mapping the whole planet - ambitious! The Artist captures beauty on canvas. And the Mail Carrier? Busiest person on the planet.",
        choices: [
          { text: "Sounds like a great community!", nextNode: 'community' },
          { text: "Who's the most interesting?", nextNode: 'most_interesting' },
          { text: "Thanks for the rundown!", nextNode: null, action: 'endDialogue' },
        ],
      },
      community: {
        id: 'community',
        speaker: 'Wanderer',
        text: "It really is. Small but tightly knit. Everyone looks out for each other. That's what makes this planet special - not the views (though those are wonderful), but the people.",
        choices: [
          { text: "I'd love to explore and meet everyone!", nextNode: 'story_quest', action: 'giveQuest:wanderer_stories' },
          { text: "That's heartwarming. Take care!", nextNode: null, action: 'endDialogue' },
        ],
      },
      most_interesting: {
        id: 'most_interesting',
        speaker: 'Wanderer',
        text: "*laughs* That's like asking which star is brightest! But if pressed... the Artist sees things nobody else notices. Go talk to them on the west path - you might see the world differently.",
        choices: [
          { text: "I'll seek them out!", nextNode: null, action: 'endDialogue' },
          { text: "Tell me more about the planet instead.", nextNode: 'tell_stories' },
        ],
      },
      story_quest: {
        id: 'story_quest',
        speaker: 'Wanderer',
        text: "A quest! I like that spirit! Visit the far north, the southeast corner, and spend some time at town center. Come back and tell me what you discover. Every traveler sees the world differently.",
        choices: [
          { text: "I'll explore them all!", nextNode: null, action: 'endDialogue' },
        ],
      },
      receive_package: {
        id: 'receive_package',
        speaker: 'Wanderer',
        text: "*eyes light up* From the Shopkeeper? Wonderful! I ordered some walking supplies ages ago! *opens package* Perfect! New soles for my shoes. Thank you, friend!",
        choices: [
          { text: "Glad I could help! Any stories to share?", nextNode: 'tell_stories' },
          { text: "Know any secrets about this place?", nextNode: 'secrets' },
          { text: "You're welcome! Happy wandering!", nextNode: null, action: 'endDialogue' },
        ],
      },
      secrets: {
        id: 'secrets',
        speaker: 'Wanderer',
        text: "*leans in* Well... have you noticed how the sky changes? Press N and watch. Day and night feel completely different here. And if you listen closely at night, you can hear the planet hum. Or maybe that's just the fireflies...",
        choices: [
          { text: "I'll pay attention next time!", nextNode: 'favorite_spot' },
          { text: "Magical! Thanks for sharing.", nextNode: null, action: 'endDialogue' },
        ],
      },
      favorite_spot: {
        id: 'favorite_spot',
        speaker: 'Wanderer',
        text: "Hard to choose! But if I had to... the far north during sunset. The way the light hits the horizon from up there... *sighs contentedly* Pure magic.",
        choices: [
          { text: "I'll have to visit it!", nextNode: 'visit_north' },
          { text: "Sounds beautiful. Thanks!", nextNode: null, action: 'endDialogue' },
        ],
      },
      visit_north: {
        id: 'visit_north',
        speaker: 'Wanderer',
        text: "You should! And while you're exploring, why not visit a few more spots? I'll tell you about the best ones. It'll be like... a little adventure!",
        choices: [
          { text: "I love adventures! Sign me up!", nextNode: 'story_quest', action: 'giveQuest:wanderer_stories' },
          { text: "Maybe later. Thanks for the tip!", nextNode: null, action: 'endDialogue' },
        ],
      },
    },
  },
};

/**
 * Get dialogue tree for an NPC
 * @param {string} npcId - The NPC's definition id
 * @returns {object|null} The dialogue tree or null if not found
 */
export function getDialogueTree(npcId) {
  return DIALOGUE_TREES[npcId] || null;
}

/**
 * Get a specific dialogue node
 * @param {string} npcId - The NPC's definition id
 * @param {string} nodeId - The dialogue node id
 * @returns {object|null} The dialogue node or null if not found
 */
export function getDialogueNode(npcId, nodeId) {
  const tree = DIALOGUE_TREES[npcId];
  if (!tree) return null;
  return tree.nodes[nodeId] || null;
}

/**
 * Get quest data by id
 * @param {string} questId - The quest id
 * @returns {object|null} The quest data or null if not found
 */
export function getQuest(questId) {
  return QUESTS[questId] || null;
}

/**
 * Get mail item data by id
 * @param {string} mailId - The mail item id
 * @returns {object|null} The mail item data or null if not found
 */
export function getMailItem(mailId) {
  return MAIL_ITEMS[mailId] || null;
}
