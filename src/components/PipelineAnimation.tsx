import { useEffect, useRef, useState } from "react";

/**
 * Embeds the "Three Sheets, One Model" walkthrough (public/pipeline/index.html):
 * the sixteen passes that turn a structural, an architectural and an electrical
 * scan of one building into a single federated IFC model.
 *
 * The figure is a self-contained document rather than a React tree on purpose -
 * it brings its own typography and drawing language, and porting it would fork
 * it from the published source. This wrapper only does the two things a host
 * page has to do for it: size the frame to the content, and keep it paused
 * while it is off screen.
 */

const SRC = "/pipeline/index.html";
const FALLBACK_HEIGHT = 1180;

type HeightMessage = { type: "fpms-pipeline-height"; height: number };

const PipelineAnimation = ({ title }: { title: string }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(FALLBACK_HEIGHT);

  // The figure reports its own height whenever it reflows.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as HeightMessage | undefined;
      if (data?.type !== "fpms-pipeline-height") return;
      if (typeof data.height !== "number" || !Number.isFinite(data.height)) return;
      setHeight(Math.max(480, Math.round(data.height)));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Play only while it is on screen and the tab is in front.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let onScreen = false;

    const send = (play: boolean) =>
      frame.contentWindow?.postMessage(
        { type: "fpms-pipeline", play },
        window.location.origin,
      );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          onScreen = entry.isIntersecting && entry.intersectionRatio > 0.15;
          send(onScreen && !document.hidden);
        }
      },
      { threshold: [0, 0.15, 0.4] },
    );
    observer.observe(frame);

    const onVisibilityChange = () => send(onScreen && !document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <iframe
      ref={frameRef}
      src={SRC}
      title={title}
      loading="lazy"
      className="block w-full border-0 overflow-hidden"
      style={{ height }}
    />
  );
};

export default PipelineAnimation;
