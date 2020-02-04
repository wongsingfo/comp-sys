(function() {
  'use strict';
  let inputs = document.getElementsByClassName("mahjong");

  function getTileUrl(text) {
    function getFileName(type, num) {
      var z = ["Ton", "Nan", "Shaa", "Pei", "Haku", "Hatsu", "Chun"];

      var url = "";
      if (type === 'm') {
        url += "Man";
      } else if (type === 'p') {
        url += "Pin";
      } else if (type === 's') {
        url += "Sou";
      } else if (type === 'z') {
        return z[num - 1];
      } else {
        return "";
      }

      if (num == 0) {
        url += "5-Dora";
      } else if (1 <= num && num <= 9) {
        url += num;
      }
      return url;
    }


    if (text.length !== 2) {
      log.error("unknown type " + text);
      return "";
    }
    let num = text[0];
    let type = text[1];
    var url = getFileName(type, num);
    if (url == "") {
      log.error("unknown type " + text);
      return "";
    }

    return "/comp-sys/assets/maj/" + url + ".svg";
  }

  for (let item of inputs) {
    item.classList.add("mahjong-container");
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Node
    (function() {
      let input = item.textContent;
      item.textContent = "";

      var s = input.trim().split(/\s+/);

      for (var group of s) {
        let type = group[group.length - 1];
        for (var num of group.substring(0, group.length - 1)) {
          var img = document.createElement("img");
          /* fixme: site.baseurl */
          img.src = getTileUrl(num + type);

          // if (_ % 2 === 0) {
          //   img.classList.add("mahjong-rotate");
          // } else {
            img.classList.add("mahjong-tile");
          // }

          item.appendChild(img);
          item.appendChild(img);
        }
      }
    })()
  }
})() 