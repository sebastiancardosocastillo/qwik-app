import { $, component$, useSignal, useComputed$ } from "@builder.io/qwik";
import { type DocumentHead, useNavigate, useLocation } from "@builder.io/qwik-city";
import { _ } from "compiled-i18n";
import Modal from "~/components/Modal";
import FormDebate from "~/components/forms/FormDebate";
import DebateList from "~/components/list/DebateList";
import { CommunityType } from "~/constants/communityType";
import SocialLoginButtons from "~/components/SocialLoginButtons";
import { useSession } from "~/routes/plugin@auth";
import { capitalizeFirst } from "~/utils/capitalizeFirst";

import { useGetTags, useGetUser } from "~/shared/loaders";
import { useGetSubregions } from "~/shared/regional/loaders";
import { useGetSubregion, useGetSubregionalDebates } from "~/shared/subregional/loaders";

export { useFormDebateLoader } from "~/shared/forms/loaders";
export { useFormDebateAction } from "~/shared/forms/actions";
export { useDeleteDebate } from "~/shared/actions";

export default component$(() => {
    const session = useSession();
    const user = useGetUser();
    const showModalDebate = useSignal(false);
    const location = useLocation();
    const nationName = location.params.nation;
    const regionName = location.params.region;
    const subregionName = location.params.subregion;
    
    // This request fetches the other subregions of the region
    const subregions = useGetSubregions();

    const subregion = useGetSubregion();
    const tags = useGetTags();
    const debates = useGetSubregionalDebates();
    const currentPage = useSignal(1);
    const nav = useNavigate();

    // @ts-ignore
    const currentUsername = useComputed$(() => user.value.username || "");
    const isAuthenticated = useComputed$(() => !!session.value);

    const subregionDisplayName = capitalizeFirst(subregionName.replace(/-/g, ' '));

    const onSubmitCompleted = $(() => {
        showModalDebate.value = false;
    });

    const onCreateDebate = $(() => {
        showModalDebate.value = true;
    });

    const onShowLoginModal = $(() => {
        showModalDebate.value = true;
    });

    return (
        <div class="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            <div class="flex flex-col min-h-0">
                <div class="h-full overflow-y-auto">
                    {session.value
                        ? <Modal
                            title={_`Create debate for ${subregionDisplayName}`}
                            show={showModalDebate}
                        >
                            <FormDebate
                                onSubmitCompleted={onSubmitCompleted}
                                defaultScope={CommunityType.SUBREGIONAL}
                                defaultSubregionId={subregion.value.id}
                                subregions={Array.isArray(subregions.value) ? subregions.value : []}
                                tags={tags.value}
                            />
                        </Modal>
                        : <Modal
                            title={_`Sign in to create a debate`}
                            show={showModalDebate}
                        >
                            <SocialLoginButtons />
                        </Modal>
                    }
                    <DebateList
                        communityName={subregionDisplayName}
                        currentUsername={currentUsername.value}
                        debates={{
                            items: debates.value.items,
                            total: debates.value.total,
                            page: debates.value.page,
                            size: debates.value.size,
                            pages: debates.value.pages
                        }}
                        isAuthenticated={isAuthenticated.value}
                        onCreateDebate={onCreateDebate}
                        onPageChange$={async (page: number) => {
                            currentPage.value = page;
                            await nav(`/${nationName}/${regionName}/${subregionName}/debates?page=${page}`);
                        }}
                        onShowLoginModal$={onShowLoginModal}
                    />
                </div>
            </div>
        </div>
    );
});

export const head: DocumentHead = ({ params }) => {
    const subregionName = capitalizeFirst(params.subregion.replace(/-/g, ' '));
    return {
        title: `${subregionName} - Debates`,
        meta: [
            {
                name: "description",
                content: `Community debates of ${subregionName}`,
            },
        ],
    };
}; 