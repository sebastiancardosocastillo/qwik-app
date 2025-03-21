import { component$, $, useStore, useComputed$, useSignal, type QRL } from "@builder.io/qwik"
import { Link } from "@builder.io/qwik-city"
import {
    LuArrowBigUp,
    LuArrowBigDown,
    LuMessageSquare,
    LuTimer,
    LuLink,
    LuUser2,
    LuTrash2,
    LuFlag,
    LuTag,
    LuCheck,
    LuX,
} from "@qwikest/icons/lucide"
import { timeAgo } from "~/utils/dateUtils"
import { dataArray } from "~/data/countries"
import { Avatar } from "~/components/ui"
import FormReport from "~/components/forms/FormReport";
import Modal from "~/components/Modal";
import ConfirmationModal from "~/components/ConfirmationModal"
import { _ } from "compiled-i18n"
import { useVotePoll, useReactPoll, useDeletePoll } from "~/shared/actions"
interface PollCardProps {
    id: number
    title: string
    slug: string
    description: string
    options: { text: string; votes: number; id: number; voted: boolean }[]
    status: string
    type: string
    scope: string
    isAnonymous: boolean
    endsAt?: string | null
    createdAt: string
    creatorUsername: string
    creatorAvatar: string
    commentsCount: number
    likesCount: number
    dislikesCount: number
    countries?: string[]
    userVotedOptions?: number[]
    userReaction?: "LIKE" | "DISLIKE" | null
    isAuthenticated?: boolean
    currentUsername?: string
    onShowLoginModal$: QRL<() => void>
    tags?: string[]
}

