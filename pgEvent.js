const ID = "id"

export class PgEvent {
  constructor() {
    this.data = {
      type: "blockly-type",
      event: 0,
      message: "",
      id: "",
      state: "",
    };
  }

  getValues() {
    const url = document.location.href;
    const paths = url.split("?");
    //console.log(paths)
    if (paths.length < 2) {
      return;
    }
      
    const queryStrings = paths[1].split("&")
    for (const qs of queryStrings) {
      if (qs.length < 2) {
        continue;
      }

      const values = qs.split("=");
      if (values.length < 2) {
        continue;
      }
      switch (values[0]) {
        case ID: 
          this.data[ID] = values[1];
          break;
      }
    }
  }

  onSuccessEvent(message) {
    this.data["event"] = "SUCCESS";
    this.data["message"] = message;
    window.top.postMessage(this.data, "*");
  }

  onFailEvent(message) {
    this.data["event"] = "FAILURE";
    this.data["message"] = message;
    window.top.postMessage(this.data, "*");
  }

  sendState(state) {
    this.data["event"] = "STATE"
    this.data["state"] = state
    window.top.postMessage(this.data, "*");
  }
}
