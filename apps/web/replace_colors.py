import os, glob

replacements = {
    "bg-[#050511]": "bg-primary-900",
    "bg-[#0a0a1a]": "bg-primary-800",
    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500": "bg-accent-500 hover:bg-accent-300 text-primary-900 border-none transition-all shadow-glow-accent",
    "text-blue-500": "text-primary-500",
    "text-blue-400": "text-primary-300",
    "text-blue-600": "text-primary-500",
    "bg-blue-600": "bg-primary-500",
    "bg-blue-500": "bg-primary-500",
    "hover:bg-blue-500": "hover:bg-primary-500",
    "hover:text-blue-400": "hover:text-primary-300",
    "hover:text-blue-300": "hover:text-primary-100",
    "border-blue-500/50": "border-primary-500/50",
    "border-blue-500/20": "border-primary-500/20",
    "ring-blue-500/50": "ring-accent-500 focus-visible:outline-2 focus-visible:outline-accent-500",
    "text-amber-500": "text-accent-500",
    "text-amber-400": "text-accent-300",
    "bg-amber-500": "bg-accent-500",
    "border-amber-500/30": "border-accent-500/30",
    "shadow-blue-500/20": "shadow-glow-primary",
    "text-indigo-400": "text-primary-300",
    "text-indigo-300": "text-primary-100",
    "bg-indigo-500/20": "bg-primary-500/20",
    "border-indigo-500/30": "border-primary-500/30",
    "from-indigo-500/20 to-blue-500/20": "from-primary-700 to-primary-800",
    "shadow-indigo-900/20": "shadow-md",
    "text-indigo-500": "text-primary-500",
    "bg-slate-900": "bg-primary-800",
    "bg-slate-800": "bg-primary-700",
    "text-slate-400": "text-neutral-300",
    "text-slate-500": "text-neutral-600",
    "text-slate-300": "text-neutral-300",
}

for filepath in glob.glob('src/**/*.tsx', recursive=True):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
