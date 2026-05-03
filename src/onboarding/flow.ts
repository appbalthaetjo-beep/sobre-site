export type StepId = string;

export type OnboardingStep =
  | {
      id: StepId;
      kind: "single_choice";
      content: {
        title: string;
        helperText?: string;
      };
      data: {
        questionKey: string;
        choices: { id: string; label: string }[];
      };
      nav: { next?: StepId; back?: StepId };
    }
  | {
      id: StepId;
      kind: "custom";
      customKey: string;
      nav?: { next?: StepId; back?: StepId };
    };

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "index",
    kind: "custom",
    customKey: "welcome_intro",
    nav: { next: "story" },
  },
  {
    id: "story",
    kind: "custom",
    customKey: "story_typewriter",
    nav: { next: "personal-data", back: "index" },
  },
  {
    id: "personal-data",
    kind: "custom",
    customKey: "personal_data_form",
    nav: { next: "consider-this", back: "story" },
  },
  {
    id: "consider-this",
    kind: "custom",
    customKey: "consider_this_auto_advance",
    nav: { next: "question-1", back: "personal-data" },
  },
  {
    id: "question-1",
    kind: "single_choice",
    content: {
      title: "Quel est votre genre ?",
      helperText: "Cela nous aide à adapter ton accompagnement.",
    },
    data: {
      questionKey: "gender",
      choices: [
        { id: "masculin", label: "Masculin" },
        { id: "feminin", label: "Féminin" },
      ],
    },
    nav: { next: "question-2", back: "consider-this" },
  },
  {
    id: "question-2",
    kind: "single_choice",
    content: {
      title:
        "À quelle fréquence regardez-vous habituellement de la pornographie ?",
    },
    data: {
      questionKey: "frequency",
      choices: [
        { id: "plus-fois-jour", label: "Plus d'une fois par jour" },
        { id: "fois-jour", label: "Une fois par jour" },
        { id: "fois-semaine", label: "Quelques fois par semaine" },
        { id: "moins-semaine", label: "Moins d'une fois par semaine" },
      ],
    },
    nav: { next: "question-3", back: "question-1" },
  },
  {
    id: "question-3",
    kind: "single_choice",
    content: {
      title:
        "Ressentez-vous parfois un manque de contrôle sur votre consommation de pornographie ?",
    },
    data: {
      questionKey: "control",
      choices: [
        { id: "frequemment", label: "Fréquemment" },
        { id: "occasionnellement", label: "Occasionnellement" },
        { id: "rarement", label: "Rarement ou jamais" },
      ],
    },
    nav: { next: "youre-in-the-right-place", back: "question-2" },
  },
  {
    id: "youre-in-the-right-place",
    kind: "custom",
    customKey: "youre_in_the_right_place",
    nav: { next: "question-4", back: "question-3" },
  },
  {
    id: "question-4",
    kind: "single_choice",
    content: {
      title:
        "Avez-vous remarqué une évolution vers du contenu plus extrême ou graphique ?",
    },
    data: {
      questionKey: "escalation",
      choices: [
        { id: "oui", label: "Oui" },
        { id: "non", label: "Non" },
      ],
    },
    nav: { next: "question-5", back: "youre-in-the-right-place" },
  },
  {
    id: "question-5",
    kind: "custom",
    customKey: "question_5_first_exposure_picker",
    nav: { next: "question-6", back: "question-4" },
  },
  {
    id: "question-6",
    kind: "single_choice",
    content: {
      title:
        "Trouvez-vous difficile d'atteindre l'excitation sexuelle sans pornographie ou fantasmes ?",
    },
    data: {
      questionKey: "arousal",
      choices: [
        { id: "frequemment", label: "Fréquemment" },
        { id: "occasionnellement", label: "Occasionnellement" },
        { id: "rarement", label: "Rarement ou jamais" },
      ],
    },
    nav: { next: "question-8", back: "question-5" },
  },
  {
    id: "question-8",
    kind: "single_choice",
    content: {
      title: "Vous tournez-vous vers la pornographie quand vous êtes stressé ?",
    },
    data: {
      questionKey: "stress",
      choices: [
        { id: "frequemment", label: "Fréquemment" },
        { id: "occasionnellement", label: "Occasionnellement" },
        { id: "rarement", label: "Rarement ou jamais" },
      ],
    },
    nav: { next: "question-9", back: "question-6" },
  },
  {
    id: "question-9",
    kind: "single_choice",
    content: {
      title: "Regardez-vous de la pornographie par ennui ?",
    },
    data: {
      questionKey: "boredom",
      choices: [
        { id: "frequemment", label: "Fréquemment" },
        { id: "occasionnellement", label: "Occasionnellement" },
        { id: "rarement", label: "Rarement ou jamais" },
      ],
    },
    nav: { next: "question-10", back: "question-8" },
  },
  {
    id: "question-10",
    kind: "single_choice",
    content: {
      title:
        "Avez-vous déjà dépensé de l'argent pour accéder à du contenu explicite ?",
    },
    data: {
      questionKey: "money",
      choices: [
        { id: "oui", label: "Oui" },
        { id: "non", label: "Non" },
      ],
    },
    nav: { next: "question-11", back: "question-9" },
  },
  {
    id: "question-11",
    kind: "single_choice",
    content: {
      title: "Comment vous sentez-vous après la masturbation ?",
    },
    data: {
      questionKey: "post_masturbation_feeling",
      choices: [
        { id: "disappointed", label: "Déçu" },
        { id: "guilty", label: "Coupable" },
        { id: "euphoric", label: "Euphorique" },
        { id: "relieved", label: "Soulagé" },
        { id: "prefer_not_to_say", label: "Je préfère ne pas répondre" },
      ],
    },
    nav: { next: "question-12", back: "question-10" },
  },
  {
    id: "question-12",
    kind: "custom",
    customKey: "question_12_porn_impact_slider",
    nav: { next: "question-13", back: "question-11" },
  },
  {
    id: "question-13",
    kind: "single_choice",
    content: {
      title: "Avez-vous remarqué l’un de ces effets récemment ?",
    },
    data: {
      questionKey: "recent_effects",
      choices: [
        { id: "yes", label: "Oui" },
        { id: "no", label: "Non" },
      ],
    },
    nav: { next: "loading", back: "question-12" },
  },
  {
    id: "loading",
    kind: "custom",
    customKey: "loading_diagnostic",
    nav: { next: "results", back: "question-13" },
  },
  {
    id: "results",
    kind: "custom",
    customKey: "results_score_breakdown",
    nav: { next: "symptoms", back: "loading" },
  },
  {
    id: "symptoms",
    kind: "custom",
    customKey: "symptoms_multi_select",
    nav: { next: "slide-3", back: "results" },
  },
  {
    id: "slide-3",
    kind: "custom",
    customKey: "slide_3_relationship_chat",
    nav: { next: "slide-1", back: "symptoms" },
  },
  {
    id: "slide-1",
    kind: "custom",
    customKey: "slide_1",
    nav: { next: "slide-2", back: "slide-3" },
  },
  {
    id: "slide-2",
    kind: "custom",
    customKey: "slide_2",
    nav: { next: "slide-4", back: "slide-1" },
  },
  {
    id: "slide-4",
    kind: "custom",
    customKey: "slide_4",
    nav: { next: "slide-6", back: "slide-2" },
  },
  {
    id: "slide-6",
    kind: "custom",
    customKey: "slide_6",
    nav: { next: "slide-7", back: "slide-4" },
  },
  {
    id: "slide-7",
    kind: "custom",
    customKey: "slide_7",
    nav: { next: "slide-8", back: "slide-6" },
  },
  {
    id: "slide-8",
    kind: "custom",
    customKey: "slide_8",
    nav: { next: "slide-9", back: "slide-7" },
  },
  {
    id: "slide-9",
    kind: "custom",
    customKey: "slide_9",
    nav: { next: "slide-10", back: "slide-8" },
  },
  {
    id: "slide-10",
    kind: "custom",
    customKey: "slide_10",
    nav: { next: "slide-11", back: "slide-9" },
  },
  {
    id: "slide-11",
    kind: "custom",
    customKey: "slide_11",
    nav: { next: "testimonials", back: "slide-10" },
  },
  {
    id: "testimonials",
    kind: "custom",
    customKey: "testimonials_feed",
    nav: { next: "past-attempts", back: "slide-11" },
  },
  {
    id: "past-attempts",
    kind: "single_choice",
    content: {
      title: "As-tu déjà essayé d’arrêter le porno ?\nComment ça s’est passé ?",
    },
    data: {
      questionKey: "past_porn_change_attempt",
      choices: [
        { id: "yes_easy", label: "✅ Oui, et ce n’était pas difficile" },
        { id: "yes_somewhat", label: "🤔 Oui, mais c’était un peu difficile" },
        { id: "yes_very", label: "😓 Oui, et c’était très difficile" },
        { id: "no_first_time", label: "🙅 Non, c’est la première fois" },
      ],
    },
    nav: { next: "rewiring-advantages", back: "testimonials" },
  },
  {
    id: "rewiring-advantages",
    kind: "custom",
    customKey: "rewiring_advantages",
    nav: { next: "personal-goals", back: "past-attempts" },
  },
  {
    id: "personal-goals",
    kind: "custom",
    customKey: "personal_goals_multi_select",
    nav: { next: "commitment-signature", back: "rewiring-advantages" },
  },
  {
    id: "commitment-signature",
    kind: "custom",
    customKey: "commitment_signature_canvas",
    nav: { next: "rate-us", back: "personal-goals" },
  },
  {
    id: "rate-us",
    kind: "custom",
    customKey: "rate_us_social_proof",
    nav: { next: "free-trial", back: "commitment-signature" },
  },
  {
    id: "free-trial",
    kind: "custom",
    customKey: "free_trial_pitch",
    nav: { next: "personalized-summary", back: "rate-us" },
  },
  {
    id: "personalized-summary",
    kind: "custom",
    customKey: "personalized_summary_plan",
    nav: { next: "trial-reminder", back: "free-trial" },
  },
  {
    id: "trial-reminder",
    kind: "custom",
    customKey: "trial_reminder_paywall_gate",
    nav: { back: "personalized-summary" },
  },
];
