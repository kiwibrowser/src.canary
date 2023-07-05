const fs = require("fs");

const buildLogPath = "build.log"; // Specify the path for the image log file
const cleanLogPath = "clean.log"; // Specify the path for the deleted images log file
let count = 0;
// Read the image log file and delete the tracked images
function deleteTrackedImages() {
  const imageLogContent = fs.readFileSync(buildLogPath, "utf-8");
  const logEntries = imageLogContent.split("\n\n");

  logEntries.forEach((logEntry) => {
    const lines = logEntry.trim().split("\n");
    const replacedIcon = lines[0].match(/Icon '(.+)' replaced/)?.[1];
    const spottedFiles = lines.slice(1);

    spottedFiles.forEach((spottedFile) => {
      const imagePath = spottedFile.trim();
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Deleted: ${imagePath}`);
        fs.appendFileSync(cleanLogPath, `${replacedIcon}: ${imagePath}\n`);
        count++;
      }
    });
  });
  const time = new Date();
  fs.appendFileSync(
    cleanLogPath,
    `\n\n${time}\nNumber of deleted files : ${count}\n=====================================`
  );
}

// Call the function to delete the tracked images
deleteTrackedImages();
