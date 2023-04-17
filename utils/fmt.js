
// https://stackoverflow.com/a/2901298
function numToStr(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
  numToStr,
};

