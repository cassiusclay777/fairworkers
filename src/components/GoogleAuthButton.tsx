
import { Button } from "@/components/ui/button";

interface GoogleAuthButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function GoogleAuthButton({ onClick, disabled }: GoogleAuthButtonProps) {
  return (
    <Button
      variant="outline"
      className="
        w-full h-12
        border-2 border-gray-300
        hover:border-gray-400
        bg-white hover:bg-gray-50
        text-text font-body font-500
        text-body-16
        rounded-lg
        transition-colors duration-200
        flex items-center justify-center gap-3
      "
      onClick={onClick}
      disabled={disabled}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M16.5 9.20455C16.5 8.56636 16.4455 7.95273 16.3455 7.36364H9V10.845H13.2955C13.1023 11.97 12.5209 12.9232 11.6591 13.5614V15.6191H14.2841C15.7073 14.2523 16.5 12.2727 16.5 9.20455Z" fill="#4285F4"/>
        <path d="M9 17C11.13 17 12.93 16.2923 14.2841 15.6191L11.6591 13.5614C10.8886 14.1014 9.88409 14.4205 9 14.4205C6.93409 14.4205 5.17727 13.0386 4.54773 11.1505H1.81818V13.2741C3.15909 15.8932 5.82727 17 9 17Z" fill="#34A853"/>
        <path d="M4.54773 11.1505C4.36364 10.6205 4.26136 10.0523 4.26136 9.47727C4.26136 8.90227 4.36364 8.33409 4.54773 7.80409V5.68045H1.81818C1.21591 6.84091 0.863636 8.12955 0.863636 9.47727C0.863636 10.825 1.21591 12.1136 1.81818 13.2741L4.54773 11.1505Z" fill="#FBBC05"/>
        <path d="M9 4.57955C10.4318 4.57955 11.6977 5.07955 12.6886 6.06818L14.3386 4.41818C12.9273 3.07727 11.13 2.45455 9 2.45455C5.82727 2.45455 3.15909 3.56136 1.81818 5.68045L4.54773 7.80409C5.17727 5.91591 6.93409 4.57955 9 4.57955Z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </Button>
  );
}

export default GoogleAuthButton;