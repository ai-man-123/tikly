const _api = "https://api2.musical.ly/aweme/v1/feed/?";
const axios = require("axios");

function randomChar(str, length) {
  var result = "";
  for (var i = length; i > 0; --i)
    result += str[Math.round(Math.random() * (str.length - 1))];
  return result;
}

function getVideoID(tiktok_url) {
  if (!tiktok_url || tiktok_url == "" || !tiktok_url.split("video/")[1])
    throw new Error(`Error: Video not found!`);
  var video_id = tiktok_url.split("video/")[1].split("/")[0].split("?")[0];
  return video_id;
}

function expandUrl(tiktok_url) {
    return axios.head(tiktok_url).then((res) => {
        return res.request.res.responseUrl;
    }).catch((err) => {
        throw new Error(`Error: Video not found!`);
    });
}

const buildHead = (id) => {
  return {
    /* eslint-disable */
    headers: {
      "User-Agent":
        "com.ss.android.ugc.trill/260103 (Linux; U; Android 10; en_US; Pixel 4; Build/QQ3A.200805.001; Cronet/58.0.2991.0)",
      Accept: "application/json",
    },
    params: {
      aweme_id: id,
      version_name: "26.1.3",
      version_code: "260103",
      build_number: "26.1.3",
      manifest_version_code: "260103",
      update_version_code: "260103",
      openudid: randomChar("0123456789abcdef", 16),
      uuid: randomChar("1234567890", 16),
      _rticket: Date.now() * 1000,
      ts: Date.now(),
      device_brand: "Google",
      device_type: "Pixel 4",
      device_platform: "android",
      resolution: "1080*1920",
      dpi: 420,
      os_version: "10",
      os_api: "29",
      carrier_region: "US",
      sys_region: "US",
      region: "US",
      app_name: "trill",
      app_language: "en",
      language: "en",
      timezone_name: "America/New_York",
      timezone_offset: "-14400",
      channel: "googleplay",
      ac: "wifi",
      mcc_mnc: "310260",
      is_my_cn: 0,
      aid: 1180,
      ssmix: "a",
      as: "a1qwert123",
      cp: "cbfhckdckkde1",
    },
    /* eslint-enable */
  };
};

const buildUrl = (id) => {
  return _api + new URLSearchParams(buildHead(id).params);
};

function getMeta(tiktok_url) {
  return expandUrl(tiktok_url).then((res) => {
    let video_id = getVideoID(res);
    let headers = buildHead(getVideoID(res));
    return axios
      .get(buildUrl(getVideoID(res)), {
        headers: headers,
      })
      .then((res) => {
		if (!res.data.aweme_list) throw new Error(`Can't get video metadata, Please try again!`);
        if (res.data.aweme_list.length == 0)
          throw new Error(`Video not found!`);
        datas = res.data.aweme_list.find((x) => x && x.aweme_id && x.aweme_id == video_id);
        if (!datas) throw new Error(`Video not found!`);
        return datas 
      });
  });
}

module.exports = {
  getMeta,
};
