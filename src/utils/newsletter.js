const generateNewsletter = async () => {
  const recentVideosTemplate = getRecentVideosTemplate();
  const tiktokTemplate = getRecentTikTokTemplate();
  const sharesTemplate = getLBTLinksTemplate();
  const podcastTemplate = getPodcastTemplate();
  const footerTemplate = getFooterTemplate();
  return [
    recentVideosTemplate,
    tiktokTemplate,
    sharesTemplate,
    podcastTemplate,
    footerTemplate,
  ].join("<br>");
};

const getLBTLinksTemplate = () => {
  const header = `<h1>Content From the #LearnBuildTeach Community
</h1><br>
<p><em><strong>Learn Build Teach</strong></em> is a personal philosophy and community. Here's the latest content from our <a href="https://learnbuildteach.com/">Discord community</a>.
</p>`;
  const closing = `<p>Want to share your work and learn from others? <a href="https://discord.gg/vM2bagU">Join the community</a></p>
`;
  //   const links = records
  //     .map(
  //       (record) =>
  //         `<li><a href="${record.link}">${record.title}</a> by ${record.discordUser}</li>`
  //     )
  //     .join("");
  return header + "<br>" + closing;
};

const getRecentVideosTemplate = (records) => {
  const header = `<h1>Recent Videos</h1>`;
  const links = "";
  //   records
  //     .map((record) => {
  //       const smallImageURL = record.coverImage[0].thumbnails.large.url;
  //       return `</br><h3><a href="${record.link}">${record.title}</a></h3><br/><img src="${smallImageURL}" alt="${record.title} Cover Image"/><br/>`;
  //     })
  //     .join("");
  return header + "</br>" + links;
};

const getRecentTikTokTemplate = () => {
  return `
        <p>Describe the TikTok</p>
        <p><a href="">Watch the full video</a></p>`;
};
// const getStreamTemplate = (streamInfo) => {
//   if (!streamInfo) return "";
//   let { coverImageURL } = streamInfo;
//   coverImageURL = coverImageURL.replace("/v1", "/w_600/v1");

//   return `<h1>Today's Stream - ${streamInfo.streamTitle} with ${streamInfo.fullName}</h1>
//   <img src="${coverImageURL}"/><br>
//   <p>We will go live at 11 am CST on Twitch! <a href="https://www.twitch.tv/jamesqquick">Join us on Twitch!</a></p>`;
// };

const getPodcastTemplate = () => {
  return `<h1>Compressed.fm Podcast</h1>
  <p>In the most recent episode, James and Amy...
  <p><a href="http://compressed.fm/">Listen to the full episode</a></p>`;
};

// const getHeaderTemplate = (newsletterInfo) => {
//   if (!newsletterInfo) return "";
//   const { intro } = newsletterInfo;
//   const introHTML = converter.makeHtml(intro);
//   return introHTML;
// };

const getFooterTemplate = () => {
  return `
  <h1>Want to Stay Connected?</h1>
  <ul>
    <li>Follow me on <a href="https://twitter.com/jamesqquick">Twitter</a> and <a href="https://www.tiktok.com/@jamesqquick">TikTok</a></li>
    <li>Join the <a href="https://learnbuildteach.com/">Learn Build Teach Discord</a></li>
    <li>Subscribe to my <a href="https://www.youtube.com/c/jamesqquick">YouTube Channel</a></li>
  </ul>`;
};

module.exports = { generateNewsletter };
