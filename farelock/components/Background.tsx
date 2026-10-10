import StarField from "./StarField";

/**
 * What sits behind every page: the background colour and the twinkling
 * stars. It is pinned to the window, so content scrolls over a still sky.
 *
 * Anything a page puts on top with its own solid background (a card, a
 * panel, the footer) hides the stars behind it.
 */
export default function Background() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-background">
      <StarField />
    </div>
  );
}
