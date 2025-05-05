// Type definitions for hooks
declare module 'hooks' {
  import { useIsMobile } from '@/hooks/use-mobile';
  import { useToast, toast } from '@/hooks/use-toast';
  import { useWebRTC } from '@/hooks/useWebRTC';
  import { useScreenShare } from '@/hooks/useScreenShare';
  
  export { useIsMobile, useToast, toast, useWebRTC, useScreenShare };
}