var _ = require('underscore');

var days = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6
};

var daysInverse = _.invert(days);

function fail(str) {
  throw new Error("Invalid time string: " + str);
}

var parseTime = function parseTime(str) {
  var match, hour, min;

  match = str.match(/^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/);
  if(!match || !match[1]) {
    fail(str);
  }

  hour = parseInt(match[1], 10);

  if(match[2]) {
    min = parseInt(match[2].replace(":",""), 10);
  } else {
    min = 0;
  }

  return [hour, min];

};

var timeToOffset = function(time) {
  return time.getHours()*100 + time.getMinutes();
};

var timeStringToOffset = function(timeString) {
  var parsed = parseTime(timeString),
      val = parsed[0]*100 + parsed[1];

  return val;
};

var is24HourString = function(timeString) {
  return timeString.match(/^24\s*(hr|hour|hours)/i);
};


var Hours = function Hours(hours){
  var processed = {};

  Object.keys(hours || {}).forEach(function(day) {
    var dayNum = days[day.toUpperCase()];
    processed[dayNum] = this.parseDay(hours[day]);
  }.bind(this));

  this.hours = processed;
};

Hours.fromData = function(data) {
  var hours = new Hours();
  hours.hours = data || {};
  return hours;
};

Hours.prototype.addDay = function(day, str) {
  var dayNum = days[day.toUpperCase()];
  this.hours[dayNum] = this.parseDay(str);
};

Hours.prototype.parseDay = function(str) {
  var intervals, interval, result = [], times = [];
  intervals = str.split(',');

  for(var idx = 0; idx < intervals.length; idx++) {
    if ( is24HourString(intervals[idx].replace(/ /g,'')) ) {
      result.push([0,2359]);
    } else {
      // remove all whitespaces
      interval = intervals[idx].replace(/ /g,'');
      interval = interval.split(/\s?-\s?/);

      if(!interval[1]) { fail(str); }

      times = [ timeStringToOffset(interval[0]),
                timeStringToOffset(interval[1]) ];

      if(times[0] >= 2400 || times[1] >= 2400) { fail(str); }

      if(times[0] === times[1] && times[0] !== 0) { fail(str); }

      if(times[0] >= times[1] && times[1] !== 0) { fail(str); }

      if(times[0] >= 0 && times[1] === 0) { fail(str); }

      result.push(times);
    }
  }

  return result;
};

/*
  mergeIntervals - take a set of open intervals and union them

  1. Flatten [[S1, E1], [S2, E2], [S3, E3]] onto a timeline.

    S1, E1, etc are all HHMM sortable integers; 1700 for 5PM.
    S1--S2--E1--E2--S3--E3

  2. Walk the timeline, opening/closing intervals at the shallowest level of nesting

    S1 - depth 0 -> 1, open interval
    S2 - depth 1 -> 2
    E1 - depth 2 -> 1
    E2 - depth 1 -> 0, close interval
    S3 - depth 0 -> 1, open interval
    E3 - depth 1 -> 0, close interval

  return merged intervals: [[S1, E2], [S3, E3]]
*/
function mergeIntervals(intervals) {
  var stack = [],
      mergedIntervals = [];

  buildTimeline(intervals).forEach(function(boundary) {
    if ( boundary.side === 'start' ) {
      stack.push(boundary);
    } else {
      if ( stack.length === 1 ) {
        mergedIntervals.push([stack.pop().time, boundary.time]);
      } else {
        stack.pop();
      }
    }
  });

  return mergedIntervals;
}

function buildTimeline(intervals) {
  var labeledBoundaries, boundaries, timeline;

  // convert intervals to labeled start/end boundary objects
  labeledBoundaries = intervals.map(function(interval) {
    return [
      { side: 'start', time: parseInt(interval[0], 10) },
      { side: 'end',   time: parseInt(interval[1], 10) }
    ];
  });

  // flatten interval boundaries to get a sortable list
  boundaries = _.flatten(labeledBoundaries);

  // sort boundaries by timestamp, generating timeline
  timeline = boundaries.sort(function(a, b) {
    return a.time - b.time;
  });

  return timeline;
}

