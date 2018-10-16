class Observer {
  constructor(...props) {
    this.events = {};
    console.log(props)
  }
  emit(type, ...args) {
    this.events[type].forEach(fn => fn(...args));
  }
  off(type, fn) {    
    Object.assign(this.events, { [type]: this.events[type].filter(x => x !== fn) });
  }
  on(type, fn) {
    Object.assign(this.events, {
      [type]: (this.events[type] || []).concat([fn])
    });
  }
  once(type, fn) {

  }
  
}

const observer = new Observer(1, 2, 3);

const notify = (...args) => console.log("notify:", args);
const openDialog = (...args) => console.log("openDialog:", args);

observer.on("click", notify);
observer.on("click", openDialog);
observer.on("doubleclick", notify);

observer.emit("click", 1, 2, 3);
observer.emit("click");
observer.emit("doubleclick");

/* observer.off("click", notify);
observer.off("click", openDialog);
observer.emit("click"); */
