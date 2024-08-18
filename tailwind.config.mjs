import rippleui from 'rippleui';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	/** @type {import('rippleui').Config} */
	rippleui: {
		themes: [
			{
				themeName: "dark",
				colorScheme: "dark",
				colors: {
					backgroundPrimary: "#232424",
				},
			},
		],
	},
	darkMode: ['class', '[data-theme="dark"]'],
	plugins: [rippleui],
};
