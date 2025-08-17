class SecToMin {
  constructor() {}

  transferFromSecToMin(totalSec) {
    const min = String(Math.floor(totalSec / 60));
    const second = String(Math.floor(totalSec % 60)).padStart(2, "0");
    return `${min}:${second}`;
  }
}

const secToMin = new SecToMin();

export default secToMin;
