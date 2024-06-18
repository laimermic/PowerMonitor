addEventListener("testSave", async (resolve, reject, args) => {
  try {
    console.log("testSave");
    resolve();
  } catch (error) {
    console.error(JSON.stringify(error));
    reject(error);
  }
});

addEventListener("testNotification", async (resolve, reject, args) => {
  try {
    fetch("https://pv.terrex.at/api/hellointhere")
      .then((response) => {
        console.log(response);
        console.log(response.json());
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  } catch (error) {
    console.error(JSON.stringify(error));
    reject(error);
  }
  // try {
  //   console.log("testNotification");
  //   let scheduleDate = new Date();
  //   console.log(scheduleDate.toLocaleTimeString());
  //   scheduleDate.setSeconds(scheduleDate.getSeconds() + 5);
  //   CapacitorNotifications.schedule([
  //     {
  //       id: 42,
  //       title: "Test Notification",
  //       body: "This Notification was scheduled from the runner",
  //       scheduleAt: scheduleDate,
  //     },
  //   ]);
  //   resolve();
  // } catch (error) {
  //   console.error(JSON.stringify(error));
  //   reject(error);
  // }
});
