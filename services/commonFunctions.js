const { UniqueId } = require("../models/uniqueId");

module.exports = function(stringData, dataObject) {
  let keyArray = Object.keys(dataObject);
  let valueArray = Object.values(dataObject);

  let newString = stringData;
  keyArray.forEach(function(element, index) {
    let text = new RegExp("\\$" + element + "\\$", "g");
    newString = newString.replace(text, valueArray[index]);
  });
  return newString;
};

module.exports.generateID = async function() {
  let unique = async function() {
    let tempID = new UniqueId({
      _id: (
        Math.random()
          .toString(36)
          .substr(2, 2) +
        Date.now()
          .toString(36)
          .substr(4, 4) +
        Math.random()
          .toString(36)
          .substr(2, 2)
      ).toUpperCase()
    });
    return tempID;
  };

  let loopFlag = true;

  while (loopFlag) {
    var uniqueid = await unique();

    try {
      await uniqueid.save();
      loopFlag = false;
    } catch (Ex) {
      if (Ex.code === 11000) {
      } else return res.send({ msg: Ex });
    }
  }
  return uniqueid._id;
};
