var stemmer = require('./porter-stemmer');
function BayesClassifier() {

  if (!(this instanceof BayesClassifier)) {
    return new BayesClassifier();
  }

  this.stemmer = stemmer;

  this.docs = [];
  this.lastAdded = 0;


  this.features = {};

  this.classFeatures = {};

  this.classTotals = {};
  this.totalExamples = 1;
  this.smoothing = 1;
}

BayesClassifier.prototype.addDocument = function(doc, label) {
  if (!this._size(doc)) {
    return;
  }

  if (this._isString(doc)) {
    doc = this.stemmer.tokenizeAndStem(doc);
  }

  var docObj = {
    label: label,
    value: doc
  };

  this.docs.push(docObj);
  for (var i = 0; i < doc.length; i++) {
    this.features[doc[i]] = 1;
  }
};
BayesClassifier.prototype.addDocuments = function(docs, label) {
  for (var i = 0; i < docs.length; i++) {
    this.addDocument(docs[i], label);
  }
};


BayesClassifier.prototype.docToFeatures = function(doc) {
  var features = [];

  if (this._isString(doc)) {
    doc = this.stemmer.tokenizeAndStem(doc);
  }

  for (var feature in this.features) {
    features.push(Number(!!~doc.indexOf(feature)));
  }

  return features;
};

BayesClassifier.prototype.classify = function(doc) {
  var classifications = this.getClassifications(doc);
  if (!this._size(classifications)) {
    throw 'Not trained';
  }
  return classifications[0].label;
};


BayesClassifier.prototype.train = function() {
  var totalDocs = this.docs.length;
  for (var i = this.lastAdded; i < totalDocs; i++) {
    var features = this.docToFeatures(this.docs[i].value);
    this.addExample(features, this.docs[i].label);
    this.lastAdded++;
  }
};


BayesClassifier.prototype.addExample = function(docFeatures, label) {
  if (!this.classFeatures[label]) {
    this.classFeatures[label] = {};
    this.classTotals[label] = 1;
  }

  this.totalExamples++;

  if (this._isArray(docFeatures)) {
    var i = docFeatures.length;
    this.classTotals[label]++;

    while(i--) {
      if (docFeatures[i]) {
        if (this.classFeatures[label][i]) {
          this.classFeatures[label][i]++;
        } else {
          this.classFeatures[label][i] = 1 + this.smoothing;
        }
      }
    }
  } else {
    for (var key in docFeatures) {
      value = docFeatures[key];

      if (this.classFeatures[label][value]) {
        this.classFeatures[label][value]++;
      } else {
        this.classFeatures[label][value] = 1 + this.smoothing;
      }
    }
  }
};

BayesClassifier.prototype.probabilityOfClass = function(docFeatures, label) {
  var count = 0;
  var prob = 0;

  if (this._isArray(docFeatures)) {
    var i = docFeatures.length;

    while(i--) {
      if (docFeatures[i]) {
        count = this.classFeatures[label][i] || this.smoothing;
        prob += Math.log(count / this.classTotals[label]);
      }
    }
  } else {
    for (var key in docFeatures) {
      count = this.classFeatures[label][docFeatures[key]] || this.smoothing;
      prob += Math.log(count / this.classTotals[label]);
    }
  }

  var featureRatio = (this.classTotals[label] / this.totalExamples);

  prob = featureRatio * Math.exp(prob);

  return prob;
};

BayesClassifier.prototype.getClassifications = function(doc) {
  var classifier = this;
  var labels = [];

  for (var className in this.classFeatures) {
    labels.push({
      label: className,
      value: classifier.probabilityOfClass(this.docToFeatures(doc), className)
    });
  }

  return labels.sort(function(x, y) {
    return y.value - x.value;
  });
};

BayesClassifier.prototype._isString = function(s) {
  return typeof(s) === 'string' || s instanceof String;
};

BayesClassifier.prototype._isArray = function(s) {
  return Array.isArray(s);
};

BayesClassifier.prototype._isObject = function(s) {
  return typeof(s) === 'object' || s instanceof Object;
};

BayesClassifier.prototype._size = function(s) {
  if (this._isArray(s) || this._isString(s) || this._isObject(s)) {
    return s.length;
  }
  return 0;
};

module.exports = BayesClassifier;

Usage

Now we get to use the Bayes classifier. Here’s an example to classify a statement as either positive or negative. The algorithm must first learn from a training set of data.

var BayesClassifier = require('../bayes-classifier');
var classifier = new BayesClassifier();

var positiveDocuments = [
  'I love tacos.',
  'Dude, that burrito was epic!',
  'Holy cow, these nachos are so good and tasty.',
  'I am drooling over the awesome bean and cheese quesadillas.'
];

var negativeDocuments = [
  'Gross, worst taco ever.',
  'The buritos gave me horrible diarrhea.',
  'I\'m going to puke if I eat another bad nacho.',
  'I\'d rather die than eat those nasty enchiladas.'
];

classifier.addDocuments(positiveDocuments, 'positive');
classifier.addDocuments(negativeDocuments, 'negative');

classifier.train();

console.log(classifier.classify('I heard the mexican restaurant is great!')); // "positive"
console.log(classifier.classify('I don\'t want to eat there again.')); // "negative"
console.log(classifier.classify('The torta is epicly bad.')); // "negative"
console.log(classifier.classify('The torta is horribly awesome.')); // "positive"
