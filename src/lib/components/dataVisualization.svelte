<script lang="ts">
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";

    type AggregatedArtistData = {
        artist_name: string;
        created_at: string;
        engagement_score: number;
        hour_of_day: string;
        timezone: string;
    };

    type HourlyData = {
        [date: string]: number[];
    };

    type ArtistAccumulator = {
        [artist: string]: {
            hourlyData: HourlyData;
            total: number;
        };
    };

    let { aggregatedData }: { aggregatedData: AggregatedArtistData[] } =
        $props();
    let canvas: HTMLCanvasElement;
    let chart: Chart | null = null;
    let selectedArtist = $state();
    let selectedDate = $state(new Date().toISOString().split("T")[0]);
    let availableDates: string[] = $state([]);

    // Process data to get top artists and their data
    const processData = () => {
        const artistData = aggregatedData.reduce<ArtistAccumulator>(
            (acc, entry: AggregatedArtistData) => {
                const date = new Date(entry.created_at)
                    .toISOString()
                    .split("T")[0];
                const hour = parseInt(entry.hour_of_day);

                if (!acc[entry.artist_name]) {
                    acc[entry.artist_name] = {
                        hourlyData: {},
                        total: 0,
                    };
                }

                if (!acc[entry.artist_name].hourlyData[date]) {
                    acc[entry.artist_name].hourlyData[date] = Array(24).fill(0);
                }

                acc[entry.artist_name].hourlyData[date][hour] +=
                    entry.engagement_score;
                acc[entry.artist_name].total += entry.engagement_score;

                return acc;
            },
            {},
        );

        // Get top 10 artists
        const topArtists = Object.entries(artistData)
            .map(([name, data]) => ({
                name,
                total: data.total,
                hourlyData: data.hourlyData,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Get unique dates across all artists
        availableDates = [
            ...new Set(
                topArtists.flatMap((artist) => Object.keys(artist.hourlyData)),
            ),
        ].sort();

        // Initialize selectedDate if not set
        if (!selectedDate || !availableDates.includes(selectedDate)) {
            selectedDate = availableDates[availableDates.length - 1];
        }

        return topArtists;
    };

    const artists = processData();
    const currentArtist = $derived(selectedArtist || artists[0].name);

    // Initialize selectedArtist if not set
    $effect(() => {
        if (!selectedArtist) {
            selectedArtist = artists[0].name;
        }
    });

    const updateChart = () => {
        if (!canvas || !currentArtist) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (chart) {
            chart.destroy();
        }

        const artistData = artists.find((a) => a.name === currentArtist);
        if (!artistData) return;

        const hourlyData =
            artistData.hourlyData[selectedDate] || Array(24).fill(0);
        const hours = Array.from(
            { length: 24 },
            (_, i) => i.toString().padStart(2, "0") + ":00",
        );

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: hours,
                datasets: [
                    {
                        label: "Hourly Engagement",
                        data: hourlyData,
                        backgroundColor: "rgba(54, 162, 235, 0.8)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750,
                    easing: "easeInOutQuart",
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${currentArtist}'s Hourly Engagement - ${new Date(
                            selectedDate,
                        ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}`,
                        color: "#e2e8f0",
                        font: {
                            size: 16,
                            weight: "bold",
                        },
                    },
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        titleColor: "#e2e8f0",
                        bodyColor: "#e2e8f0",
                        borderColor: "#475569",
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) =>
                                `Engagement Score: ${Math.floor(context.parsed.y)}`,
                        },
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Hour of Day",
                            color: "#e2e8f0",
                        },
                        ticks: {
                            color: "#e2e8f0",
                        },
                        grid: {
                            color: "#334155",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Hourly Engagement Score",
                            color: "#e2e8f0",
                        },
                        ticks: {
                            color: "#e2e8f0",
                            stepSize: 1,
                            callback: (value) => Math.floor(+value),
                        },
                        grid: {
                            color: "#334155",
                        },
                    },
                },
            },
        });
    };

    // Watch for changes in both currentArtist and selectedDate
    $effect(() => {
        if (currentArtist && selectedDate) {
            updateChart();
        }
    });

    onMount(() => {
        updateChart();
    });
</script>

<div class="w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col min-h-full">
    <!-- Date Selector -->
    <div class="mb-6 flex justify-end items-center space-x-2">
        <label for="dateSelect" class="text-slate-300 text-sm font-medium">
            Select Date:
        </label>
        <div class="relative">
            <select
                id="dateSelect"
                bind:value={selectedDate}
                class="appearance-none bg-slate-700 text-slate-200 pl-4 pr-10 py-2 rounded-lg
                       border border-slate-600
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                       shadow-sm
                       text-sm font-medium
                       cursor-pointer"
            >
                {#each availableDates as date}
                    <option value={date}>
                        {new Date(date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </option>
                {/each}
            </select>
            <div
                class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
            >
                <svg
                    class="h-5 w-5 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                    />
                </svg>
            </div>
        </div>
    </div>

    <!-- Artist Tabs -->
    <div class="mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
        <div
            class="flex space-x-1 min-w-max p-1 bg-slate-800 rounded-lg scroll-snap-type-x"
        >
            {#each artists as artist}
                <button
                    class="scroll-snap-align-start px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all duration-200 text-xs md:text-sm font-medium
                        {currentArtist === artist.name
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}"
                    onclick={() => (selectedArtist = artist.name)}
                >
                    {artist.name}
                    <span
                        class="ml-1 md:ml-2 px-1.5 py-0.5 text-xs rounded-full bg-opacity-20
                        {currentArtist === artist.name
                            ? 'bg-white text-white'
                            : 'bg-slate-600 text-slate-400'}"
                    >
                        {artist.total}
                    </span>
                </button>
            {/each}
        </div>
    </div>

    <!-- Chart Container with flex-grow to take available space -->
    <div
        class="flex-grow bg-slate-800 rounded-lg shadow-xl p-4 md:p-6 min-h-[350px] md:min-h-[450px]"
    >
        <canvas bind:this={canvas}></canvas>
    </div>

    <!-- Legend with responsive padding and text size -->
    <div
        class="mt-4 md:mt-6 text-xs md:text-sm text-slate-400 text-center px-2"
    >
        <p class="mb-1">
            Engagement scores are calculated based on weighted interactions:
        </p>
        <p class="flex flex-wrap justify-center gap-2 md:gap-4">
            <span>Play Track (×1)</span>
            <span>•</span>
            <span>Like Track (×2)</span>
            <span>•</span>
            <span>Add to Playlist (×2)</span>
            <span>•</span>
            <span>Share Track (×3)</span>
        </p>
    </div>
</div>

<style>
    /* Hide scrollbar while maintaining functionality */
    .scrollbar-hide {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }
    .scrollbar-hide::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }

    /* Add scroll snap */
    .scroll-snap-type-x {
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
    }

    .scroll-snap-align-start {
        scroll-snap-align: start;
    }

    /* Custom select styles */
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    /* For Firefox */
    select:-moz-focusring {
        color: transparent;
        text-shadow: 0 0 0 #e2e8f0;
    }

    /* Remove default focus outline for Firefox */
    select::-moz-focus-inner {
        border: 0;
    }

    /* For IE/Edge */
    select::-ms-expand {
        display: none;
    }
</style>
