import { component$ } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { LuBarChart2, LuFlag, LuUsers, LuMessageSquare, LuBriefcase, LuAlertTriangle } from "@qwikest/icons/lucide";
import { capitalizeFirst } from '~/utils/capitalizeFirst';
import { Image } from "@unpic/qwik";
import { _ } from "compiled-i18n";

import { useGetRegion, useGetRegionalDebates, useGetRegionalPolls, useGetRegionalProjects, useGetRegionalIssues } from "~/shared/regional/loaders";

import type { Debate } from "~/types/debate";
import type { Issue } from "~/types/issue";
import type { Poll } from "~/types/poll";
import type { Project } from "~/types/project";

export default component$(() => {
    const location = useLocation();
    const nationName = location.params.nation;
    const regionName = location.params.region;
    
    const region = useGetRegion();
    const polls = useGetRegionalPolls();
    const debates = useGetRegionalDebates();
    const projects = useGetRegionalProjects();
    const issues = useGetRegionalIssues();

    const pollsCount = polls.value.total || 0;
    const debatesCount = debates.value.total || 0;
    const projectsCount = projects.value.total || 0;
    const issuesCount = issues.value.total || 0;

    return (
        <div class="flex flex-col h-[calc(100vh-4rem)] overflow-auto p-4 bg-gray-50 dark:bg-gray-800">
            {/* Header Section */}
            <div class="mb-6">
                <div class="flex items-center gap-3 mb-2">
                    <LuFlag class="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                        {region.value.name || capitalizeFirst(regionName)} ({capitalizeFirst(nationName)})
                    </h1>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    {_`Welcome to the regional community where citizens collaborate on local matters.`}
                </p>
            </div>

            {/* Main Content */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Region Information */}
                <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <LuFlag class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {_`Region Information`}
                    </h2>
                    
                    <div class="flex flex-col sm:flex-row gap-6">
                        {region.value.emblem_svg && (
                            <div class="flex justify-center">
                                <Image 
                                    src={region.value.emblem_svg} 
                                    alt={`Emblem of ${region.value.name || capitalizeFirst(regionName)}`} 
                                    class="h-32 w-auto max-w-[150px] object-contain"
                                />
                            </div>
                        )}
                        
                        <div class="flex-1 space-y-3">
                            {region.value.population && (
                                <div class="flex items-start gap-3">
                                    <LuUsers class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                                    <div class="dark:text-gray-300">
                                        <span class="font-medium">{_`Population`}:</span> {region.value.population.toLocaleString()}
                                    </div>
                                </div>
                            )}

                            {region.value.area && (
                                <div class="flex items-start gap-3">
                                    <LuFlag class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                                    <div class="dark:text-gray-300">
                                        <span class="font-medium">{_`Area`}:</span> {region.value.area.toLocaleString()} km²
                                    </div>
                                </div>
                            )}

                            {region.value.capital && (
                                <div class="flex items-start gap-3">
                                    <LuUsers class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                                    <div class="dark:text-gray-300">
                                        <span class="font-medium">{_`Capital`}:</span> {region.value.capital}
                                    </div>
                                </div>
                            )}

                            {region.value.governor && (
                                <div class="flex items-start gap-3">
                                    <LuUsers class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                                    <div class="dark:text-gray-300">
                                        <span class="font-medium">{_`Governor`}:</span> {region.value.governor}
                                    </div>
                                </div>
                            )}

                            {region.value.founding_year && (
                                <div class="flex items-start gap-3">
                                    <LuFlag class="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                                    <div class="dark:text-gray-300">
                                        <span class="font-medium">{_`Founded`}:</span> {region.value.founding_year}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div class="flex gap-3 mt-4">
                        {region.value.website && (
                            <a
                                href={region.value.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded flex items-center gap-1"
                            >
                                <span>{_`Official Website`}</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Platform Statistics */}
                <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <LuBarChart2 class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {_`Platform Statistics`}
                    </h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{pollsCount}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-300">{_`Polls`}</div>
                        </div>
                        <div class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                            <div class="text-3xl font-bold text-green-600 dark:text-green-400">{debatesCount}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-300">{_`Debates`}</div>
                        </div>
                        <div class="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
                            <div class="text-3xl font-bold text-amber-600 dark:text-amber-400">{issuesCount}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-300">{_`Issues`}</div>
                        </div>
                        <div class="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{projectsCount}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-300">{_`Projects`}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Topics and Active Projects */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow col-span-1 lg:col-span-2">
                    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <LuMessageSquare class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {_`Featured Topics in ${region.value.name || capitalizeFirst(regionName)}`}
                    </h2>
                    <div class="space-y-4">
                        {Array.isArray(debates.value) && debates.value.slice(0, 3).map((debate: Debate, index: number) => (
                            <div key={debate.id || index} class="border-b border-gray-200 dark:border-gray-700 pb-3">
                                <h3 class="font-medium text-gray-900 dark:text-white">{debate.title}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-300">
                                    {debate.description.substring(0, 100)}...
                                </p>
                                <div class="flex gap-2 mt-2">
                                    <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                        {debate.views_count || 0} {_`views`}
                                    </span>
                                    <span class="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                        {debate.comments_count || 0} {_`comments`}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {(!Array.isArray(debates.value) || debates.value.length === 0) && (
                            <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                                {_`There are no featured debates yet. Be the first to create one!`}
                            </div>
                        )}
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <LuBriefcase class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {_`Active Projects`}
                    </h2>
                    <div class="space-y-4">
                        {projects.value.items.slice(0, 3).map((project: Project, index: number) => (
                            <div key={project.id || index} class="border-b border-gray-200 dark:border-gray-700 pb-3">
                                <h3 class="font-medium text-gray-900 dark:text-white">{project.title}</h3>
                                <div class="flex justify-between text-sm mt-1 text-gray-700 dark:text-gray-300">
                                    <span>{_`Progress`}:</span>
                                    <span>{project.progress || 0}%</span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                    <div class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={`width: ${project.progress || 0}%`}></div>
                                </div>
                                <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">{project.participants_count || 0} {_`participants`}</div>
                            </div>
                        ))}

                        {(projects.value.items.length === 0) && (
                            <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                                {_`There are no active projects yet. Start the first one!`}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reported Issues and Active Polls */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <LuAlertTriangle class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {_`Reported Issues`}
                    </h2>
                    <div class="space-y-3">
                        {issues.value.items.slice(0, 5).map((issue: Issue, index: number) => (
                            <div key={issue.id || index} class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                                <div>
                                    <h3 class="font-medium text-gray-900 dark:text-white">{issue.title}</h3>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">{issue.location || _`No specific location`}</p>
                                </div>
                                <span class={`text-xs px-2 py-1 rounded ${issue.status === 'OPEN' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' :
                                    issue.status === 'IN_PROGRESS' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' :
                                        'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                    }`}>
                                    {issue.status === 'OPEN' ? _`Open` :
                                        issue.status === 'IN_PROGRESS' ? _`In Progress` :
                                            _`Resolved`}
                                </span>
                            </div>
                        ))}

                        {(issues.value.items.length === 0) && (
                            <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                                {_`There are no reported issues yet.`}
                            </div>
                        )}
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <LuBarChart2 class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {_`Active Polls`}
                    </h2>
                    <div class="space-y-3">
                        {polls.value.items.slice(0, 5).map((poll: Poll, index: number) => (
                            <div key={poll.id || index} class="border-b border-gray-200 dark:border-gray-700 pb-2">
                                <h3 class="font-medium text-gray-900 dark:text-white">{poll.title}</h3>
                                <div class="flex justify-between items-center mt-1">
                                    <span class="text-xs text-gray-600 dark:text-gray-400">
                                        {poll.votes_count || 0} {_`votes`}
                                    </span>
                                    {poll.ends_at && (
                                        <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                            {_`Ends: `}{new Date(poll.ends_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(polls.value.items.length === 0) && (
                            <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                                {_`There are no active polls currently.`}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export const head: DocumentHead = ({ params }) => {
    const regionName = capitalizeFirst(params.region || "");
    const nationName = capitalizeFirst(params.nation || "");
    return {
        title: _`${regionName}, ${nationName} - Community`,
        meta: [
            {
                name: "description",
                content: _`Local participation platform for the ${regionName} community in ${nationName}`,
            },
        ],
    };
};
