const progressBarLength = 25;

const progressBar = (current, goal) => {
  return _progressBar2({
    value: current,
    length: progressBarLength,
    title: "",
    vmin: 0,
    vmax: goal,
    progressive: false,
  });
};

const _progressBar = ({
  value,
  length = 40,
  title = " ",
  vmin = 0.0,
  vmax = 1.0,
  progressive = false,
}) => {
  // Block progression is 1/8
  const blocks = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];
  const rsep = "▏",
    lsep = "▕";

  // Normalize value
  const normalized_value =
    (Math.min(Math.max(value, vmin), vmax) - vmin) / Number(vmax - vmin);
  const v = normalized_value * length;
  const x = Math.floor(v); // integer part
  const y = v - x; // fractional part
  const i = Math.round(y * 8);
  const bar = Array(x).fill("█").join("") + blocks[i];
  const remaining = Array(length - bar.length)
    .fill("  ")
    .join("");
  return `${title} ${lsep}${bar}${!progressive ? remaining : ""}${rsep} ${
    Math.round(normalized_value * 100 * 100) / 100
  }%`;
};

const _progressBar2 = ({
  value,
  length = 40,
  title = " ",
  vmin = 0.0,
  vmax = 1.0,
  progressive = false,
}) => {
  value = Math.max(value, vmin);
  // Block progression is 1/8
  // const blocks = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];
  const blocks = ["▰", "▱"];
  // const rsep = "▏",
  //   lsep = "▕";

  // Normalize value
  const normalized_value =
    (Math.min(Math.max(value, vmin), vmax) - vmin) / Number(vmax - vmin);
  const v = normalized_value * length;
  const x = Math.round(v); // integer part
  // const y = v - x; // fractional part
  // const i = Math.round(y * 8);
  const bar = Array(x).fill("▰").join(""); //+ blocks[i];
  const remaining = Array(length - bar.length)
    .fill("▱")
    .join("");
  return `${title} ${bar}${!progressive ? remaining : ""} ${
    Math.round(normalized_value * 100 * 100) / 100
  }%`;
  // return `${title} ${lsep}${bar}${!progressive ? remaining : ""}${rsep} ${
  //   Math.round(normalized_value * 100 * 100) / 100
  // }%`;
};

function getProgressCharacter(current, goal) {
  return _getProgressCharacter(current, 0, goal);
}

function _getProgressCharacter(number, min, max) {
  number = Math.min(Math.max(number, min), max);
  if (number < min || number > max) {
    throw new Error(
      `Invalid input, number should be between ${min} and ${max}`
    );
  }
  const percent = (number - min) / (max - min);
  const characters = " ▁▂▃▄▅▆▇█";
  const index = Math.floor(percent * (characters.length - 1));
  // return "▕" + characters[index] + "▏";
  return characters[index];
}

const main = () => {
  let prevStr = "";
  for (let i = 0; i < 1000; i++) {
    prevStr =
      Array(prevStr.length).fill("\b").join("") +
      progressBar({ value: i, vmin: 0, vmax: 999 });
    process.stderr.write(prevStr);
  }
  prevStr = "";
  for (let i = 0; i < 1000; i++) {
    prevStr =
      Array(prevStr.length).fill("\b").join("") +
      progressBar({ value: i, vmin: 0, vmax: 999, progressive: true });
    process.stderr.write(prevStr);
  }
};

module.exports = {
  getProgressCharacter,
  progressBar,
};
