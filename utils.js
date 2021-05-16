const request = require("request-promise");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const fetch = require("node-fetch");

const getListChapters = async (url) => {
  try {
    const res = await request(url);
    const $ = cheerio.load(res);
    const lists = [];
    $(".works-chapter-item.row").each(function () {
      const href = $(this).find("a").attr("href");
      lists.push(href);
    });
    return lists;
  } catch (error) {
    console.log(error);
  }
};

const getImagesInChapter = async (url) => {
  const lists = [];

  const res = await request(url);
  const $ = await cheerio.load(res);

  $("img.lazy").each(async function () {
    lists.push($(this).attr("src"));
  });
  return lists;
};

const createFolderManga = (folderName) => {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
};
const createFolderChapter = (folderName = "") => {
  const folderPath = path.resolve(__dirname, `./${folderName}`);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

const downloadImage = async (referer, url, filepath) => {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      referer: referer,
    },
    referrer: referer,
  });
  const buffer = await res.buffer();
  const fileLocation = path.resolve(__dirname, filepath);
  fs.writeFileSync(fileLocation, buffer);
};

module.exports = {
  downloadImage,
  getImagesInChapter,
  getListChapters,
  createFolderChapter,
  createFolderManga,
};
