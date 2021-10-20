Classifier.prototype.categorize = function(text) {
   var words = text.split(" ");
   var self = this;
   var probabilities = {};
   var groups = [];
   var finals = {};

   //Find the groups
   for (var k in this.dictionaries) {groups.push(k);}
  
   for (var i = 0; i < words.length; i++) {
       //Ignore small words
       if (words[i].length <= 2) continue;
       //find the word in each group
       var sums = {};
       var probs = {};
       for (var j = 0; j < groups.length; j++) {
           if (!sums[words[i]]) sums[words[i]] = 0;
           if (!this.dictionaries[groups[j]][words[i]]) this.dictionaries[groups[j]][words[i]] = 0;
           sums[words[i]] += this.dictionaries[groups[j]][words[i]];
           probs[groups[j]] = (this.dictionaries[groups[j]][words[i]]) ? this.dictionaries[groups[j]][words[i]] : 0;
       }
       // Calculate the actual probability that a word is part of a group or another
       for (var j = 0; j < groups.length; j++) {
           (!probabilities[words[i]]) ? probabilities[words[i]] = {} : "";
           (!probs[groups[j]]) ? probabilities[words[i]][groups[j]] = 0 : probabilities[words[i]][groups[j]] = probs[groups[j]]/sums[words[i]];
       }
       //Average out the probabilities
       for (var j = 0; j < groups.length; j++) {
           if (!finals[groups[j]]) finals[groups[j]] = [];
           finals[groups[j]].push(probabilities[words[i]][groups[j]]);
       }
   }

   for (var i = 0; i < groups.length; i++) {
       finals[groups[i]] = average(finals[groups[i]]);
   }

   //Find the highest probability
   var highestGroup = "";
   var highestValue = 0;
   for (var group in finals) {
       if (finals[group] > highestValue) {
           highestGroup = group;
           highestValue = finals[group];
       }
   }

   return highestGroup;
};
