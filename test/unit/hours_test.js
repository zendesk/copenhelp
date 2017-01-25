/*globals describe, it, beforeEach*/

var should = require('should');

describe("Hours", function() {
  var Hours = require('../../app/js/models/hours.js'),
      hours;

  beforeEach(function() {
    hours = new Hours({
      Sun: "9-18:00",
      Mon: "9-12:00,14:00-17",
      Tue: "9:00-18:00",
      Wed: "9-18",
      Thu: "00:00-23:59",
      Fri: "9:00-18:00",
      Sat: "9:00-11:00,14-17:30"
    });

  });

  describe("creating", function() {

    it("should convert text times to offsets", function() {
      hours.hours.should.eql({
        0: [[900,1800]],
        1: [[900,1200], [1400,1700]],
        2: [[900,1800]],
        3: [[900,1800]],
        4: [[0,2359]],
        5: [[900,1800]],
        6: [[900,1100], [1400, 1730]]
      });
    });

    describe("input validation", function() {
      it("should deal with garbage", function() {
        (function() { hours.addDay("Mon", ""); }).should.throwError(/Invalid time/);
        (function() { hours.addDay("Mon", "4pm"); }).should.throwError(/Invalid time/);
        (function() { hours.addDay("Mon", "abcd"); }).should.throwError(/Invalid time/);
        (function() { hours.addDay("Mon", "9PM-10PMgarbage"); }).should.throwError(/Invalid time/);

      });

      it("should deal with bad intervals", function() {
        (function() { hours.addDay("Mon", "9-9"); }).should.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "9-9"); }).should.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "4:30-12:00"); }).should.not.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "9:30-12:00"); }).should.not.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "9:30-1:30"); }).should.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "12:00-23:59"); }).should.not.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "12:00-00:00"); }).should.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "12:00-50"); }).should.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "12:00-50:00"); }).should.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "12:00-50"); }).should.throwError(/Invalid time/);
      });

      it("should allow spaces", function() {
        (function() { hours.addDay("Mon", "9-10, 11-12"); }).should.not.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "9 -10 , 11 -12 "); }).should.not.throwError(/Invalid time/);

        (function() { hours.addDay("Mon", "9:00  - 12:00 , 14:00  - 17:00 "); }).should.not.throwError(/Invalid time/);

      });

      it("should allow various versions of '24 hours'", function() {
        (function() { hours.addDay("Mon", "24hr"); }).should.not.throwError(/Invalid time/);
        (function() { hours.addDay("Mon", "24 hours"); }).should.not.throwError(/Invalid time/);
        (function() { hours.addDay("Mon", "24 HOURS"); }).should.not.throwError(/Invalid time/);
      });

      it("should convert '24 hours to 12am - 11:59pm'", function() {
        hours = new Hours();
        hours.addDay("Mon", "24 hours");
        hours.hours[1].should.eql([[0, 2359]]);
      });
    });
  });

  describe("#humanize", function() {
    beforeEach(function() {
      hours = new Hours({
        Sun: "9-18",
        Mon: "9-12,14-17",
        Tue: "9-12",
        Wed: "9-18",
        Fri: "0-18",
        Sat: "9:00-11:00,14-17:30"
      });
    });


    it('converts to templatable objects', function() {
      hours.humanize().should.eql([
        { day: 'Sunday', hours: '09:00 - 18:00' },
        { day: 'Monday', hours: '09:00 - 12:00, 14:00 - 17:00' },
        { day: 'Tuesday', hours: '09:00 - 12:00' },
        { day: 'Wednesday', hours: '09:00 - 18:00' },
        { day: 'Thursday', hours: null },
        { day: 'Friday', hours: '00:00 - 18:00' },
        { day: 'Saturday', hours: '09:00 - 11:00, 14:00 - 17:30' }
      ]);
    });

  });

  describe("#addDay", function() {
    beforeEach(function() {
      hours = new Hours();
    });

    it("should add open hours per day", function() {
      hours.addDay("Sun", "9:12-18");
      hours.addDay("Mon", "9-12,14-17");
      hours.addDay("Tue", "09-18");
      hours.addDay("Wed", "9:34-18");
      hours.addDay("Thu", "00:00-23:59");
      hours.addDay("Fri", "9-18:30");
      hours.addDay("Sat", "9-18");

      hours.hours.should.eql({
        0: [[912,1800]],
        1: [[900,1200], [1400,1700]],
        2: [[900,1800]],
        3: [[934,1800]],
        4: [[0,2359]],
        5: [[900,1830]],
        6: [[900,1800]]
      });

    });

  });

  describe("#within", function(){
    it("should work with strings", function() {
      hours.within("Sun,10:30").should.equal(true);
      hours.within("Sun,9:30").should.equal(true);
      hours.within("Thu,18:58").should.equal(true);
      hours.within("Mon,10:30").should.equal(true);
      hours.within("Mon,12:30").should.equal(false);
    });

    it("should work with dates", function() {
      hours.within(new Date(2013, 3, 7, 10, 30)).should.equal(true);
      hours.within(new Date(2013, 3, 1, 10, 30)).should.equal(true);
      hours.within(new Date(2013, 3, 1, 12, 30)).should.equal(false);
    });

  });

  describe("#isEmpty", function() {
    it("should usually say no", function() {
      hours.isEmpty().should.equal(false);
    });

    it("should say yes if hours has no keys", function() {
      new Hours().isEmpty().should.equal(true);
    });
  });

  describe("Hours.merge", function() {
    it('should merge hours', function() {
      var merged = Hours.merge(Hours.fromData({ }), Hours.fromData({ }));
      merged.hours.should.eql({});

      merged = Hours.merge(Hours.fromData({0:[[900,1700]]}),
                           Hours.fromData({1:[[900,1700]]}));

      merged.hours.should.eql({0: [[900,1700]], 1: [[900,1700]]});


      merged = Hours.merge(Hours.fromData({0:[[900,1700]]}),
                           Hours.fromData({0:[[900,1800]]}));

      merged.hours.should.eql({0: [[900,1800]]});

    });

    it('does not merge intervals that do not overlap', function() {
      var merged = Hours.merge(
        Hours.fromData({0:[[900, 1200]]}),
        Hours.fromData({0:[[1400, 1800]]})
      );

      merged.hours.should.eql({0: [[900, 1200], [1400, 1800]]});
    });
  });

  describe("#merge", function() {
    var merged;

    beforeEach(function() {
      merged = hours.merge();
    });

    it("should collapse intervals", function() {
      merged.hours.should.eql({
        0: [[900,1800]],
        1: [[900,1200], [1400, 1700]],
        2: [[900,1800]],
        3: [[900,1800]],
        4: [[0,2359]],
        5: [[900,1800]],
        6: [[900, 1100], [1400,1730]]
      });

    });
  });

});
