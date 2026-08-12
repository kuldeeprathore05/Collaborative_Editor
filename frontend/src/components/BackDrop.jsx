import codeBg from "../assets/desktop-source-code-and-wallpaper-by-coding-and-programming-free-photo.jpg"; 

export const BackDrop = ()=> {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={codeBg}
        alt=""
        className="size-full scale-105 object-cover opacity-65 blur-[2px]"
      />
      <div className="absolute inset-0 bg-surface-1/55" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,transparent,rgba(0,0,0,0.75))]" />
    </div>
  );
} 