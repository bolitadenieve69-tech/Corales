import os, glob

replacements = {
    "focus:outline-none": "focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-500 focus-visible:outline-offset-2",
    "bg-[#0A0A1A]": "bg-primary-800",
    "bg-[#050511]": "bg-primary-900"
}

count = 0
for filepath in glob.glob('src/**/*.tsx', recursive=True):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        # Avoid duplicating if already present
        if old in new_content and new not in new_content:
            new_content = new_content.replace(old, new)
            
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath} for A11y")
        count += 1

print(f"Total files updated: {count}")
