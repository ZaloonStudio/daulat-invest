export type Theme = 'light' | 'dark';
export function resolveTheme(preference: string | null, localHour: number): Theme {
  if (preference === 'light' || preference === 'dark') return preference;
  return localHour >= 7 && localHour < 19 ? 'light' : 'dark';
}
// Runs before paint, including when browser storage is unavailable.
export const themeBootstrap = `(function(){var t=null;try{t=localStorage.getItem('daulat_theme')}catch(e){}var h=new Date().getHours();var light=t==='light'||(t!=='dark'&&h>=7&&h<19);document.documentElement.classList.toggle('light',light)})()`;