Hours.DAY_NAMES = [
  {short: "Sun", long: "Sunday"},
  {short: "Mon", long: "Monday"},
  {short: "Tue", long: "Tuesday"},
  {short: "Wed", long: "Wednesday"},
  {short: "Thu", long: "Thursday"},
  {short: "Fri", long: "Friday"},
  {short: "Sat", long: "Saturday"}
];

Hours.SHORT_DAY_NAMES = _.map(Hours.DAY_NAMES, function(day) { return day.short; });
Hours.LONG_DAY_NAMES = _.map(Hours.DAY_NAMES, function(day) { return day.long; });

Hours.merge = function() {
  var data = {};
  Array.prototype.slice.call(arguments).forEach(function(item) {
    Object.keys(item.hours || {}).forEach(function(day) {
      data[day] = (data[day] || []).concat(item.hours[day] || []);
    });
  });

  return Hours.fromData(data).merge();
};

Hours.prototype.merge = function() {
  var data = {};
  Object.keys(this.hours).forEach(function(day) {
    data[day] = mergeIntervals(this.hours[day]);
  }, this);

  return Hours.fromData(data);
};

function humanizeInterval(intervals) {
  if ( intervals.length === 2 &&
        intervals[0] === 0 &&
        intervals[1] === 2359 ) {
    return "24 Hours";
  }

  return intervals.map(function(time) {
    //1200 -> 12:00PM
    //1230 -> 12:30PM
    //0 -> 12:00AM
    //1400 -> 2:00PM

    var pm, hour, min;

    hour = Math.floor(time / 100);
    min = time % 100;

    if(hour < 10) {
      hour = "0" + hour;
    }

    if(min < 10) {
      min = "0" + min;
    }

    return [hour, ":", min].join("");

  }).join(" - ");
}

Hours.prototype.humanize = function(options) {
  var hours = this.hours,
      dayNames;

  options = options || {};
  dayNames = options.shortDayNames ? Hours.SHORT_DAY_NAMES : Hours.LONG_DAY_NAMES;

  return dayNames.map(function(dayName, index) {
    var intervals = hours[index];

    return {
      day: dayName,
      hours: intervals ? intervals.map(humanizeInterval).join(', ') : null
    };
  });
};

Hours.prototype.within = function(time) {
  var intervals, instant, parts, day;

  if(_.isDate(time)) {
    intervals = this.hours[time.getDay()];
    instant   = timeToOffset(time);
  } else {
    parts     = time.split(","),

    day       = days[parts[0].toUpperCase()],
    intervals = this.hours[day],
    instant   = timeStringToOffset(parts[1]);
  }

  return !!_(intervals).find(function(interval) {
    return (interval[0] <= instant) &&
           (interval[1] >= instant);
  });
};

Hours.prototype.serialize = function () {
  if ( !this.isEmpty() ) {
    return this.hours;
  } else {
    return null;
  }
};

Hours.prototype.isEmpty = function () {
  var count = 0;
  for(var k in this.hours) {
    if(!this.hours.hasOwnProperty(k)) { continue; }
    count++;
  }

  return (count === 0);
};

Hours.prototype.humanizeCondensed = function (options) {

  var merged = this.merge(),
      obj = merged.hours,
      dayNames;

  options = options || {};
  dayNames = options.shortDayNames ? Hours.SHORT_DAY_NAMES : Hours.LONG_DAY_NAMES;

  var condensed = Object.keys(obj).reduce(function(acc, i){
    if(!acc.length) {
      acc.push({days: [parseInt(i, 10)], intervals: obj[i]});
    } else {
      var last = acc[acc.length - 1];

      if(_.isEqual(last.intervals, obj[i])) {
        last.days.push(parseInt(i, 10));
      } else {
        acc.push({days: [parseInt(i, 10)], intervals: obj[i]});
      }
    }
    return acc;
  }, []);

  return condensed.map(function(run) {
    if(run.days.length === 1) {
      return {
        day: dayNames[run.days[0]],
        hours: _(run.intervals).map(humanizeInterval).join(", ")
      };
    } else {
      var start = Math.min.apply(Math, run.days);
      var end = Math.max.apply(Math, run.days);
      var ret = {hours: _(run.intervals).map(humanizeInterval).join(", ")};

      if ( start === 0 && end === 6 ) {
        ret.day = "Every day";
      } else {
        ret.day = [dayNames[start], dayNames[end]].join(" - ");
      }
      return ret;
    }
  });
};

module.exports = Hours;
