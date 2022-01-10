const puppeteer = require("puppeteer");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("img");

  // Filters
  eleventyConfig.addFilter("formatNumber", (number) =>
    Intl.NumberFormat("en-UK").format(number)
  );
  eleventyConfig.addFilter("formatDate", (date) => {
    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", dateOptions);
  });

  eleventyConfig.setLiquidOptions({
    strict_filters: true,
  });

  // eleventyConfig.on("eleventy.after", async () => {

  // });
};
