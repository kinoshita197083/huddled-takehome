<script lang="ts">
    import DataVisualization from "$lib/components/dataVisualization.svelte";
    import type { PageData } from "./$types";
    let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col min-h-full bg-slate-950">
    <DataVisualization aggregatedData={data.data} />
</div>
