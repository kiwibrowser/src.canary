const fs = require("fs");
const data_icons = require("./data_icons.json");
const path = require("path");

const defaultColor = "@android:color/black";

const drawable_xml_path = "./chrome/android/java/res/drawable/";
const fa_path = "./node_modules/@fortawesome/fontawesome-pro/svgs/";
const chrome_root_path = "./chrome/"; // Specify the path to the image folder
const build_log_path = "build.log"; // Specify the path for the image log file
const gni_path = "./chrome/android/kiwi_java_resources.gni";

var kiwiJavaResources;
var chromeJavaResourcesToRemove;
var kiwi_java_resources;
const regex1 = /kiwi_java_resources\s*=\s*\[([\s\S]*?)\]/;
const regex2 = /chrome_java_resources_to_remove\s*=\s*\[([\s\S]*?)\]/;

function addToKiwiJavaResources(item) {
  let formattedItem = item.replace(/\.\//, "").replace(/chrome\/android\//, "");
  const pushItem = `"${formattedItem}"`;
  if (!kiwiJavaResources.includes(pushItem)) {
    kiwiJavaResources.push(pushItem);
    fs.appendFileSync(
      build_log_path,
      `Item '${pushItem}' added to kiwiJavaResources.\n`
    );
  } else {
    fs.appendFileSync(
      build_log_path,
      `Item '${pushItem}' already exists in kiwiJavaResources.\n`
    );
  }
}
function addToChromeJavaResourcesToRemove(item) {
  let formattedItem = item.replace(/\.\//, "").replace(/chrome\/android\//, "");
  const pushItem = `"${formattedItem}"`;
  if (!chromeJavaResourcesToRemove.includes(pushItem)) {
    chromeJavaResourcesToRemove.push(pushItem);
    fs.appendFileSync(
      build_log_path,
      `Item '${pushItem}' added to chromeJavaResourcesToRemove.\n`
    );
  } else {
    fs.appendFileSync(
      build_log_path,
      `Item '${pushItem}' already exists in chromeJavaResourcesToRemove.\n`
    );
  }
}
function removeFromKiwiJavaResources(item) {
  let formattedItem = item.replace(/\.\//, "").replace(/chrome\/android\//, "");
  const pushItem = `"${formattedItem}"`;
  const index = kiwiJavaResources.indexOf(pushItem);
  if (index !== -1) {
    kiwiJavaResources.splice(index, 1);
    fs.appendFileSync(
      build_log_path,
      `Remove : Item '${pushItem}' removed from kiwiJavaResources.\n`
    );
  } else {
    fs.appendFileSync(
      build_log_path,
      `Remove : Item '${pushItem}' does not exist in kiwiJavaResources.\n`
    );
  }
}
function updateContent() {
  const string1 = kiwiJavaResources.map((item) => `    ${item}`).join(",\n");
  const string2 = chromeJavaResourcesToRemove
    .map((item) => `    ${item}`)
    .join(",\n");

  var updatedContent = kiwi_java_resources.replace(
    regex1,
    `kiwi_java_resources = [\n${string1}\n]`
  );
  updatedContent = updatedContent.replace(
    regex2,
    `chrome_java_resources_to_remove = [\n${string2}\n]`
  );

  fs.writeFile(gni_path, updatedContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File updated successfully!");
  });
}

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
let count = 0;
let icount = 0;

function generateXml(icon, svgContent, xmlFilePath) {
  const pathRegex = /<path[^>]+d="([^"]+)"/;
  const pathMatch = svgContent.match(pathRegex);
  const viewBoxRegex = /viewBox="([^"]+)"\s*/;
  const viewBoxMatch = svgContent.match(viewBoxRegex);
  const viewBoxValues = viewBoxMatch[1].split(" ");

  const viewBoxWidth = viewBoxValues[2];
  const viewBoxHeight = viewBoxValues[3];
  //console.log(`------ ${pathMatch} ------`);
  if (!viewBoxMatch || !pathMatch || viewBoxValues.length < 4) {
    console.log(`Invalid SVG content for ${icon}`);
    return;
  }

  const rawpath = pathMatch[1];
  // Replace occurrences of '-.' with '-0.' in the path data
  const path = rawpath.replace(/([^0-9])\./g, "$10.");
  
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
  icount++;
  console.log(`Generated: ${xmlFilePath}`);
  addToKiwiJavaResources(xmlFilePath);
  // Log the replaced icon names and spotted files
  const imagePaths = findImagesForIcon(icon, chrome_root_path);
  fs.appendFileSync(
    build_log_path,
    `Icon '${icon}' replaced by '${xmlFilePath}', changes:\n`
  );
  const spottedFiles = imagePaths.filter((imagePath) =>
    imagePath.includes(icon)
  );

  if (spottedFiles.length > 0) {
    count += spottedFiles.length;
    const spottedFilesLog = spottedFiles.join("\n");
    spottedFiles.map((item) => {
      removeFromKiwiJavaResources(item);
      addToChromeJavaResourcesToRemove(item);
    });
  }
}

try {
  kiwi_java_resources = fs.readFileSync(gni_path, "utf8").toString();
  console.log(kiwi_java_resources);

  // Use regex to find the arrays
  const match1 = kiwi_java_resources.match(regex1);
  const match2 = kiwi_java_resources.match(regex2);
  console.log(kiwi_java_resources);
  if (!match1 || !match2) return console.error("Arrays not found in file.");

  // Extract the array string and parse it into an actual array
  const arrayString1 = match1[1];
  const arrayString2 = match2[1];
  kiwiJavaResources = arrayString1
    .split(/\s*,\s*/)
    .map((item) => item.trim())
    .filter((item) => item !== "");

  chromeJavaResourcesToRemove = arrayString2
    .split(/\s*,\s*/)
    .map((item) => item.trim())
    .filter((item) => item !== "");

  for (const icon in data_icons) {
    const i = data_icons[icon];
    let type = i.type;
    if (!type) type = "light";
    const xmlFilePath = drawable_xml_path + icon + ".xml";
    const svgPath = fa_path + type + "/" + `${i["icon-name"]}.svg`;

    if (!fs.existsSync(svgPath)) {
      console.log(`Source doesn't exist: ${svgPath}`);
      process.exit();
    }

    const svgContent = fs.readFileSync(svgPath, "utf-8");

    generateXml(icon, svgContent, xmlFilePath);
    fs.appendFileSync(
      build_log_path,
      `---------------------------------------\n`
    );
  }
  const time = new Date();
  fs.appendFileSync(
    build_log_path,
    `\n${time}\nCount of spotted files : ${count}\nNumber of xml icons generated : ${icount}\n=====================================\n\n\n`
  );
  //console.log(kiwiJavaResources);
  updateContent();
} catch (error) {
  console.log(error);
}
