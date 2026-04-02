export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  format: 'video' | 'audio' | 'text' | 'practice';
  duration: string;
  content: string;
}

export interface CourseDay {
  day: number;
  title: string;
  theme: string;
  lessons: CourseLesson[];
}

export const courseBlueprint: CourseDay[] = [
  {
    day: 1,
    title: "Entering Hanuman's Energy",
    theme: "Who is Hanuman, what is sadhana, intention & safety",
    lessons: [
      {
        id: "1.1",
        title: "What Is Hanuman Sadhana?",
        description: "A clear, grounded introduction to sadhana and why Hanuman is the perfect guide.",
        format: "text",
        duration: "5 min",
        content: "In spiritual traditions, sadhana simply means a disciplined, daily practice that connects you to the Divine and transforms your inner world. It is not about running away from life – it is about entering life with more clarity, strength, and love.\n\nIn this course, your path of sadhana is guided by Shri Hanuman – the fearless devotee of Shri Ram, celebrated for his unshakable courage, immense strength, razor-sharp intelligence, and complete humility.\n\nWhen you remember Hanuman, you are not just worshipping a form. You are awakening Hanuman's qualities inside yourself – the part of you that does not give up, that stands for dharma, that serves selflessly, and that bows only to truth.\n\nOver the next 7 days, you will learn a simple and powerful way to connect with Hanuman through daily chanting, Hanuman Chalisa, gentle discipline, and inner reflection. This is not a complicated ritual course. It is a heart-based journey to become more fearless, focused, and devoted."
      },
      {
        id: "1.2",
        title: "Your Sankalp: Why Are You Here?",
        description: "Create a clear inner sankalp (resolve) and learn important do's and don'ts before you begin.",
        format: "text",
        duration: "5 min",
        content: "Before any sadhana, it is essential to know why you are practicing. This is called your sankalp – a heartfelt resolve you offer at the feet of the Divine.\n\nTake a moment to notice: What brings you to Hanuman today? It may be fear, stress, health challenges, family issues, or simply a longing to connect more deeply with the Divine. Whatever it is, hold it gently in your heart.\n\nNow refine your intention. Instead of 'I want to control others' or 'I want revenge,' let your sankalp be rooted in healing, courage, clarity, and dharma. This is the traditional spirit of Hanuman sadhana – to remove inner and outer obstacles, increase strength, and walk a more truthful life.\n\nA gentle reminder: this course is not meant to replace medical or psychological treatment. If you are facing serious mental or physical difficulties, continue working with trusted professionals. Let this sadhana support you – not become your only support.\n\nIn this journey, you commit to ahimsa (non-harm), truthful living, and respect for yourself and others. You will not use any mantra or practice to harm, manipulate, or dominate another being. With this clarity, your path becomes aligned with Hanuman's own pure devotion."
      },
      {
        id: "1.3",
        title: "Guided Connection to Hanuman",
        description: "Create an emotional, imaginal connection with Hanuman as a living presence.",
        format: "practice",
        duration: "5-10 min",
        content: "Sit comfortably. Close your eyes. Let your breath settle into a natural, relaxed rhythm.\n\nVisualize a gentle light at your heart center. Within this light, see Hanuman's form—strong, peaceful, and devoted.\n\nSoftly repeat the name 'Jai Hanuman' or 'Shri Hanumate Namah' a few times in your mind.\n\nEnd with a short prayer: 'Hanuman, guide me on this 7-day journey. Grant me the strength to face my fears and the devotion to walk in truth.'"
      }
    ]
  },
  {
    day: 2,
    title: "Preparing Your Life & Space",
    theme: "Lifestyle rules, space setup, basic routine",
    lessons: [
      {
        id: "2.1",
        title: "Create Your Hanuman Corner",
        description: "Step-by-step guidance to set up a clean, energized space for your daily Hanuman sadhana.",
        format: "text",
        duration: "5 min",
        content: "A dedicated space helps your mind slip into sadhana more easily. When you return to the same spot each day, the energy of your devotion gradually builds there.\n\nChoose a quiet, clean corner where you can sit comfortably. Place a small table or shelf. Cover it with a clean cloth. On this, keep a picture or murti of Shri Hanuman. If you like, you can also place images of Shri Ram, Sita, and Lakshman to remind yourself of Hanuman's devotion.\n\nAdd a small diya (preferably with ghee or sesame oil), some incense, and a small bowl or plate where you can offer flowers or simple prasad like fruit or sweets. Do not worry about perfection – sincerity is more important than decoration.\n\nWhenever you begin your practice, first clean the space, light the diya, and mentally invite Hanuman into your home and heart."
      },
      {
        id: "2.2",
        title: "How to Live During These 7 Days",
        description: "Simple lifestyle guidelines that support your Hanuman sadhana without making your life rigid or extreme.",
        format: "text",
        duration: "5 min",
        content: "Sadhana is not just what you do in front of the altar. It is also how you live between your practice sessions. Traditional Hanuman sadhana places a lot of importance on purity, discipline, and respect.\n\nFor the next 7 days, try to follow these simple Hanuman Disciplines:\n\n- Cleanliness: Bathe daily and wear clean, modest clothes during practice. Keep your altar area tidy.\n- Speech: Avoid gossip, lies, harsh words, and unnecessary arguments. Speak less, and when you speak, choose kindness and truth.\n- Food: As much as possible, eat fresh, sattvic food. Minimize or avoid alcohol, tobacco, and other intoxicants. If you can, reduce non-vegetarian food during these days.\n- Brahmacharya: Use your vital energy wisely. Respect your own body and the bodies of others. Reduce over-stimulation (excessive social media, etc.).\n- Seva: Each day, perform a small act of service without expecting anything in return.\n\nYou do not have to be perfect. Treat these as loving commitments, not punishments. If you slip, gently return to your disciplines without guilt."
      },
      {
        id: "2.3",
        title: "First Simple Hanuman Puja",
        description: "Experience a gentle, simple puja you can repeat daily.",
        format: "practice",
        duration: "10 min",
        content: "1. Stand or sit before the altar. Take 3 deep breaths.\n2. Mentally touch your head and heart and silently say: 'I bow to Shri Hanuman and invite you into my home and heart.'\n3. Light the diya and incense (if safe).\n4. Offer a flower or simple prasad.\n5. Join your palms and close your eyes for 1–2 minutes in silent gratitude.\n6. End with a simple prayer in your own words, or: 'Hanuman, bless me with strength, courage, clarity, and devotion.'"
      }
    ]
  },
  {
    day: 3,
    title: "Voice of Devotion",
    theme: "Introduction to Hanuman Chalisa and simple mantra",
    lessons: [
      {
        id: "3.1",
        title: "Hanuman Chalisa: Your Daily Shield",
        description: "Understand what Hanuman Chalisa is, how it is structured, and why millions rely on it daily.",
        format: "text",
        duration: "5 min",
        content: "The Hanuman Chalisa is one of the most loved prayers in the world. It was composed by the saint Tulsidas and contains a brief opening, forty verses praising Hanuman's qualities and deeds, and a closing section of blessings.\n\nEach verse is like a doorway into Hanuman's character – his strength, intelligence, humility, and unshakeable devotion to Shri Ram. When you recite the Chalisa regularly, you are not just chanting words. You are soaking your mind in these qualities, again and again.\n\nMany practitioners experience less fear, more courage, protection from negativity, and inner stability when they maintain a regular Chalisa practice.\n\nIn this course, you will not be forced to memorize it immediately. Instead, you will slowly become familiar with its sound, rhythm, and meaning. Over time, you may naturally remember more and more of it."
      },
      {
        id: "3.2",
        title: "Your Daily Mantra: Japa With Hanuman",
        description: "Learn a simple Hanuman mantra and how to chant it with a mala or using the in-app counter.",
        format: "text",
        duration: "5 min",
        content: "Along with Hanuman Chalisa, many devotees chant a short mantra to keep Hanuman's presence with them throughout the day. In this course, you will work with a simple, widely used mantra:\n\n'Om Hanumate Namah' – I bow to Hanuman, the divine helper and protector.\n\nYou can chant this mantra on a mala, counting each bead, or you can simply tap along with the in-app japa counter in the Sadhana tab. In the beginning, aim for 11 or 21 repetitions each day. Focus more on sincerity than on speed.\n\nAs you chant, gently bring your attention back whenever the mind wanders. Visualize Hanuman in your heart – bright, strong, and smiling – blessing you with courage and clarity."
      },
      {
        id: "3.3",
        title: "Chant 'Om Hanumate Namah'",
        description: "Practice chanting the mantra 21 times.",
        format: "practice",
        duration: "5 min",
        content: "Go to the Sadhana tab, select the 'Om Hanumate Namah' mantra preset, and complete 21 chants using the Digital Mala."
      }
    ]
  },
  {
    day: 4,
    title: "Building Daily Flow",
    theme: "Morning–evening sadhana pattern",
    lessons: [
      {
        id: "4.1",
        title: "Your Morning With Hanuman",
        description: "A simple, repeatable morning sequence to energize your body, mind, and devotion.",
        format: "text",
        duration: "5 min",
        content: "For the next 10–15 minutes, your only responsibility is to be fully here. Over time, this will become the strongest part of your day.\n\n1. Wake and cleanse (1–2 min): Wash face, hands, and mouth; if possible, bathe before practice.\n2. Centering breath (2 min): 10–12 slow, deep breaths.\n3. Short physical warm-up (3–4 min): Gentle stretches to awaken the body.\n4. Mantra japa (3–5 min): 21 repetitions of 'Om Hanumate Namah'.\n5. Chalisa (2–3 min): Listen to or recite the Hanuman Chalisa."
      },
      {
        id: "4.2",
        title: "Close the Day at Hanuman's Feet",
        description: "Wind down with a short puja, a few minutes of chanting, and honest reflection.",
        format: "text",
        duration: "5 min",
        content: "1. Light a diya at the altar.\n2. Offer a flower or a small sweet (or even just water with devotion).\n3. Chant either the Chalisa once, or a shorter combination (few verses + mantra).\n4. Sit quietly for 2–3 minutes and review your day in Hanuman's presence – where you acted with courage and truth, and where you lost balance.\n5. End with: 'Hanuman, thank you for today. Help me do better tomorrow.'"
      },
      {
        id: "4.3",
        title: "Evening Reflection",
        description: "Reflect on your day's actions.",
        format: "practice",
        duration: "5 min",
        content: "Ask yourself:\n- Where did I act from fear today?\n- Where did I act from courage and love?\n- One thing I want to improve tomorrow is...\n\n(You can log this in your journal on the Profile tab)."
      }
    ]
  },
  {
    day: 5,
    title: "Courage & Strength",
    theme: "Hanuman stories + inner work",
    lessons: [
      {
        id: "5.1",
        title: "Remembering Your Hidden Strength",
        description: "The story of Hanuman's ocean leap as a teaching on self-doubt, courage, and trust.",
        format: "text",
        duration: "5 min",
        content: "When the Vanara army reached the ocean, they despaired. How could they cross it to reach Lanka? Hanuman sat quietly, having forgotten his own divine strength due to a childhood curse.\n\nJambavan, the wise bear, approached Hanuman and reminded him of his true nature, his divine birth, and his limitless power. Upon hearing this, Hanuman grew in size, his self-doubt vanished, and he took a joyous, effortless leap across the ocean.\n\nWhere in your life right now are you standing at the edge of your own 'ocean' – thinking it is impossible to cross? What if, like Hanuman, you are much stronger than you remember? Today, offer this situation to Hanuman and ask for the courage to take the first leap."
      },
      {
        id: "5.2",
        title: "Chant Through Your Fear",
        description: "Use today's mantra round to name a specific fear and chant through it with Hanuman's support.",
        format: "practice",
        duration: "10 min",
        content: "Bring to mind one fear or situation that feels like a huge ocean in front of you. Do not fight it, just see it clearly.\n\nNow, as you chant 'Om Hanumate Namah' 51 times, imagine Hanuman growing larger and brighter in your heart, and your fear becoming smaller in his light. With each repetition, let one layer of tension drop from your body and mind.\n\nYou are not chanting to escape your life; you are chanting to walk into it with Hanuman by your side."
      }
    ]
  },
  {
    day: 6,
    title: "Devotion & Surrender",
    theme: "Bhakti, humility, service",
    lessons: [
      {
        id: "6.1",
        title: "Power With a Bowed Head",
        description: "A heart-opening story on how true strength always bows to love and truth.",
        format: "text",
        duration: "5 min",
        content: "After extraordinary feats—leaping the ocean, burning Lanka, bringing the Sanjeevani mountain—Hanuman never demanded a reward. When Shri Ram asked how he could repay him, Hanuman simply asked to remain his devoted servant forever.\n\nHis joy is in serving Rama and Sita. This becomes a mirror for how we can bring devotion and service into ordinary life. True strength does not need to boast; it finds its highest expression in humble service."
      },
      {
        id: "6.2",
        title: "Serve Like Hanuman, Where You Are",
        description: "Turn your devotion into action through small, consistent acts of service.",
        format: "practice",
        duration: "Throughout the day",
        content: "Hanuman's devotion is not passive. It is active, courageous service. You may not be crossing oceans or fighting demons, but you can live the same spirit of seva in daily life.\n\nAsk yourself today: 'Who can I support today?' It could be as simple as listening deeply to a friend, helping at home without being asked, feeding a hungry being, or giving your time and skills to someone who needs them.\n\nWhen done with the thought, 'Hanuman, please accept this as my little seva,' even a small act becomes sacred."
      }
    ]
  },
  {
    day: 7,
    title: "Completion & Continuation",
    theme: "Closing the 7-day vrata and next steps",
    lessons: [
      {
        id: "7.1",
        title: "Completing 7 Days: Offering It Back",
        description: "Understand how to complete this 7-day journey and how to carry its energy forward.",
        format: "text",
        duration: "5 min",
        content: "Reaching Day 7 does not mean your relationship with Hanuman ends. It means your formal sankalp for these 7 days has been honored. Now you offer its fruits back to the Divine.\n\nIn traditional vrats, devotees often mark completion with a special puja, extra chanting, and sharing prasad or charity. You can do the same in a simple way.\n\nTake a moment to look back at the last week. Notice any small shifts – in your mind, your habits, your energy. Offer all of this, including your struggles and mistakes, at Hanuman's feet. Let him reshape it in the way that is best for your growth."
      },
      {
        id: "7.2",
        title: "Where to Go From Here",
        description: "Choose a sustainable way to keep Hanuman in your daily life.",
        format: "text",
        duration: "5 min",
        content: "You now have enough tools to design your own Hanuman routine. Here are three paths you can choose from:\n\n- Daily Minimum: 1 diya, one simple prayer, 11 mantras, and a few lines of Chalisa. This takes around 5–10 minutes and is ideal for busy days.\n- Steady Practice: Morning and evening routines from Day 4, plus one small act of seva daily. This keeps your connection strong.\n- Deeper Vrat (Advanced): In the future, if you feel ready and can maintain more discipline, you may explore a 21- or 40-day Hanuman Chalisa vrat under proper guidance.\n\nFor now, choose stability over intensity. A small practice you do daily is more powerful than a big practice you drop in a week."
      },
      {
        id: "7.3",
        title: "Special Completion Puja",
        description: "Mark the end of the 7-day course with a heartfelt practice.",
        format: "practice",
        duration: "15 min",
        content: "1. Perform your usual simple puja steps.\n2. Chant the full Hanuman Chalisa (or listen to it with full attention).\n3. Gratitude round: Name people, situations, and inner shifts from the past week and offer them to Hanuman.\n4. Closing sankalp: 'Hanuman, please stay in my heart and guide my mind, speech, and actions.'"
      }
    ]
  }
];

