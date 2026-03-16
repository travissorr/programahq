import { useNavigate } from "react-router";
import svgPaths from "../../imports/svg-igo1y9ic0d";

function Logo() {
  const navigate = useNavigate();
  
  return (
    <div 
      className="h-[36px] w-[149px] cursor-pointer" 
      data-name="logo"
      onClick={() => navigate('/')}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 149 36">
        <g id="Vector">
          <path d={svgPaths.p19660200} fill="currentColor" />
          <path d={svgPaths.p20d22600} fill="currentColor" />
          <path d={svgPaths.p1066c400} fill="currentColor" />
          <path d={svgPaths.p2e9dc100} fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}

function ReturnHomeButton() {
  const navigate = useNavigate();
  
  return (
    <button 
      className="bg-card shadow-[var(--elevation-sm)] flex gap-2 h-[36px] items-center justify-center px-3 rounded-[var(--radius-button)] shrink-0 text-foreground cursor-pointer hover:brightness-95"
      style={{ transition: 'filter var(--transition-duration, 150ms) ease' }}
      onClick={() => navigate('/')}
    >
      <span>Back</span>
      <div className="size-5" data-name="Icon">
        <div className="flex items-center justify-center size-full">
          <svg className="size-[11.354px]" fill="none" preserveAspectRatio="none" viewBox="0 0 11.354 11.3543">
            <path d={svgPaths.p3e48fe00} fill="currentColor" />
          </svg>
        </div>
      </div>
    </button>
  );
}

export default function Header({ showBackButton = true }: { showBackButton?: boolean }) {
  return (
    <header
      className="fixed top-0 left-0 z-50 flex items-center justify-between px-6 py-6 max-md:px-4 max-md:py-4 w-full pointer-events-none max-md:bg-background/80 max-md:backdrop-blur-md max-md:pointer-events-auto"
    >
      <div className="pointer-events-auto">
        <Logo />
      </div>
      {showBackButton && (
        <div className="pointer-events-auto">
          <ReturnHomeButton />
        </div>
      )}
    </header>
  );
}