import { $, component$, useSignal, useComputed$ } from "@builder.io/qwik";
import { type DocumentHead, useNavigate } from "@builder.io/qwik-city";
import { _ } from "compiled-i18n";
import Modal from "~/components/Modal";
import FormPoll from "~/components/forms/FormPoll";
import PollList from "~/components/list/PollList";
import { CommunityType } from "~/constants/communityType";
import SocialLoginButtons from "~/components/SocialLoginButtons";
import { useSession } from "~/routes/plugin@auth";

import { useGetUser } from "~/shared/loaders";
import { useGetInternationalPolls } from "~/shared/international/loaders";

export { useFormPollLoader } from "~/shared/forms/loaders";
export { useFormPollAction } from "~/shared/forms/actions";
export { useVotePoll, useReactPoll, useDeletePoll } from "~/shared/actions";

export default component$(() => {
    const session = useSession();
    const user = useGetUser();
    const showModalPoll = useSignal(false);
    const polls = useGetInternationalPolls();
    const currentPage = useSignal(1);
    const nav = useNavigate();

    const isAuthenticated = useComputed$(() => !!session.value);

    const currentUsername = useComputed$(() => user.value.username || "");

    const onSubmitCompleted = $(() => {
        showModalPoll.value = false;
    });

    const onCreatePoll = $(() => {
        showModalPoll.value = true;
    });

    const onShowLoginModal = $(() => {
        showModalPoll.value = true;
    });

    return (
        <div class="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            <div class="flex flex-col min-h-0">
                <div class="h-full overflow-y-auto">
                    {session.value
                        ? <Modal
                            title={_`Crear encuesta`}
                            show={showModalPoll}
                        >
                            <FormPoll
                                onSubmitCompleted={onSubmitCompleted}
                                defaultScope={CommunityType.INTERNATIONAL}
                            />
                        </Modal>
                        : <Modal
                            title={_`Sign in to create a poll`}
                            show={showModalPoll}
                        >
                            <div class="p-4 text-center">
                                <p class="mb-6 text-gray-600 dark:text-gray-300">
                                    {_`You need to sign in to create polls and participate in the community.`}
                                </p>
                                <SocialLoginButtons />
                            </div>
                        </Modal>
                    }
                    <PollList
                        communityName={_`The International community`}
                        currentUsername={currentUsername.value}
                        isAuthenticated={isAuthenticated.value}
                        onCreatePoll={onCreatePoll}
                        onPageChange$={async (page: number) => {
                            currentPage.value = page;
                            await nav(`/international/polls?page=${page}`);
                        }}
                        onShowLoginModal$={onShowLoginModal}
                        polls={{
                            items: polls.value.items,
                            total: polls.value.total || 0,
                            page: polls.value.page || 1,
                            size: polls.value.size || 10,
                            pages: polls.value.pages || 1
                        }}
                    />
                </div>
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Encuestas Internacionales",
    meta: [
        {
            name: "description",
            content: "Encuestas de la comunidad internacional en Geounity",
        },
    ],
}; 