const fs = require("fs");
const path = require("path");

const faPath = "./node_modules/@fortawesome/fontawesome-pro/svgs/light/";
const targetPath = "./custom";

// Get the icon name from the command line arguments
const iconName = process.argv[2];

if (!iconName) {
  console.error("Please provide an icon name as a parameter.");
  process.exit(1);
}

// Construct the file paths for the source and target files
const sourceFile = path.join(faPath, `${iconName}.svg`);
const targetFile = path.join(targetPath, `${iconName}.svg`);

// Read the SVG file
fs.readFile(sourceFile, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", sourceFile, err);
    return;
  }

  // Write the SVG file to the target directory
  fs.writeFile(targetFile, data, (err) => {
    if (err) {
      console.error("Error writing file:", targetFile, err);
      return;
    }
    console.log(`Icon ${iconName} copied successfully.`);
  });
});
