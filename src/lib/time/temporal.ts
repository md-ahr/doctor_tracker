/**
 * Guarantees a global `Temporal` before calendar code runs.
 *
 * Temporal is native in Node 26, Chrome/Edge 144+, and Firefox 139+. It is not
 * native in any stable Safari (desktop or iOS), and Node 22/24 only expose it
 * behind `--harmony-temporal`. The polyfill installs the global only when the
 * runtime has no native implementation, so every environment runs one code
 * path and modern engines pay nothing beyond the module load.
 */
import "temporal-polyfill/global";
