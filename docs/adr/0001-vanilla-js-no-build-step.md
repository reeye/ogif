# Vanilla JS with no build step

ogif is a static tool that must be deployable by dropping files into a GitHub Pages repository with zero configuration.
We chose vanilla HTML/CSS/JavaScript with the Canvas API for all image processing, loaded directly in the browser. Small
focused libraries (e.g. a GIF decoder) are permitted via CDN. No framework, no bundler, no build step.

The alternative — a framework like React or Svelte with a build pipeline — would provide better developer ergonomics but
introduces a build step, a `node_modules` tree, and a CI/CD pipeline just to publish a static page. The simplicity of
the deployment target (static files, GitHub Pages) does not justify that overhead for a single-page tool.
