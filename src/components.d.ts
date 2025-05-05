// Type definitions for components
declare module 'components' {
  // Import all component types from their respective directories
  export * from '@/components/ui';
  export * from '@/components/auth';
  export * from '@/components/features';
  export * from '@/components/hero';
  export * from '@/components/layout';
  export * from '@/components/meeting';
  export * from '@/components/attendance';
  
  // Export MeetingCard component
  export { default as MeetingCard } from '@/components/MeetingCard';
}