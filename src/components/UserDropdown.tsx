import { component$, useSignal } from "@builder.io/qwik";
import { Button, Dropdown, Modal } from "flowbite-qwik";
import { LuUser, LuSettings, LuHelpCircle, LuLogOut } from "@qwikest/icons/lucide";
import { _ } from "compiled-i18n";
import { useSession, useSignOut } from "~/routes/plugin@auth";
import SocialLoginButtons from "./SocialLoginButtons";
import { Avatar } from "~/components/ui";

const LuUserIcon = component$(() => <LuUser class="h-4 w-4 text-gray-700" />)
const LuSettingsIcon = component$(() => <LuSettings class="h-4 w-4 text-gray-700" />)
const LuHelpCircleIcon = component$(() => <LuHelpCircle class="h-4 w-4 text-gray-700" />)
const LuLogOutIcon = component$(() => <LuLogOut class="h-4 w-4 text-red-600" />)

export default component$(() => {
    const session = useSession();
    const signOut = useSignOut();
    const loginModalVisible = useSignal<boolean>(false)

    return session.value
        ? (
            <Dropdown
                label=""
                class="z-50"
                as={
                    <Avatar.Root>
                        <Avatar.Image src={session.value!.user!.image || ''} alt={`@${session.value!.user!.name}`} />
                        <Avatar.Fallback>Avatar</Avatar.Fallback>
                    </Avatar.Root>
                }
            >
                <Dropdown.Item header>
                    <div class="p-2">
                        <Avatar.Root>
                            <Avatar.Image src={session.value!.user!.image || ''} alt={`@${session.value!.user!.name}`} />
                            <Avatar.Fallback>Avatar</Avatar.Fallback>
                        </Avatar.Root>
                    </div>
                </Dropdown.Item>

                <Dropdown.Item divider />

                <Dropdown.Item>
                    <div class="flex items-center space-x-2">
                        <LuUserIcon />
                        <span class="text-gray-700">{_`Profile`}</span>
                    </div>
                </Dropdown.Item>

                <Dropdown.Item>
                    <div class="flex items-center space-x-2">
                        <LuSettingsIcon />
                        <span class="text-gray-700">{_`Settings`}</span>
                    </div>
                </Dropdown.Item>

                <Dropdown.Item>
                    <div class="flex items-center space-x-2">
                        <LuHelpCircleIcon />
                        <span class="text-gray-700">{_`Help`}</span>
                    </div>
                </Dropdown.Item>

                <Dropdown.Item divider />

                <Dropdown.Item onClick$={() => signOut.submit({ redirectTo: "/" })}>
                    <div class="flex items-center space-x-2 text-red-600 hover:bg-red-50 focus:bg-red-50">
                        <LuLogOutIcon />
                        <span>{_`Log out`}</span>
                    </div>
                </Dropdown.Item>
            </Dropdown>
        )
        : (
            <>
                <Button
                    onClick$={() => loginModalVisible.value = true}
                    class="text-md font-bold text-white"
                >
                    {_`Login`}
                </Button>
                <div class="fixed inset-0 z-50">
                    <Modal
                        header={<div class="flex items-center text-lg">{_`Login`}</div>}
                        bind:show={loginModalVisible}
                    >
                        <SocialLoginButtons />
                    </Modal>
                </div>
            </>
        );
});
