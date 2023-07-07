const fs = require("fs");
const gni_path = "./chrome/android/kiwi_java_resources.gni";
const regex2 = /chrome_java_resources_to_remove\s*=\s*\[([\s\S]*?)\]/;
const chrome_root_path = "./chrome/android/"; // Specify the path to the image folder
const cleanLogPath = "tmp/clean.log"; // Specify the path for the deleted images log file
let count = 0;

try {
    kiwi_java_resources = fs.readFileSync(gni_path, "utf8").toString();
    const match2 = kiwi_java_resources.match(regex2);
    
    if (!match2) return console.error("Arrays not found in file.");
  
    const arrayString2 = match2[1];
    chromeJavaResourcesToRemove = arrayString2.split(/\s*,\s*/).map((item) => item.trim()).filter((item) => item !== '');

    chromeJavaResourcesToRemove.forEach((entry) => {
        let path = chrome_root_path+entry.replaceAll('"','')
        console.log(path)
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            console.log(`Deleted: ${path}`);
            fs.appendFileSync(cleanLogPath, ` Deleted: ${path}\n`);
            count++;
          }
      });
      if(count>0){
        const time = new Date();
        fs.appendFileSync(
            cleanLogPath,
            `\n\n${time}\nNumber of deleted files : ${count}\n=====================================`
        );
      }
}catch(error){
    console.log(error);
}  

