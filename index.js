const fs = require("fs");
const data_icons = require('./data_icons.json')
const path = require("path");
/*

"triangle-exclamation": {
    xmlFile: "incognito_splash",
    color:"#DADCDF",
    type:"solid",
    nopadding: true
  },
*/

const defaultColor = "@android:color/black";
const targetPath = "drawable/";
const sourcePath = "./node_modules/@fortawesome/fontawesome-pro/svgs/";
const padding = 8;
function generateXml(icon, svgContent, xmlFilePath) {
  const pathRegex = /<path[^>]+d="([^"]+)"/;
  const pathMatch = svgContent.match(pathRegex);
  const viewBoxRegex = /viewBox="([^"]+)"\s*/;
  const viewBoxMatch = svgContent.match(viewBoxRegex); 
  const viewBoxValues = viewBoxMatch[1].split(' ');
 
  const viewBoxWidth = viewBoxValues[2];
  const viewBoxHeight = viewBoxValues[3];
  console.log(`------ ${pathMatch} ------`);
  if (!viewBoxMatch || !pathMatch || viewBoxValues.length < 4) {
    console.log(`Invalid SVG content for ${icon}`);
    return;
  }

  const rawpath = pathMatch[1];
  // Replace occurrences of '-.' with '-0.' in the path data
  const path = rawpath.replace(/([^0-9])\./g, '$10.');
  const padding = ((viewBoxHeight/ 100)  * 16)
  const vb = 512
  let paddedViewBox = 675.84;

  let swidth = parseInt((paddedViewBox - viewBoxWidth ) / 2);
  let sheight = parseInt(( paddedViewBox - viewBoxHeight) / 2 );
  let color = data_icons[icon].color
  if( !color )
    color=defaultColor
  let dp = data_icons[icon].dp
  if( !dp )
      dp="24"
  let nopadding = data_icons[icon].nopadding
  if(nopadding){
    paddedViewBox ="512"
    swidth="0"
    sheight="0"
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
  console.log(`Generated: ${xmlFilePath}`);
}

for (const icon in data_icons) {
  const i = data_icons[icon];
  let type = i.type
  if(!type)
    type="light"
  const xmlFilePath = targetPath+icon + ".xml";
  const svgPath = sourcePath +type+"/"+ `${i['icon-name']}.svg`;
  console.log(`------ ${icon} ------`);
  console.log(`Processing: ${svgPath}`);

  if (!fs.existsSync(svgPath)) {
    console.log(`Source doesn't exist: ${svgPath}`);
    process.exit();
  }

  const svgContent = fs.readFileSync(svgPath, "utf-8");

  generateXml(icon, svgContent, xmlFilePath);
}
