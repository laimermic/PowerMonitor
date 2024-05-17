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
    let scheduleDate = new Date();
    scheduleDate.setSeconds(scheduleDate.getSeconds() + 5);
    CapacitorNotifications.schedule([
      {
        id: 42,
        title: "Test Notification",
        body: "This Notification was scheduled from the runner",
        scheduleAt: scheduleDate,
      },
    ]);
    resolve();
  } catch (error) {
    console.error(error);
    reject(error);
  }
});
