/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const CONNECTION_STRING = process.env.DB;

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        if (!err) {
          console.log("Connection with Database Established.");
          let db = client.db("library");
          db.collection("books")
            .find({})
            .toArray()
            .then(result => {
              result.map(val => {
                val["commentcount"] = val["comments"].length;
                delete val.comments;
              });
              res.json(result);
            });
        } else {
          console.log("Error in Connecting to Database!!");
        }
      });
    })

    .post(function(req, res) {
      var title = req.body.title;
      let newBookSample = {
        title: title,
        comments: []
      };
      if (title) {
        MongoClient.connect(CONNECTION_STRING, function(err, client) {
          if (!err) {
            console.log("Connection with Database Established.");
            let db = client.db("library");
            db.collection("books")
              .insertOne(newBookSample)
              .then(result => {
                res.json(newBookSample);
              });
          } else {
            console.log("Error in Connecting to Database!!");
          }
        });
      }
    })

    .delete(function(req, res) {
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        if (!err) {
          console.log("Connection with Database Established.");
          let db = client.db("library");
          db.collection("books").deleteMany({});
        } else {
          console.log("Error in Connecting to Database!!");
        }
      });
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        if (!err) {
          console.log("Connection with Database Established.");
          let db = client.db("library");
          db.collection("books")
            .findOne({ _id: ObjectId(bookid) })
            .then(result => {
              if (!result) {
                res.send("no book exists");
              } else {
                result["commentcount"] = result["comments"].length;
                res.json(result);
              }
            });
        } else {
          console.log("Error in Connecting to Database!!");
        }
      });
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        if (!err) {
          console.log("Connection with Database Established.");
          let db = client.db("library");
          db.collection("books")
            .findOneAndUpdate(
              { _id: ObjectId(bookid) },
              { $push: { comments: comment } }
            )
            .then(result => {
              result["value"]["comments"].push(comment);
              res.json(result["value"]);
            });
        } else {
          console.log("Error in Connecting to Database!!");
        }
      });
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        if (!err) {
          let db = client.db("library");
          db.collection("books").deleteOne({ _id: ObjectId(bookid) }).then(() => {
            res.send("delete successful");
          });
        } else {
          console.log("Error in Connecting to Database!!");
        }
      });
    });
};
