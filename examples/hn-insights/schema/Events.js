cube(`Events`, {
  sql: `
  SELECT * FROM hn_insights.events 
  WHERE ${FILTER_PARAMS.Events.timestamp.filter(`from_iso8601_timestamp(dt || ':00:00.000')`)}
  `,

  joins: {
    AverageVelocity: {
      sql: `${Events}.rank = ${AverageVelocity}.rank AND 
      ${Events.hour} = ${AverageVelocity}.hour AND 
      ${Events.day} = ${AverageVelocity}.day`,
      relationship: `belongsTo`
    }
  },

  refreshKey: {
    sql: `select current_timestamp`
  },

  measures: {
    count: {
      type: `count`
    },

    scorePerHour: {
      sql: `${scoreChange} / ${eventTimeSpan}`,
      type: `number`
    },

    averageScoreEstimate: {
      sql: `${AverageVelocity.scorePerHour} * ${eventTimeSpanInHours}`,
      type: `sum`
    },

    eventTimeSpan: {
      sql: `date_diff('second', ${prevSnapshotTimestamp}, ${snapshotTimestamp}) / 3600.0`,
      type: `sum`
    },

    totalRank: {
      sql: `rank`,
      type: `sum`,
      filters: [{
        sql: `${page} = 'front'`
      }],
      shown: false
    },

    avgRank: {
      sql: `${totalRank} / ${count}`,
      type: `number`
    },

    scoreChange: {
      sql: `score_diff`,
      type: `sum`
    },

    karmaChange: {
      sql: `karma_diff`,
      type: `sum`
    },

    scoreChangeLastHour: {
      sql: `score_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} + interval '60' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    scoreEstimateLastHour: {
      sql: `${AverageVelocity.scorePerHour} * ${eventTimeSpanInHours}`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} + interval '60' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    scoreChangePrevHour: {
      sql: `score_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} + interval '60' minute < now()`
      }, {
        sql: `${timestamp} + interval '120' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    karmaChangeLastHour: {
      sql: `karma_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} + interval '60' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    karmaChangePrevHour: {
      sql: `karma_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} + interval '60' minute < now()`
      }, {
        sql: `${timestamp} + interval '120' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    commentsChangeLastHour: {
      sql: `comments_count_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} + interval '60' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    commentsChangePrevHour: {
      sql: `comments_count_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} + interval '60' minute < now()`
      }, {
        sql: `${timestamp} + interval '120' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    rankHourAgo: {
      sql: `rank`,
      type: `min`,
      filters: [{
        sql: `${timestamp} + interval '60' minute < now()`
      }, {
        sql: `${timestamp} + interval '65' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    currentRank: {
      sql: `rank`,
      type: `min`,
      filters: [{
        sql: `${timestamp} + interval '5' minute > now()`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    currentScore: {
      sql: `CAST(NULLIF(score, '') as integer)`,
      type: `max`
    },

    currentComments: {
      sql: `comments_count`,
      type: `max`
    },

    commentsChange: {
      sql: `comments_count_diff`,
      type: `sum`
    },

    topRank: {
      sql: `rank`,
      type: `min`,
      filters: [{
        sql: `${page} = 'front'`
      }]
    },

    addedToFrontPage: {
      sql: `${timestamp}`,
      type: `min`,
      filters: [{
        sql: `event = 'added'`
      }, {
        sql: `page = 'front'`
      }],
      shown: false
    },

    postedTime: {
      sql: `${timestamp}`,
      type: `min`,
      filters: [{
        sql: `event = 'added'`
      }, {
        sql: `page = 'newest'`
      }],
      shown: false
    },

    lastEventTime: {
      sql: `${timestamp}`,
      type: `max`,
      shown: false
    },

    commentsBeforeAddedToFrontPage: {
      sql: `comments_count_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} <= ${Stories.addedToFrontPage} or ${Stories.addedToFrontPage} is null`
      }, {
        sql: `page = 'newest'`
      }]
    },

    scoreChangeBeforeAddedToFrontPage: {
      sql: `score_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} <= ${Stories.addedToFrontPage} or ${Stories.addedToFrontPage} is null`
      }, {
        sql: `page = 'newest'`
      }]
    },

    karmaChangeBeforeAddedToFrontPage: {
      sql: `karma_diff`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} <= ${Stories.addedToFrontPage} or ${Stories.addedToFrontPage} is null`
      }, {
        sql: `page = 'newest'`
      }]
    },

    minutesOnFirstPage: {
      sql: `date_diff('second', ${prevSnapshotTimestamp}, ${snapshotTimestamp}) / 60.0`,
      type: `sum`,
      filters: [{
        sql: `${rank} < 31`
      }, {
        sql: `${page} = 'front'`
      }]
    },

    eventTimeSpanBeforeAddedToFrontPage: {
      sql: `date_diff('second', ${prevSnapshotTimestamp}, ${snapshotTimestamp}) / 60.0`,
      type: `sum`,
      filters: [{
        sql: `${timestamp} <= ${Stories.addedToFrontPage} or ${Stories.addedToFrontPage} is null`
      }, {
        sql: `page = 'newest'`
      }],
      shown: false
    },

    scorePerMinuteWhenAddedToFrontPage: {
      sql: `${scoreChangeBeforeAddedToFrontPage} / ${eventTimeSpanBeforeAddedToFrontPage}`,
      type: `number`
    },

    eventTimeSpanInHours: {
      sql: `date_diff('second', ${prevSnapshotTimestamp}, ${snapshotTimestamp}) / 3600.0`,
      type: `number`
    }
  },

  dimensions: {
    title: {
      sql: `title`,
      type: `string`
    },

    user: {
      sql: `user`,
      type: `string`
    },

    href: {
      sql: `href`,
      type: `string`
    },

    id: {
      sql: `${CUBE}.id || ${CUBE}.timestamp`,
      type: `string`,
      primaryKey: true
    },

    event: {
      sql: `event`,
      type: `string`
    },

    timestamp: {
      sql: `cast(from_iso8601_timestamp(timestamp) as timestamp)`,
      type: `time`
    },

    snapshotTimestamp: {
      sql: `cast(from_iso8601_timestamp(snapshot_timestamp) as timestamp)`,
      type: `time`
    },

    prevSnapshotTimestamp: {
      sql: `cast(from_iso8601_timestamp(prev_snapshot_timestamp) as timestamp)`,
      type: `time`
    },

    page: {
      sql: `page`,
      type: `string`
    },

    rank: {
      sql: `rank`,
      type: `number`
    },

    hour: {
      sql: `hour(${snapshotTimestamp})`,
      type: `number`
    },

    day: {
      sql: `day_of_week(${snapshotTimestamp})`,
      type: `number`
    }
  },

  preAggregations: {
    perStory: {
      type: `rollup`,
      measureReferences: [scoreChange, commentsChange, karmaChange, topRank, averageScoreEstimate, totalRank, count],
      dimensionReferences: [Stories.id, Events.page],
      timeDimensionReference: timestamp,
      granularity: `hour`,
      partitionGranularity: `day`,
      refreshKey: {
        sql: `select current_timestamp`
      },
      external: true
    },
    leaderBoard: {
      type: `rollup`,
      measureReferences: [
        scoreChangeLastHour,
        scoreChangePrevHour,
        commentsChangeLastHour,
        commentsChangePrevHour,
        karmaChangeLastHour,
        karmaChangePrevHour,
        rankHourAgo,
        currentRank,
        scoreChangeBeforeAddedToFrontPage,
        karmaChangeBeforeAddedToFrontPage,
        commentsBeforeAddedToFrontPage,
        minutesOnFirstPage,
        topRank,
        currentScore,
        currentComments,
        scoreEstimateLastHour
      ],
      dimensionReferences: [
        Stories.id,
        Stories.title,
        Stories.href,
        Stories.user,
        Stories.postedTime,
        Stories.addedToFrontPage,
        Stories.lastEventTime,
        Stories.minutesToFrontPage
      ],
      refreshKey: {
        sql: `select current_timestamp`
      },
      external: true
    }
  }
});

cube(`AverageVelocity`, {
  sql: `SELECT
    hour(from_iso8601_timestamp(snapshot_timestamp)) as hour,
    day_of_week(from_iso8601_timestamp(snapshot_timestamp)) as day,
    rank, 
    sum(score_diff) * 3600.0 / sum(date_diff('second', from_iso8601_timestamp(prev_snapshot_timestamp), from_iso8601_timestamp(snapshot_timestamp))) as avg_score_per_hour
    FROM hn_insights.events
    WHERE page = 'front' 
    GROUP BY 1, 2, 3
    `,

  measures: {
    averageScorePerHour: {
      sql: `avg_score_per_hour`,
      type: `avg`
    }
  },

  dimensions: {
    id: {
      sql: `rank || day || hour`,
      type: `number`,
      primaryKey: true,
      shown: true
    },

    rank: {
      sql: `rank`,
      type: `number`
    },

    day: {
      sql: `day`,
      type: `number`
    },

    hour: {
      sql: `hour`,
      type: `number`
    },

    scorePerHour: {
      sql: `avg_score_per_hour`,
      type: `number`
    }
  }
});
