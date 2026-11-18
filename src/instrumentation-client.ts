// Runs in the browser before the app's client code. Safari, including every
// iOS browser, still ships no native Temporal, so the polyfill has to land
// before the first client render.
import "@/lib/time/temporal";
