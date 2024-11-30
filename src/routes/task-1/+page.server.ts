import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const db = locals.db;

  // convert total_visit_duration to seconds
  // count the records based on user_id instead of session_id, for unique visitors
  const query = `
SELECT 
    a.id AS artist_id, 
    a.name AS artist_name, 
    SUM(v.end_time - v.start_time) AS total_visit_duration,
    COUNT(DISTINCT s.user_id) AS unique_visitor_count
FROM 
    artists a
JOIN 
    visits v ON a.id = v.artist_id
JOIN 
    sessions s ON v.session_id = s.id
GROUP BY 
    a.id
ORDER BY 
    total_visit_duration DESC
`;

  const data = await db.prepare(query).all();

  // Debug log
  // console.log('Sorted data:', data.map(d => ({
  //   artist_name: d.artist_name,
  //   duration: d.total_visit_duration,
  //   formatted: formatDuration(d.total_visit_duration)
  // })));

  return {
    data,
  };
};

// Helper function for debug logging
function formatDuration(ms: number): string {
  return new Date(ms).toISOString().substr(11, 8);
}
