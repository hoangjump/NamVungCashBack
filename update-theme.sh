#!/bin/bash

# List of files to update
FILES=(
    "src/don-hang.html"
    "src/san-pham.html"
    "src/so-du.html"
    "src/ho-so.html"
    "src/tai-khoan.html"
)

# Update CSS reference
for file in "${FILES[@]}"; do
    echo "Updating $file..."

    # Replace old CSS references with modern theme
    sed -i '' 's|<link rel="stylesheet" href="./styles.css">|<link rel="stylesheet" href="./modern/modern-theme.css">|g' "$file"
    sed -i '' 's|<link rel="stylesheet" href="./dashboard.css">||g' "$file"
    sed -i '' 's|<body class="dashboard-page logged-in">|<body>|g' "$file"

    echo "✓ Updated CSS references in $file"
done

echo ""
echo "All files updated successfully!"
echo "Now manually update the HTML structure in each file to match modern theme."
echo ""
echo "Next steps:"
echo "1. Update header structure in each file"
echo "2. Replace class names with modern theme classes"
echo "3. Update content sections"