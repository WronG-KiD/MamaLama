// Decorative sparkles + scrolling balloon mascot. Visual only.

export function Sparkles() {
  return (
    <div className="sparkle-layer" aria-hidden="true">
      <span className="sparkle s1">✦</span>
      <span className="sparkle s2">✧</span>
      <span className="sparkle s3">✦</span>
      <span className="sparkle s4">✧</span>
      <span className="sparkle s5">✦</span>
      <span className="sparkle s6">✧</span>
    </div>
  );
}

export function BalloonMascot() {
  return (
    <div className="lama-balloon-wrap" id="lamaBalloon" aria-hidden="true">
      <img src="/balloonairtrans.png" alt="" className="balloon-img" />
      <div className="balloon-mascot">
        <div className="mascot-inner">
          <img src="/mascot-body.png" alt="Mama Lama" className="mascot-body" />
          <img src="/mascot-arm.png" alt="" className="mascot-arm" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// WelcomeBubble lives in its own file because it needs 'use client' for useStore.
// Re-export for backwards compatibility with the import in layout.tsx.
export { WelcomeBubble } from './WelcomeBubble';
