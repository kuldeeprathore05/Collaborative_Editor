import { Terminal } from "lucide-react";
import {BackDrop} from './BackDrop.jsx'
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-surface-1 px-4 py-10 text-white">
        <BackDrop/>
      <div className="relative z-10 w-full max-w-[360px]">
        
        {/* logo */}
        <div className="mb-5 flex items-center justify-center gap-1.5">
          <Terminal className="size-4 text-primary" />
          <span className="text-[13px] font-semibold tracking-tight text-white">
            CollabCode
          </span>
        </div>

        {/* main */}
        <div className="rounded-lg border border-border bg-surface-2/85 p-5 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <h1 className="text-[15px] font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-1 text-[12px] text-zinc-400">{subtitle}</p>

          <div className="mt-4">{children}</div>
        </div>

        {/* footer */}
        <p className="mt-4 text-center text-[12px] text-zinc-400">{footer}</p>
      </div>
    </main>
  );
}