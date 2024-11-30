<script lang="ts">
  let { artistVisits } = $props();

  function formatDuration(ms: number): string {
    // Convert to seconds first
    const seconds = Math.floor(ms / 1000);

    // Calculate each unit
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    // Build the formatted string
    const parts = [
      days > 0 && `${days}d`,
      hours > 0 && `${hours}h`,
      minutes > 0 && `${minutes}m`,
      `${remainingSeconds}s`,
    ].filter(Boolean);

    return parts.join(" ");
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl h-full">
  <div
    class="min-w-max w-full h-[calc(100vh-8rem)] overflow-x-auto relative scrollbar-pretty rounded-lg"
  >
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0"
      >
        <tr>
          <th scope="col" class="text-center px-6 py-3">Artist Id</th>
          <th scope="col" class="text-center px-6 py-3">Artist Name</th>
          <th scope="col" class="text-center px-6 py-3">Total Time Spent</th>
          <th scope="col" class="text-center px-6 py-3">Unique Visitors</th>
        </tr>
      </thead>
      <tbody>
        {#each artistVisits as { artist_id, artist_name, total_visit_duration, unique_visitor_count }}
          <tr
            class="text-center bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-500 transition-colors duration-100"
          >
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {artist_id}
            </td>
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {artist_name}
            </td>
            <td class="px-6 py-4">
              {formatDuration(total_visit_duration)}
            </td>
            <td class="px-6 py-4">
              {unique_visitor_count}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  /* Custom scrollbar styles */
  .scrollbar-pretty::-webkit-scrollbar {
    width: 10px;
  }

  .scrollbar-pretty::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  .scrollbar-pretty::-webkit-scrollbar-thumb {
    background: rgba(149, 158, 160, 0.5);
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .scrollbar-pretty::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 100, 100, 0.7);
  }
</style>
