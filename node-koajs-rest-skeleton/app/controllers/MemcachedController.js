"use strict";
const Memcached = require("memcached"),
    Q = require("q");
    var co = require('co');



let client = new Memcached("127.0.0.1:11211");

module.exports = {

    /**
     * @example curl -v -X GET "http://127.0.0.1:8081/memcached/bar"
     * @param next
     */
    getAction: function * (next){
        //this.body = yield Q.npost(client, "get", [this.params.key]);

        let getKey = function(key){
            return function(callback){
                client.get(key,callback);
            }
        };
        this.body = yield getKey(this.params.key);
        yield  next;

       // let key = this.params.key;
       // this.body = yield new Promise(function(resolve, reject){
       //    client.get(key, function(err, data){
       //        if (err) {reject(err)}
       //        resolve(data)
       //    });
       //});
       // yield next;


       // function get(url) {
       //     return function(fn){
       //         client.get(url, fn)
       //     }
       // }
       // this.body = yield get(this.params.key);
       // yield next

    },
    /** (client, "set", [this.request.body.key, this.request.body.value, this.request.body.expires])
     * curl -v -X PUT "http://127.0.0.1:8081/memcached/bar" -d '{"value":"rrrrr","expires":60}' -H "Content-Type: application/json"
     * @param next
     */
    putAction: function * (next){
    try{
        let setData = function(key, val, exp){
            return function(callback){
                client.replace(key, val, exp, callback);
                console.log(key, val, exp);

            }
        };
        this.body = yield setData(this.params.key, this.request.body.value, this.request.body.expires);
        yield next;
        this.status = 201;
        this.body = this.request.body;
    } catch(e){
        this.status = 400;
        this.body = {message: "Bad Request"};
    }

    },

    /**
     * Устанаваливает значение заданному ключу
     * @example curl -v -X POST "http://127.0.0.1:8081/memcached" -d 'key=bar&value=foo&expires=60'
     * @example curl -v -X POST "http://127.0.0.1:8081/memcached" -d '{"key":"bar","value":"foo","expires":60}' -H "Content-Type: application/json"
     * @param next
     */
    postAction: function * (next){

            try{
                yield Q.npost(client, "set", [this.request.body.key, this.request.body.value, this.request.body.expires]);
                this.status = 201;
                this.body = this.request.body;
            }catch(e){
                this.status = 400;
                this.body = {message: "Bad Request"};
            }

            yield next;

        },

    /**
     *
     * curl -v -X DELETE "http://127.0.0.1:8081/memcached/bar"
     * @param next
     */

    deleteAction: function * (next){
        try{
        let delData = function(key){
            return function(callback){
                client.delete(key, callback);
                //console.log(key)
            }
        };

        this.body = yield delData(this.params.key);
        yield next;
        yield next;
        this.status = 201;
        this.body = this.request.body;
    } catch(e){
        this.status = 400;
        this.body = {message: "Bad Request"};
    }

    }
};