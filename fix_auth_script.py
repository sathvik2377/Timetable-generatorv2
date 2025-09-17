#!/usr/bin/env python3
"""
Script to fix authentication issues in all setup mode files
"""

import os
import re

# List of setup mode files to fix
setup_files = [
    'frontend/src/app/dashboard/admin/setup/quick/page.tsx',
    'frontend/src/app/dashboard/admin/setup/smart/page.tsx', 
    'frontend/src/app/dashboard/admin/setup/batch/page.tsx',
    'frontend/src/app/dashboard/admin/setup/unified/page.tsx',
    'frontend/src/app/dashboard/admin/setup/excel/page.tsx',
    'frontend/src/app/dashboard/admin/setup/advanced/page.tsx',
    'frontend/src/app/dashboard/admin/setup/wizard/page.tsx'
]

def fix_imports(content):
    """Fix imports to include generateTimetableVariants"""
    # Check if generateTimetableVariants is already imported
    if 'generateTimetableVariants' in content:
        return content
    
    # Add import for generateTimetableVariants
    if "import axios from 'axios'" in content:
        content = content.replace(
            "import axios from 'axios'",
            "import { generateTimetableVariants } from '@/lib/apiUtils'"
        )
    elif "import { toast }" in content and "from 'react-hot-toast'" in content:
        # Add after toast import
        content = content.replace(
            "import { toast } from 'react-hot-toast'",
            "import { toast } from 'react-hot-toast'\nimport { generateTimetableVariants } from '@/lib/apiUtils'"
        )
    
    return content

def fix_axios_calls(content):
    """Fix axios.post calls to use generateTimetableVariants"""
    # Pattern to match axios.post calls to generate-variants
    pattern = r"const response = await axios\.post\('http://localhost:8000/api/scheduler/generate-variants/', \{([^}]+)\}\)"
    
    def replace_axios_call(match):
        params = match.group(1)
        # Extract setup_mode and form_data from the parameters
        setup_mode_match = re.search(r"setup_mode:\s*'([^']+)'", params)
        form_data_match = re.search(r"form_data:\s*([^,}]+)", params)
        
        if setup_mode_match and form_data_match:
            setup_mode = setup_mode_match.group(1)
            form_data = form_data_match.group(1)
            return f"const response = await generateTimetableVariants('{setup_mode}', {form_data})"
        
        return match.group(0)  # Return original if can't parse
    
    return re.sub(pattern, replace_axios_call, content, flags=re.DOTALL)

def process_file(filepath):
    """Process a single file"""
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix imports
        content = fix_imports(content)
        
        # Fix axios calls
        content = fix_axios_calls(content)
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {filepath}")
            return True
        else:
            print(f"No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function"""
    print("Fixing authentication issues in setup mode files...")
    
    fixed_count = 0
    for filepath in setup_files:
        if process_file(filepath):
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} files")

if __name__ == "__main__":
    main()
