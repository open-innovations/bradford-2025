// Override the landing page design by updating this to the basename of a file in this directory.
// export const landingPage = 'wireframe';

export const url = ({ data: { basename, landingPage }}: Lume.Page) => {
    if (basename == landingPage) return '/';
}