export default component$<PollCardProps>(
    ({
        id,
        title,
        slug,
        description,
        options,
        type,
        isAnonymous,
        endsAt,
        createdAt,
        creatorUsername,
        creatorAvatar,
        commentsCount,
        likesCount: initialLikesCount,
        dislikesCount: initialDislikesCount,
        countries = [],
        userVotedOptions = [],
        userReaction: initialUserReaction = null,
        isAuthenticated = true,
        currentUsername = "",
        onShowLoginModal$,
        tags = [],
    }) => {
        const actionVote = useVotePoll()
        const actionReact = useReactPoll()
        const deletePoll = useDeletePoll()
        // Internal state for votes and reactions
        const pollState = useStore({
            options,
            userVotedOptions: userVotedOptions,
        })

        const reactionState = useStore({
            userReaction: initialUserReaction,
            likesCount: initialLikesCount,
            dislikesCount: initialDislikesCount,
        })

        const showReportModal = useSignal(false)
        const showConfirmDeleteModal = useSignal(false)
        const totalVotes = useComputed$(() => pollState.options.reduce((sum, option) => sum + option.votes, 0))

        const isClosed = useComputed$(() => (endsAt && new Date(endsAt) < new Date()) || false)

        const handleVote = $(async (optionId: number) => {
            if (!isAuthenticated) {
                onShowLoginModal$();
                return;
            }

            let newVotedOptions: number[] = []
            const isVoted = pollState.userVotedOptions.includes(optionId)

            // Optimistic update
            if (type === "BINARY" || type === "SINGLE_CHOICE") {
                newVotedOptions = isVoted ? [] : [optionId]

                // Update vote counters
                pollState.options = pollState.options.map((opt) => ({
                    ...opt,
                    votes:
                        opt.id === optionId
                            ? opt.votes + (isVoted ? -1 : 1)
                            : isVoted
                                ? opt.votes
                                : opt.votes - (opt.voted ? 1 : 0),
                    voted: opt.id === optionId ? !isVoted : false,
                }))
            } else if (type === "MULTIPLE_CHOICE") {
                newVotedOptions = isVoted
                    ? pollState.userVotedOptions.filter((id) => id !== optionId)
                    : [...pollState.userVotedOptions, optionId]

                // Update vote counter
                pollState.options = pollState.options.map((opt) => ({
                    ...opt,
                    votes: opt.id === optionId ? opt.votes + (isVoted ? -1 : 1) : opt.votes,
                    voted: opt.id === optionId ? !isVoted : opt.voted,
                }))
            }

            // Update voted options state
            pollState.userVotedOptions = newVotedOptions

            // API call
            const result = await actionVote.submit({
                pollId: id,
                optionIds: newVotedOptions,
            })

            // If there's an error, revert changes
            if (result.status !== 200) {
                pollState.options = options
                pollState.userVotedOptions = userVotedOptions
            }
        })

        const handleReaction = $(async (newReaction: "LIKE" | "DISLIKE") => {
            if (!isAuthenticated) {
                onShowLoginModal$();
                return;
            }

            const previousReaction = reactionState.userReaction

            // Optimistic update
            if (newReaction === previousReaction) {
                // If clicking on the same reaction, remove it
                reactionState.userReaction = null
                if (newReaction === "LIKE") {
                    reactionState.likesCount--
                } else {
                    reactionState.dislikesCount--
                }
            } else {
                // If changing reaction or adding a new one
                reactionState.userReaction = newReaction

                if (previousReaction === "LIKE") {
                    reactionState.likesCount--
                } else if (previousReaction === "DISLIKE") {
                    reactionState.dislikesCount--;
                }

                if (newReaction === "LIKE") {
                    reactionState.likesCount++;
                } else {
                    reactionState.dislikesCount++;
                }
            }

            // API call
            const result = await actionReact.submit({
                pollId: id,
                reaction: newReaction,
            })

            // If there's an error, revert changes
            if (result.status !== 200) {
                reactionState.userReaction = previousReaction
                reactionState.likesCount = initialLikesCount
                reactionState.dislikesCount = initialDislikesCount
            }
        })

        const getCountryData = (code: string) => {
            return dataArray.find((country) => country.cca2 === code)
        }

        // Add signal to control the visibility of the copied message
        const showCopiedMessage = useSignal(false);
        
        const copyPollLink = $(() => {
            try {
                const pollUrl = `${window.location.origin}/polls/${slug}`
                navigator.clipboard.writeText(pollUrl)
                // Show copied message
                showCopiedMessage.value = true;
                // Hide message after 3 seconds
                setTimeout(() => {
                    showCopiedMessage.value = false;
                }, 3000);
            } catch (error) {
                console.error("Error copying link:", error)
            }
        })

        // Replace the function getPollTypeIcon with a function that returns descriptive text
        const getPollTypeInfo = () => {
            switch (type) {
                case "BINARY":
                    return {
                        text: _`Binary Poll`,
                        description: _`Choose one option only`,
                        icon: <LuX class="w-4 h-4 mr-1" />,
                        bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
                        textColor: "text-cyan-700 dark:text-cyan-300",
                        borderColor: "border-cyan-200 dark:border-cyan-800",
                        ribbonBg: "bg-cyan-500",
                        ribbonText: "text-white"
                    }
                case "SINGLE_CHOICE":
                    return {
                        text: _`Single Choice`,
                        description: _`Choose one option only`,
                        icon: <LuCheck class="w-4 h-4 mr-1" />,
                        bgColor: "bg-purple-100 dark:bg-purple-900/30",
                        textColor: "text-purple-700 dark:text-purple-300",
                        borderColor: "border-purple-200 dark:border-purple-800",
                        ribbonBg: "bg-purple-500",
                        ribbonText: "text-white"
                    }
                case "MULTIPLE_CHOICE":
                    return {
                        text: _`Multiple Choice`,
                        description: _`Choose multiple options`,
                        icon: <span class="mr-1 font-bold">+</span>,
                        bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
                        textColor: "text-emerald-700 dark:text-emerald-300",
                        borderColor: "border-emerald-200 dark:border-emerald-800",
                        ribbonBg: "bg-emerald-500",
                        ribbonText: "text-white"
                    }
                default:
                    return {
                        text: _`Poll`,
                        description: _`Participate in this poll`,
                        icon: <LuCheck class="w-4 h-4 mr-1" />,
                        bgColor: "bg-blue-100 dark:bg-blue-900/30",
                        textColor: "text-blue-700 dark:text-blue-300",
                        borderColor: "border-blue-200 dark:border-blue-800",
                        ribbonBg: "bg-blue-500",
                        ribbonText: "text-white"
                    }
            }
        }

        // Get background color for progress bar based on type
        const getProgressBarColor = (isSelected: boolean) => {
            if (isSelected) {
                switch (type) {
                    case "BINARY":
                        return "bg-cyan-500"
                    case "SINGLE_CHOICE":
                        return "bg-purple-500"
                    case "MULTIPLE_CHOICE":
                        return "bg-emerald-500"
                    default:
                        return "bg-blue-500"
                }
            } else {
                switch (type) {
                    case "BINARY":
                        return "bg-cyan-300"
                    case "SINGLE_CHOICE":
                        return "bg-purple-300"
                    case "MULTIPLE_CHOICE":
                        return "bg-emerald-300"
                    default:
                        return "bg-blue-300"
                }
            }
        }

        const isCreator = currentUsername === creatorUsername;

        const handleDelete = $(async () => {
            await deletePoll.submit({ pollId: id });
        })

        return (
            <div class="poll-card bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                <div class="absolute -right-12 top-7 transform rotate-45 z-10">
                    <div class={`py-1 px-12 text-xs font-bold uppercase ${getPollTypeInfo().ribbonBg} ${getPollTypeInfo().ribbonText}`}>
                        {getPollTypeInfo().text}
                    </div>
                </div>
                {/* Header */}
                <div class="mb-5">
                    <div class="flex items-center flex-wrap gap-2 mb-3">
                        <h3 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{title}</h3>
                        
                        {isClosed.value && (
                            <div class="inline-flex bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase px-3 py-1 rounded-full border border-red-200 dark:border-red-700">
                                {_`Closed`}
                            </div>
                        )}
                        {isCreator && (
                            <div class="inline-flex bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600">
                                {_`Owner`}
                            </div>
                        )}
                    </div>
                    {description && (
                        <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{description}</p>
                    )}
                    
                    {/* Tags */}
                    {tags.length > 0 && (
                        <div class="flex flex-wrap gap-2 mb-3">
                            {tags.map((tag) => (
                                <span key={tag} class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                                    <LuTag class="w-3 h-3 mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {countries.length > 0 && (
                        <div class="flex items-center gap-1 mb-3 flex-wrap">
                            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">{_`Countries:`}</span>
                            <div class="flex gap-1 flex-wrap">
                                {countries.map((code) => {
                                    const country = getCountryData(code)
                                    return (
                                        country && (
                                            <span
                                                key={code}
                                                class="text-xl cursor-help hover:transform hover:scale-125 transition-transform"
                                                title={country.name}
                                            >
                                                {country.flag}
                                            </span>
                                        )
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div class="flex flex-wrap items-center justify-between text-sm">
                        <div class="flex items-center gap-2 mb-2 sm:mb-0">
                            <span class="text-gray-500 dark:text-gray-400">{_`Total votes:`}</span>
                            <span class="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-medium text-gray-700 dark:text-gray-300">
                                {totalVotes.value}
                            </span>
                        </div>
                        
                        {/* Informative badge of the poll type */}
                        <div class={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${getPollTypeInfo().bgColor} ${getPollTypeInfo().textColor} ${getPollTypeInfo().borderColor}`}>
                            {getPollTypeInfo().icon}
                            <span class="ml-1">{getPollTypeInfo().description}</span>
                        </div>
                    </div>
                </div>

                {pollState.userVotedOptions.length > 0 && (
                    <div class="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p class="text-sm text-green-700 dark:text-green-300 flex items-center">
                            <LuCheck class="text-green-500 dark:text-green-400 mr-2" />
                            {_`You voted for ${pollState.userVotedOptions.length} option${pollState.userVotedOptions.length > 1 ? 's' : ''}.`}
                            {type === "MULTIPLE_CHOICE" && _` You can select multiple options.`}
                        </p>
                    </div>
                )}

                {/* Voting options */}
                <div class="space-y-3 mb-6">
                    {pollState.options.map((option) => {
                        const isSelected = pollState.userVotedOptions.includes(option.id)
                        const percentage = totalVotes.value > 0 ? (option.votes / totalVotes.value) * 100 : 0

                        return (
                            <div
                                key={option.id}
                                class={`relative poll-option p-4 rounded-lg cursor-pointer transition-all duration-300 transform ${
                                    isSelected
                                    ? "bg-gray-50 dark:bg-gray-700/80 border-2 shadow-md scale-[1.01]"
                                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border hover:scale-[1.01] border-gray-200 dark:border-gray-700"
                                } ${isSelected ? getBorderColorClass() : ""}`}
                                onClick$={() => !isClosed.value && handleVote(option.id)}
                            >
                                {/* Indicador visual de voto */}
                                <div class={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                                    isSelected 
                                    ? getCheckboxColorClass() 
                                    : 'border-2 border-gray-300 dark:border-gray-600'
                                }`}>
                                    {isSelected && <LuCheck class="w-4 h-4 text-white" />}
                                </div>

                                <div class="flex justify-between items-center pl-8 mb-2">
                                    <div class="flex-1">
                                        <span class={`${isSelected 
                                            ? "text-lg font-bold " + getTextColorClass() 
                                            : "text-gray-700 dark:text-gray-300 font-medium"}`}>
                                            {option.text}
                                        </span>
                                        
                                        {isSelected && (
                                            <span class="inline-flex items-center ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                                                <LuCheck class="w-3 h-3 mr-1" /> {_`Your vote`}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        class={`text-sm font-medium flex items-center ${isSelected 
                                            ? "py-1 px-2 rounded-lg " + getBadgeColorClass() 
                                            : "text-gray-500 dark:text-gray-400"}`}
                                    >
                                        {option.votes} {_`votes`}
                                        <span class="ml-1 text-xs">({percentage.toFixed(1)}%)</span>
                                    </span>
                                </div>
                                
                                <div class="poll-progress h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-8">
                                    <div
                                        class={`poll-progress-bar h-full transition-all duration-500 ease-out ${getProgressBarColor(isSelected)}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer mejorado */}
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                    <div class="flex flex-wrap items-center gap-3">
                        {isAnonymous ? (
                            <div class="flex items-center">
                                <div class="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <LuUser2 class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span class="text-gray-600 dark:text-gray-400 italic ml-1">
                                    {_`Anonymous`}
                                </span>
                            </div>
                        ) : (
                            <Link class="flex items-center group" href={`/user/${creatorUsername}`}>
                                <Avatar.Root class="border-2 border-transparent group-hover:border-[#713fc2] dark:group-hover:border-[#9333EA] transition-all duration-300">
                                    <Avatar.Image
                                        src={creatorAvatar}
                                        alt={creatorUsername}
                                        class="w-7 h-7 rounded-full"
                                    />
                                </Avatar.Root>
                                <span class="group-hover:text-[#713fc2] dark:group-hover:text-[#9333EA] transition-colors ml-1">
                                    {creatorUsername}
                                </span>
                            </Link>
                        )}

                        <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/70 px-3 py-1.5 rounded-full">
                            <LuTimer class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span class="text-gray-700 dark:text-gray-300">{timeAgo(new Date(createdAt))}</span>
                        </div>

                        {endsAt && (
                            <div
                                class={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isClosed.value
                                        ? "bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700"
                                        : "bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 animate-pulse"
                                    }`}
                            >
                                <span class="text-xs uppercase font-bold text-red-600 dark:text-red-400">
                                    {isClosed.value ? _`Ended` : _`Ends`}:
                                </span>
                                <span class="font-medium text-red-700 dark:text-red-300">{new Date(endsAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    <div class="flex items-center gap-3">
                        {/* Vote buttons group */}
                        <div class="vote-buttons-container flex rounded-md overflow-hidden shadow-sm">
                            <button
                                onClick$={() => handleReaction("LIKE")}
                                class={`group btn-interaction btn-like py-2 px-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-l-md transition-colors duration-300 ${reactionState.userReaction === "LIKE"
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                                        : "bg-white dark:bg-gray-800"
                                    }`}
                                title={_`Upvote`}
                            >
                                <LuArrowBigUp
                                    class={`w-5 h-5 mr-1.5 ${reactionState.userReaction === "LIKE"
                                            ? "text-green-500"
                                            : "text-gray-500 group-hover:text-green-500"
                                        } transition-colors duration-300`}
                                />
                                <span
                                    class={`font-medium ${reactionState.userReaction === "LIKE"
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-gray-700 dark:text-gray-300 group-hover:text-green-500"
                                        } transition-colors duration-300`}
                                >
                                    {reactionState.likesCount}
                                </span>
                            </button>
                            <button
                                onClick$={() => handleReaction("DISLIKE")}
                                class={`group btn-interaction btn-dislike py-2 px-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 border-l-0 rounded-r-md transition-colors duration-300 ${reactionState.userReaction === "DISLIKE"
                                        ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                                        : "bg-white dark:bg-gray-800"
                                    }`}
                                title={_`Downvote`}
                            >
                                <LuArrowBigDown
                                    class={`w-5 h-5 mr-1.5 ${reactionState.userReaction === "DISLIKE" ? "text-red-500" : "text-gray-500 group-hover:text-red-500"
                                        } transition-colors duration-300`}
                                />
                                <span
                                    class={`font-medium ${reactionState.userReaction === "DISLIKE"
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-gray-700 dark:text-gray-300 group-hover:text-red-500"
                                        } transition-colors duration-300`}
                                >
                                    {reactionState.dislikesCount}
                                </span>
                            </button>
                        </div>

                        <Link
                            href={`/polls/${slug}`}
                            class="group btn-interaction btn-comment py-2 px-3 flex items-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm"
                            title={_`Comments`}
                        >
                            <LuMessageSquare class="w-5 h-5 mr-1.5 text-gray-500 group-hover:text-blue-500 transition-colors duration-300" />
                            <span class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors duration-300">
                                {commentsCount}
                            </span>
                        </Link>

                        <button
                            onClick$={copyPollLink}
                            class="group relative btn-interaction btn-share p-2 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm"
                            title={_`Copy link`}
                        >
                            {showCopiedMessage.value && (
                                <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap animate-fadeIn">
                                    {_`Link copied!`}
                                    <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black bg-opacity-80 rotate-45"></div>
                                </div>
                            )}
                            <LuLink class="w-5 h-5 text-gray-500 group-hover:text-purple-500 transition-colors duration-300" />
                        </button>

                        {isAuthenticated && isCreator && (
                            <button
                                onClick$={() => showConfirmDeleteModal.value = true}
                                class="group btn-interaction btn-delete p-2 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md border border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm"
                                title={_`Delete poll`}
                            >
                                <LuTrash2 class="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
                            </button>
                        )}

                        {isAuthenticated && !isCreator && (
                            <button
                                onClick$={() => showReportModal.value = true}
                                class="group btn-interaction btn-report p-2 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md border border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm"
                                title={_`Report poll`}
                            >
                                <LuFlag class="w-5 h-5 text-gray-500 group-hover:text-amber-500 transition-colors duration-300" />
                            </button>
                        )}
                    </div>
                </div>
                
                <ConfirmationModal
                    title={_`Delete poll`}
                    description={_`Are you sure you want to delete this poll?`}
                    show={showConfirmDeleteModal}
                    onConfirm$={handleDelete}
                />
                <Modal
                    title={_`Report poll`}
                    show={showReportModal}
                >
                    <FormReport 
                        type="POLL" 
                        itemId={id} 
                    />
                </Modal>
            </div>
        )

        function getCheckboxColorClass() {
            switch (type) {
                case "BINARY":
                    return "bg-cyan-500 dark:bg-cyan-600"
                case "SINGLE_CHOICE":
                    return "bg-purple-500 dark:bg-purple-600"
                case "MULTIPLE_CHOICE":
                    return "bg-emerald-500 dark:bg-emerald-600"
                default:
                    return "bg-blue-500 dark:bg-blue-600"
            }
        }

        function getTextColorClass() {
            switch (type) {
                case "BINARY":
                    return "text-cyan-700 dark:text-cyan-300"
                case "SINGLE_CHOICE":
                    return "text-purple-700 dark:text-purple-300"
                case "MULTIPLE_CHOICE":
                    return "text-emerald-700 dark:text-emerald-300"
                default:
                    return "text-blue-700 dark:text-blue-300"
            }
        }

        function getBorderColorClass() {
            switch (type) {
                case "BINARY":
                    return "border-cyan-400 dark:border-cyan-600"
                case "SINGLE_CHOICE":
                    return "border-purple-400 dark:border-purple-600"
                case "MULTIPLE_CHOICE":
                    return "border-emerald-400 dark:border-emerald-600"
                default:
                    return "border-blue-400 dark:border-blue-600"
            }
        }

        function getBadgeColorClass() {
            switch (type) {
                case "BINARY":
                    return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                case "SINGLE_CHOICE":
                    return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                case "MULTIPLE_CHOICE":
                    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                default:
                    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            }
        }
    },
)
