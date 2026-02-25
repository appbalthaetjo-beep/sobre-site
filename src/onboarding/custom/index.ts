import type { ComponentType } from 'react';
import {
  CustomCommitmentSignatureCanvas,
  CustomFreeTrialPitch,
  CustomPersonalGoalsMultiSelect,
  CustomPersonalizedSummaryPlan,
  CustomRateUsSocialProof,
  CustomReferralCodeInput,
  CustomRewiringAdvantages,
  CustomTestimonialsFeed,
  CustomTrialReminderPaywallGate,
} from './CustomAftercare';
import { CustomConsiderThis } from './CustomConsiderThis';
import { CustomFirstExposurePicker } from './CustomFirstExposurePicker';
import { CustomGenericStep } from './CustomGenericStep';
import { CustomLoadingDiagnostic } from './CustomLoadingDiagnostic';
import { CustomPersonalDataForm } from './CustomPersonalDataForm';
import { CustomPornImpactSlider } from './CustomPornImpactSlider';
import { CustomResultsScoreBreakdown } from './CustomResultsScoreBreakdown';
import {
  CustomSlide1,
  CustomSlide2,
  CustomSlide3RelationshipChat,
  CustomSlide4,
  CustomSlide6,
  CustomSlide7,
  CustomSlide8,
  CustomSlide9,
  CustomSlide10,
  CustomSlide11,
} from './CustomSlides';
import { CustomStory } from './CustomStory';
import { CustomSymptomsMultiSelect } from './CustomSymptomsMultiSelect';
import { CustomWelcomeIntro } from './CustomWelcomeIntro';
import { CustomYoureInTheRightPlace } from './CustomYoureInTheRightPlace';
import type { CustomProps } from './types';

type CustomComponent = ComponentType<CustomProps>;

export const customComponents: Record<string, CustomComponent> = {
  welcome_intro: CustomWelcomeIntro,
  story_typewriter: CustomStory,
  personal_data_form: CustomPersonalDataForm,
  consider_this_auto_advance: CustomConsiderThis,
  youre_in_the_right_place: CustomYoureInTheRightPlace,
  question_5_first_exposure_picker: CustomFirstExposurePicker,
  question_12_porn_impact_slider: CustomPornImpactSlider,
  loading_diagnostic: CustomLoadingDiagnostic,
  results_score_breakdown: CustomResultsScoreBreakdown,
  symptoms_multi_select: CustomSymptomsMultiSelect,
  slide_3_relationship_chat: CustomSlide3RelationshipChat,
  slide_1: CustomSlide1,
  slide_2: CustomSlide2,
  slide_4: CustomSlide4,
  slide_6: CustomSlide6,
  slide_7: CustomSlide7,
  slide_8: CustomSlide8,
  slide_9: CustomSlide9,
  slide_10: CustomSlide10,
  slide_11: CustomSlide11,
  testimonials_feed: CustomTestimonialsFeed,
  rewiring_advantages: CustomRewiringAdvantages,
  personal_goals_multi_select: CustomPersonalGoalsMultiSelect,
  commitment_signature_canvas: CustomCommitmentSignatureCanvas,
  rate_us_social_proof: CustomRateUsSocialProof,
  free_trial_pitch: CustomFreeTrialPitch,
  referral_code_input: CustomReferralCodeInput,
  personalized_summary_plan: CustomPersonalizedSummaryPlan,
  trial_reminder_paywall_gate: CustomTrialReminderPaywallGate,
};

export { CustomGenericStep };
export type { CustomProps, CustomStep } from './types';
