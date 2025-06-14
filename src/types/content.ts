export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FeaturesContent {
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

export interface CTAContent {
  title: string;
  description: string;
  buttonText: string;
  backgroundColor: string;
}

export interface PageContent {
  hero: HeroContent;
  features: FeaturesContent;
  cta: CTAContent;
  updatedAt?: string;
}
