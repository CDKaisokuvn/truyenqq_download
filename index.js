const Redis = require("ioredis");
const kue = require("kue");

const queue = kue.createQueue({
  redis: {
    createClientFactory: function () {
      return new Redis();
    },
  },
});

queue.setMaxListeners(1000);

const {
  createFolderChapter,
  downloadImage,
  getImagesInChapter,
  createFolderManga,
  getListChapters,
} = require("./utils");

const mangaLink = "http://truyenqq.net/truyen-tranh/dao-hai-tac-128";
const mangaFolderName = "onepiece";

const main = async () => {
  createFolderManga(mangaFolderName);
  const chapters = await getListChapters(mangaLink);

  chapters.forEach((chapterLink) => {
    const job = queue
      .create("download_manga", chapterLink)
      .attempts(5)
      .save(function (error) {
        if (error) console.log(error);
        else console.log(job.id);
      });
  });

  queue.process("download_manga", 5, async function (job, done) {
    const chapterLink = job.data;
    const images = await getImagesInChapter(chapterLink);
    const folderName =
      mangaFolderName + "/" + chapterLink.split("/")[4].split(".")[0];

    createFolderChapter(folderName);

    await Promise.all(
      images.map(async (link, index) => {
        await downloadImage(
          chapterLink,
          link,
          `./${folderName}/${index}.jpg`
        );
      })
    );
    console.log(`finish ${folderName}`);
    done();
  });
};
main();
