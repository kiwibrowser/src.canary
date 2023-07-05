const fs = require("fs");
const data_icons = require("./data_icons.json");
const path = require("path");

const defaultColor = "@android:color/black";
const targetPath = "drawable/";
const sourcePath = "./node_modules/@fortawesome/fontawesome-pro/svgs/";
const padding = 8;
const assetsFolderPath = "./chrome/"; // Specify the path to the image folder
const buildLogPath = "build_log.log"; // Specify the path for the image log file
// Helper function to check if a file is an image file
function isImageFile(file) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"]; // Add more extensions if needed
  const ext = path.extname(file).toLowerCase();
  return imageExtensions.includes(ext);
}
// Helper function to recursively search for images in a folder
function findImagesForIcon(iconName, folderPath) {
  let imagePaths = [];
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Pass the icon name and the full path to the recursive call
      imagePaths = imagePaths.concat(findImagesForIcon(iconName, filePath));
    } else if (stat.isFile() && isImageFile(file) && file.includes(iconName)) {
      imagePaths.push(filePath);
    }
  });

  return imagePaths;
}
let count = 0
let icount = 0

function generateXml(icon, svgContent, xmlFilePath) {
  const pathRegex = /<path[^>]+d="([^"]+)"/;
  const pathMatch = svgContent.match(pathRegex);
  const viewBoxRegex = /viewBox="([^"]+)"\s*/;
  const viewBoxMatch = svgContent.match(viewBoxRegex);
  const viewBoxValues = viewBoxMatch[1].split(" ");

  const viewBoxWidth = viewBoxValues[2];
  const viewBoxHeight = viewBoxValues[3];
  console.log(`------ ${pathMatch} ------`);
  if (!viewBoxMatch || !pathMatch || viewBoxValues.length < 4) {
    console.log(`Invalid SVG content for ${icon}`);
    return;
  }

  const rawpath = pathMatch[1];
  // Replace occurrences of '-.' with '-0.' in the path data
  const path = rawpath.replace(/([^0-9])\./g, "$10.");
  //const padding = ((viewBoxHeight/ 100)  * 16)
  //const vb = 512
  let paddedViewBox = 675.84;
  let swidth = parseInt((paddedViewBox - viewBoxWidth) / 2);
  let sheight = parseInt((paddedViewBox - viewBoxHeight) / 2);
  let color = data_icons[icon].color;

  if (!color) color = defaultColor;
  let dp = data_icons[icon].dp;
  if (!dp) dp = "24";
  let nopadding = data_icons[icon].nopadding;
  if (nopadding) {
    paddedViewBox = "512";
    swidth = "0";
    sheight = "0";
  }

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${dp}dp"
    android:height="${dp}dp"
    android:viewportWidth="${paddedViewBox}"
    android:viewportHeight="${paddedViewBox}">
    <group
    android:translateX="${swidth}"
        android:translateY="${sheight}">
    <path
        android:pathData="${path}"
        android:fillColor="${color}"
        android:fillType="nonZero"
        />
    </group>
</vector>`;

  fs.writeFileSync(xmlFilePath, xmlContent);
  icount++
  console.log(`Generated: ${xmlFilePath}`);

  // Log the replaced icon names and spotted files
  const logEntry = `Icon '${icon}' replaced by '${xmlFilePath}', spotted files:\n`;
  const imagePaths = findImagesForIcon(icon, assetsFolderPath);
console.log(imagePaths); 
  const spottedFiles = imagePaths.filter((imagePath) =>
    imagePath.includes(icon)
  );

  if (spottedFiles.length > 0) {
    count+=spottedFiles.length
    const spottedFilesLog = spottedFiles.join("\n");
    const logContent = `${logEntry}${spottedFilesLog}\n\n`;
    fs.appendFileSync(buildLogPath, logContent);
  }
}

for (const icon in data_icons) {
  const i = data_icons[icon];
  let type = i.type;
  if (!type) type = "light";
  const xmlFilePath = targetPath + icon + ".xml";
  const svgPath = sourcePath + type + "/" + `${i["icon-name"]}.svg`;
  console.log(`------ ${icon} ------`);
  console.log(`Processing: ${svgPath}`);

  if (!fs.existsSync(svgPath)) {
    console.log(`Source doesn't exist: ${svgPath}`);
    process.exit();
  }

  const svgContent = fs.readFileSync(svgPath, "utf-8");

  generateXml(icon, svgContent, xmlFilePath);
}
const time = new Date()
fs.appendFileSync(buildLogPath, `\n------------------------------------\n${time}\nCount of spotted files : ${count}\nNumber of xml icons generated : ${icount}\n------------------------------------`);