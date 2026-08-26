import { CANVAS_HELPERS_SCRIPT } from './canvas-helpers';
import { CANVAS_SINGLE_SCRIPT } from './canvas-single';
import { CANVAS_CAROUSEL_SCRIPT } from './canvas-carousel';

export const CANVAS_RENDER_SCRIPT = `
${CANVAS_SINGLE_SCRIPT}
${CANVAS_CAROUSEL_SCRIPT}
${CANVAS_HELPERS_SCRIPT}
`;
