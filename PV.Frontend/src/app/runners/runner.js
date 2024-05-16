const { CapacitorHttp } = require("@capacitor/core");

addEventListener("testSave", async (resolve, reject, args) => {
  try {
    console.log("testSave");
    resolve();
  } catch (error) {
    console.error(error);
    reject(error);
  }
});

addEventListener("testNotification", async (resolve, reject, args) => {
  try {
    console.log("testNotification");

    resolve();
  } catch (error) {
    console.error(error);
    reject(error);
  }
});
