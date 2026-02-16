import { useTheme } from '../contexts/ThemeContext';

function TestTheme() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Theme Info */}
        <div className="text-center">
          <h1 className="text-4xl text-text-primary font-light mb-2">
            Current Theme: <span className="text-accent">{theme}</span>
          </h1>
          <p className="text-text-secondary">isDark: {isDark ? '✅' : '❌'} | isLight: {isLight ? '✅' : '❌'}</p>
        </div>

        {/* Theme Toggle Button */}
        <div className="flex justify-center">
        <button
  onClick={toggleTheme}
  className="px-8 py-4 bg-accent text-primary font-light rounded-lg 
             hover:bg-accent/90 transition-all duration-300 shadow-gold-sm
             hover:shadow-gold-md text-xl cursor-pointer"
>
  Toggle Theme (Current: {theme})
</button>
        </div>

        {/* Color Test Cards */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-6 bg-primary border border-accent/20 rounded-lg">
            <p className="text-text-primary">Primary BG</p>
            <p className="text-text-secondary text-sm">#211F1F / #F8F5F0</p>
          </div>
          <div className="p-6 bg-secondary border border-accent/20 rounded-lg">
            <p className="text-text-primary">Secondary BG</p>
            <p className="text-text-secondary text-sm">#3A3535 / #E8E2D8</p>
          </div>
          <div className="p-6 glass rounded-lg col-span-2">
            <p className="text-text-primary">Glass Effect</p>
            <p className="text-text-secondary text-sm">backdrop-blur with gold border</p>
          </div>
        </div>

        {/* Text Examples */}
        <div className="space-y-4 p-6 bg-secondary rounded-lg">
          <p className="text-text-primary text-xl">Primary Text - Headings</p>
          <p className="text-text-secondary">Secondary Text - Subtitles and metadata</p>
          <p className="text-accent">Accent Gold - Special highlights</p>
        </div>
      </div>
    </div>
  );
}

export default TestTheme;