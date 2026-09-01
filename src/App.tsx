import { useEffect, useRef, useState } from 'react';

interface QuizItem {
  id: number;
  minutes: number;
  content: string;
}

// 基準日時 (2026-09-01 10:00:00 JST)
const BASE_TIME = new Date('2026-09-01T10:00:00+09:00').getTime();

// 9問分のデータ設定（分単位）
const QUIZ_DATA: QuizItem[] = [
  { id: 1, minutes: 1, content: '【第1問】太陽系で最も大きい惑星はなんでしょうか？正解を入力してください。' },
  { id: 2, minutes: 2, content: '【第2問】吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。' },
  { id: 3, minutes: 3, content: '【第3問】春はあけぼの。やうやう白くなりゆく山ぎは、少しあかりて、紫だちたる雲の。' },
  { id: 4, minutes: 5, content: '【第4問】パンはパンでも食べられないパンはなーんだ？フライパンかな？ピーターパン？' },
  { id: 5, minutes: 7, content: '【第5問】国境の長いトンネルを抜けると雪国であった。夜の底が白くなった。' },
  { id: 6, minutes: 10, content: '【第6問】寿限無、寿限無、五劫の擦り切れ、海砂利水魚の水行末、雲来末、風来末。' },
  { id: 7, minutes: 15, content: '【第7問】祇園精舎の鐘の声、諸行無常の響きあり。娑羅双樹の花の色、盛者必衰の理をあらはす。' },
  { id: 8, minutes: 20, content: '【第8問】走れメロス。メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。' },
  { id: 9, minutes: 30, content: '【第9問】時は金なり。少年老い易く学成り難し。一寸の光陰軽んずべからず。' },
];

export default function App() {
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [latency, setLatency] = useState<number>(14);

  useEffect(() => {
    let lastFrameTime = performance.now();

    const updatePositions = () => {
      const now = Date.now();
      const currentPerf = performance.now();
      const frameDelta = currentPerf - lastFrameTime;
      lastFrameTime = currentPerf;
      if (Math.random() < 0.05) {
        setLatency(Math.max(8, Math.min(22, Math.round(frameDelta))));
      }

      const elapsed = now - BASE_TIME;

      QUIZ_DATA.forEach((q, i) => {
        const track = trackRefs.current[i];
        const progressBar = progressRefs.current[i];
        if (!track || !track.parentElement) return;

        const periodMs = q.minutes * 60 * 1000;
        let progress = (elapsed % periodMs) / periodMs;
        if (progress < 0) progress += 1;

        const windowWidth = track.parentElement.clientWidth;
        const contentWidth = track.scrollWidth;
        const totalDistance = contentWidth + windowWidth;

        const currentX = windowWidth - progress * totalDistance;
        track.style.transform = `translateX(${currentX}px)`;

        if (progressBar) {
          progressBar.style.width = `${(progress * 100).toFixed(2)}%`;
        }
      });
    };

    updatePositions();
    const interval = setInterval(updatePositions, 50);

    const handleResize = () => {
      updatePositions();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0c0c0e] font-sans text-[#e4e4e7] selection:bg-orange-500 selection:text-black">
      {/* Header */}
      <header
        id="app-header"
        className="flex h-16 w-full items-center justify-between border-b border-[#27272a] bg-[#0c0c0e] px-4 sm:px-8"
      >
        <div className="flex items-center gap-3">
          <div
            id="status-indicator"
            className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]"
          />
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <h1 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 sm:text-sm">
              LONG LONG LONG QUIZ
            </h1>
            <span className="text-[10px] font-mono tracking-wider text-zinc-500">
              ARCHIVE 2026
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:flex md:gap-8">
          <div>Ref_Time: <span className="text-zinc-400">10:00:00 JST</span></div>
          <div>
            Status: <span className="font-semibold text-emerald-400">Synchronized</span>
          </div>
          <div>Buffer: <span className="text-zinc-400">100%</span></div>
        </div>
      </header>

      {/* Main Grid View */}
      <main
        id="main-app"
        className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8"
      >
        <div id="grid" className="grid-container">
          {QUIZ_DATA.map((q, index) => (
            <div key={q.id} id={`quiz-window-${q.id}`} className="quiz-window">
              <span id={`window-label-${q.id}`} className="window-label">
                Q{q.id} / Period: {q.minutes}m
              </span>

              <div
                id={`track-${index}`}
                ref={(el) => {
                  trackRefs.current[index] = el;
                }}
                className="track"
                style={{
                  fontSize: '150px',
                }}
              >
                {q.content}
              </div>

              {/* Progress Line */}
              <div
                id={`progress-bar-container-${q.id}`}
                className="absolute bottom-0 left-0 h-[2px] w-full bg-zinc-800/80"
              >
                <div
                  id={`progress-bar-${q.id}`}
                  ref={(el) => {
                    progressRefs.current[index] = el;
                  }}
                  className="h-full bg-orange-500 transition-none"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        id="app-footer"
        className="flex h-12 w-full items-center justify-between border-t border-[#27272a] bg-[#0c0c0e] px-4 font-mono text-[10px] text-zinc-500 sm:px-8"
      >
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-zinc-400"></span>
            LATENCY: {latency}ms
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-zinc-400"></span>
            9 CHANNELS ACTIVE
          </span>
        </div>

        <div className="tracking-widest uppercase text-zinc-600">
          Precision Playback Engine v4.1.0-STABLE
        </div>
      </footer>
    </div>
  );
}

