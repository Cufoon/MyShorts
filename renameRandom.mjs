import fs from "node:fs";
import path from "node:path";
(() => {
  const args = process.argv;
  if (args.length < 3) {
    console.log("需要传入一个文件夹路径");
    return;
  }

  let folder = args[2];

  if (!path.isAbsolute(folder)) {
    folder = path.resolve(".", folder);
  }

  const timeFormater = Intl.DateTimeFormat("chinese", {
    timeZone: "Asia/Shanghai",
    hourCycle: "h24",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    timeZoneName: "shortOffset",
  });

  const formatTime = (date) => {
    return timeFormater.format(date).replace(/\//g, "-");
  };

  const files = fs.readdirSync(folder);

  if (files.length === 0) {
    console.log("文件夹:", folder);
    console.log("此文件夹是空文件夹！");
    return;
  }
  const fileList = files.map((item) => {
    const itemPath = path.resolve(folder, item);
    const itemPathParsed = path.parse(itemPath);
    const info = fs.statSync(itemPath);
    return {
      folder: folder,
      name: itemPathParsed.name,
      ext: itemPathParsed.ext,
      timeOrigin: info.mtime.getTime(),
      timeString: formatTime(info.mtime.getTime()),
      path: itemPath,
    };
  });

  fileList.sort((a, b) => b.timeOrigin - a.timeOrigin);

  const numWidth = fileList.length.toFixed(0).length || 1;

  let randomNameLen = 12;
  if (args[3] === undefined || args[3] === null) {
    console.log("你没有传入随即名称长度，将默认12个字符。");
  } else {
    randomNameLen = parseInt(args[3]);
  }
  if (randomNameLen > 128) {
    console.log("随机字符串名称最长为128个字符！将按128个字符处理！");
    randomNameLen = 128;
  }
  if (randomNameLen < numWidth) {
    console.log("传入长度错误或过短，将自动选择一个合适的长度:", numWidth);
    randomNameLen = numWidth;
  }

  const charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const getRandomStr = (len) => {
    let result = "";
    for (let i = 0; i < len; i++) {
      const randomIndex = Math.floor(36 * Math.random());
      result += charList[randomIndex];
    }
    return result;
  };

  const generateRandomNameList = (len, diffwith) => {
    const result = [];
    for (let i = 0; i < len; i++) {
      let tmpName = getRandomStr(randomNameLen);
      while (
        diffwith.findIndex((i) => i.name.toUpperCase() === tmpName) > -1 ||
        result.indexOf(tmpName) > -1
      ) {
        tmpName = getRandomStr(randomNameLen);
      }
      result.push(tmpName);
    }
    return result;
  };

  const tempNames = generateRandomNameList(fileList.length, fileList);

  const fl = fileList.map((item, index) => {
    const tempName = tempNames[index];
    const pathNext = path.resolve(item.folder, `${tempName}${item.ext}`);
    fs.renameSync(item.path, pathNext);
    return {
      ...item,
      pathNext: pathNext,
    };
  });

  console.log(fl);
})();
