const { getMeta, getUserMeta } = require("./data");
const fs = require("fs");
const moment = require("moment-timezone");

function toHHMMSS(sec_num) {
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  console.log(hours + ":" + minutes + ":" + seconds);
  return hours + ":" + minutes + ":" + seconds;
}
function formatToUnits(number, precision) {
  var SI_POSTFIXES = ["", " K", " M", " G", " T", " P", " E"];
  var tier = (Math.log10(Math.abs(number)) / 3) | 0;
  if (tier == 0) return number;
  var postfix = SI_POSTFIXES[tier];
  var scale = Math.pow(10, tier * 3);
  var scaled = number / scale;
  var formatted = scaled.toFixed(1) + "";
  if (/\.0$/.test(formatted))
    formatted = formatted.substr(0, formatted.length - 2);
  return formatted + postfix;
}

function parseMeta(JSONDATA) {
  let data = JSONDATA;
  let meta = {
    id: parseInt(data.aweme_id),
    title: data.desc,
    created_at: moment(data.create_time * 1000)
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss"),
    stats: {
      likeCount:
        data.statistics.like_count > 9999
          ? formatToUnits(data.statistics.like_count, 1)
          : data.statistics.like_count,
      commentCount:
        data.statistics.comment_count > 9999
          ? formatToUnits(data.statistics.comment_count, 1)
          : data.statistics.comment_count,
      shareCount:
        data.statistics.share_count > 9999
          ? formatToUnits(data.statistics.share_count, 1)
          : data.statistics.share_count,
      playCount:
        data.statistics.play_count > 9999
          ? formatToUnits(data.statistics.play_count, 1)
          : data.statistics.play_count,
      saveCount:
        data.statistics.share_count > 9999
          ? formatToUnits(data.statistics.share_count, 1)
          : data.statistics.share_count,
    },
    video: {
      noWatermark: data.video.play_addr.url_list[0],
      watermark: data.video.download_addr.url_list[0],
      cover: data.video.cover.url_list[0],
      dynamic_cover: data.video.dynamic_cover.url_list[0],
      origin_cover: data.video.origin_cover.url_list[0],
      width: data.video.width,
      height: data.video.height,
      durationFormatted: toHHMMSS(Math.floor(data.video.duration / 1000)),
      duration: Math.floor(data.video.duration / 1000),
      ratio: data.video.ratio,
    },
    music: data.music
      ? {
          id: data.music.id,
          title: data.music.title,
          author: data.music.author,
          cover_hd: data.music.cover_hd
            ? data.music.cover_hd.url_list[0]
            : null,
          cover_large: data.music.cover_large.url_list[0],
          cover_medium: data.music.cover_medium.url_list[0],
          cover_thumb: data.music.cover_thumb.url_list[0],
          durationFormatted: toHHMMSS(data.music.duration),
          duration: data.music.duration,
          play_url: data.music.play_url.url_list[0],
        }
      : {},
    author: data.author
      ? {
          id: data.author.uid,
          name: data.author.nickname,
          unique_id: data.author.unique_id,
          signature: data.author.signature,
          avatar: data.author.avatar_medium.url_list[0],
          avatar_thumb: data.author.avatar_thumb.url_list[0],
        }
      : {},
  };
  return meta;
}

module.exports = {
  getMeta: (url) =>
    new Promise((resolve, reject) => {
      getMeta(url)
        .then((data) => {
          resolve(parseMeta(data));
        })
        .catch((err) => {
          reject(err);
        });
    }),
};
