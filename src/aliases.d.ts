// Type definitions for aliases used in the project
// These aliases are defined in components.json

declare module 'components' {
  export * from '@/components';
}

declare module 'utils' {
  export * from '@/lib/utils';
}

declare module 'ui' {
  export * from '@/components/ui';
}

declare module 'lib' {
  export * from '@/lib';
}

declare module 'hooks' {
  export * from '@/hooks';
}

declare module 'contexts' {
  export * from '@/contexts';
}

declare module 'integrations' {
  export * from '@/integrations';
}

declare module 'pages' {
  export { default as About } from '@/pages/About';
  export { default as AdminDashboard } from '@/pages/AdminDashboard';
  export { default as Auth } from '@/pages/Auth';
  export { default as Dashboard } from '@/pages/Dashboard';
  export { default as Features } from '@/pages/Features';
  export { default as Home } from '@/pages/Home';
  export { default as Login } from '@/pages/Login';
  export { default as Meeting } from '@/pages/Meeting';
  export { default as NotFound } from '@/pages/NotFound';
  export { default as PasswordReset } from '@/pages/PasswordReset';
  export { default as Pricing } from '@/pages/Pricing';
  export { default as Profile } from '@/pages/Profile';
  export { default as Register } from '@/pages/Register';
}