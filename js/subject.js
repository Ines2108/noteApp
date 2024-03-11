export default class Subject {
    constructor() {
        //assoziativer Array mit Array
        this.observers = [];
    }

    subscribe(topic, listenerObj, callbackFct) {
        if (this.observers[topic] == undefined) {
            this.observers[topic] = [];
        }
        this.observers[topic].push({
            obj: listenerObj,
            fct: callbackFct,
        });
    }

    unsubscribe(topic, listenerObj) {
        if(this.observers[topic]!=undefined){
            let observersForTopic = this.observers[topic];
            if (observersForTopic){
                for (let i=0; i < observersForTopic.length;i++){
                    if(observersForTopic[i].obj === listenerObj){
                        console.log("removing observer");
                        observersForTopic.splice(i,1);
                        return;
                    }
                }
            } else {
                throw "ERROR: Could not found desired topic " + topic;
            }
        }
    }

    notify(topic, param) {
        let observersForTopic = this.observers[topic];
        if(observersForTopic){
            for (let observer of observersForTopic) {
                observer.fct.call(observer.obj, param);
            }
        } else {
            throw "ERROR: Could not found desired topic " + topic;
        }
    }
}
