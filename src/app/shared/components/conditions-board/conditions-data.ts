export interface ConditionNote {
  readonly id: string;
  readonly title: string;
  /** Which family on the root map this note belongs to — shown as a small caption so the board and the map read as one thing. */
  readonly family: string;
  /** The id of the matching family node on the root map (see SYMPTOMS in root-map.ts), so a note arriving can light its own trace. */
  readonly familyId: string;
  readonly items: readonly string[];
  /** Overrides the auto-built "first three items" preview — for notes whose items are long sentences, not short condition names. */
  readonly preview?: string;
}

/** Collapsed notes show this many items; anything beyond becomes "+N more". */
export const PREVIEW_COUNT = 3;
/** Notes with this many items or fewer just show them all — a "+1 more" toggle isn't worth a tap. */
export const SHOW_ALL_MAX = 4;

// Content is the PRD's own "Symptoms and conditions we treat at the root"
// list, verbatim, in the PRD's order. Wording of the heavier conditions
// (autoimmune, neurological) is still pending legal review — see
// need-review notes — so keep edits to this one array.
export const NOTES: readonly ConditionNote[] = [
  {
    id: 'diabetes',
    title: 'Type 2 Diabetes',
    family: 'Blood sugar & heart',
    familyId: 'sugar',
    items: ['Type 2 diabetes', 'Prediabetes', 'Insulin resistance', 'Metabolic syndrome', 'High blood sugar', 'Sugar cravings'],
  },
  {
    id: 'menopause',
    title: 'Perimenopause & Menopause',
    family: "Hormones & women's health",
    familyId: 'hormones',
    items: ['Hot flashes', 'Night sweats', 'Poor sleep', 'Mood swings', 'Weight changes', 'Low libido'],
  },
  {
    id: 'gut',
    title: 'Gut Issues & Nutrient Deficiencies',
    family: 'Gut & digestion',
    familyId: 'gut',
    items: [
      'IBS',
      'Celiac disease',
      'Chronic bloating',
      'Acid reflux / GERD',
      'SIBO',
      'SIFO',
      'Food sensitivities',
      'Leaky gut',
      'Constipation',
      'Diarrhea',
      'Low iron, B12 or vitamin D',
    ],
  },
  {
    id: 'pcos',
    title: 'PCOS / PMOS',
    family: "Hormones & women's health",
    familyId: 'hormones',
    items: ['PCOS / PMOS', 'Irregular cycles', 'Acne', 'PMS / PMDD', 'Stubborn weight gain'],
  },
  {
    id: 'fertility',
    title: 'Fertility (Both Partners)',
    family: 'Fertility & motherhood',
    familyId: 'fertility',
    items: ['Fertility support for women and men', 'Pre-conception nutrition', 'Hormone and cycle balance'],
  },
  {
    id: 'endometriosis',
    title: 'Endometriosis',
    family: "Hormones & women's health",
    familyId: 'hormones',
    items: ['Painful periods', 'Pelvic pain', 'Heavy bleeding', 'Inflammation'],
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy Nutrition',
    family: 'Fertility & motherhood',
    familyId: 'fertility',
    items: ['Eating well through pregnancy', 'Low iron', 'Low energy', 'Nausea', 'What to eat each trimester'],
  },
  {
    id: 'postpartum',
    title: 'Postpartum Nutrition',
    family: 'Fertility & motherhood',
    familyId: 'fertility',
    items: ['Recovery after delivery', 'Exhaustion', 'Hair fall', 'Rebuilding nutrient stores'],
  },
  {
    id: 'cardiometabolic',
    title: 'Cardiometabolic Health',
    family: 'Blood sugar & heart',
    familyId: 'sugar',
    items: ['High cholesterol', 'High blood pressure', 'Metabolic syndrome', 'Chronic inflammation', 'Weight around the middle'],
  },
  {
    id: 'autoimmune',
    title: 'Autoimmune Conditions',
    family: 'Immune, thyroid & joints',
    familyId: 'immune',
    items: ['Psoriasis', 'Rheumatoid arthritis', 'Celiac disease', 'Multiple sclerosis', 'All other autoimmune conditions'],
  },
  {
    id: 'thyroid',
    title: "Hypothyroidism & Hashimoto's thyroiditis",
    family: 'Immune, thyroid & joints',
    familyId: 'immune',
    items: ['Tiredness', 'Hair fall', 'Weight gain', 'Feeling cold'],
  },
  {
    id: 'neuro',
    title: 'Neurological Disorders',
    family: 'Brain, sleep & mood',
    familyId: 'brain',
    items: ['Autism', 'ADHD', "Parkinson's", "Alzheimer's"],
  },
  {
    id: 'sleep-mood',
    title: 'Sleep & Mood',
    family: 'Brain, sleep & mood',
    familyId: 'brain',
    items: ['Insomnia', 'Disrupted sleep', 'Anxiety', 'Low mood', 'Stress-related burnout'],
  },
  {
    id: 'energy-weight',
    title: 'Energy & Weight',
    family: 'Blood sugar & heart',
    familyId: 'sugar',
    items: ['Weight plateaus', 'Metabolic weight gain', 'Chronic fatigue', 'Low energy'],
  },
  {
    id: 'cognitive',
    title: 'Cognitive Support',
    family: 'Brain, sleep & mood',
    familyId: 'brain',
    items: ['Brain fog', 'Memory issues', 'Poor focus'],
  },
  {
    id: 'other',
    title: 'Other conditions we treat',
    family: 'And more',
    familyId: 'skin',
    items: [
      'Skin: acne, eczema, chronic hives, rosacea',
      'Immune & allergic: frequent infections, seasonal and food allergies, chronic sinus issues',
      'Joint pain and fibromyalgia',
      'Adrenal / HPA-axis dysfunction (stress-related hormone imbalance)',
      'Recurring vaginal and genitourinary imbalances',
    ],
    preview: 'Skin · Immune & allergic · Joint pain · Adrenal · Genitourinary',
  },
];

