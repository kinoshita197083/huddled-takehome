import type { PageServerLoad } from "./$types";

const eventTypeWeights = {
  play_track: 1,
  like_track: 2,
  add_track_to_playlist: 2,
  share_track: 3,
};

const convertToLocalTime = (utcTimestamp: number, timezone: string): number => {
  // Create Date objects for UTC timestamp
  const utcDate = new Date(utcTimestamp);

  // Get hour in the specified timezone
  const localHour = utcDate.toLocaleString('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false
  });

  return parseInt(localHour, 10);
};

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  // Group by artist and each hour of the day
  // Note: timezone is in UTC
  // strftime is equivalent to SELECT DATE_FORMAT('2024-11-30', '%Y-%m-%d') in mySQL
  const query = `
  WITH hourly_events AS (
    SELECT 
      artist_id,
      datetime(created_at/1000, 'unixepoch') AS created_at,
      strftime('%H', datetime(created_at/1000, 'unixepoch')) AS hour_of_day,
      u.timezone AS timezone,
      COUNT(DISTINCT ue.user_id) AS number_of_users,
      COUNT(CASE WHEN event_type = 'play_track' THEN 1 END) AS play_track_count,
      COUNT(CASE WHEN event_type = 'share_track' THEN 1 END) AS share_track_count,
      COUNT(CASE WHEN event_type = 'add_track_to_playlist' THEN 1 END) AS add_track_to_playlist_count,
      COUNT(CASE WHEN event_type = 'like_track' THEN 1 END) AS like_track_count
    FROM user_events ue
    JOIN users u ON ue.user_id = u.id
    WHERE event_type IN ('play_track', 'share_track', 'add_track_to_playlist', 'like_track')
    GROUP BY 
      artist_id,
      hour_of_day
  )
  SELECT 
    he.*,
    a.name AS artist_name,
    (
      he.play_track_count * ${eventTypeWeights.play_track} +
      he.share_track_count * ${eventTypeWeights.share_track} +
      he.add_track_to_playlist_count * ${eventTypeWeights.add_track_to_playlist} +
      he.like_track_count * ${eventTypeWeights.like_track}
    ) AS engagement_score
  FROM hourly_events he
  JOIN artists a ON he.artist_id = a.id
  ORDER BY 
    engagement_score DESC,
    hour_of_day;
  `;

  const data = await db.prepare(query).all();

  console.log("Task 2 data", { data });

  return {
    data,
  };
};
