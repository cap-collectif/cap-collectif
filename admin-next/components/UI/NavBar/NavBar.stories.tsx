import { Meta, Story } from '@storybook/react';
import { NavBar } from './';
import { Avatar, CapUIIcon, CapUIIconSize, Icon, Menu, Spinner, Text } from '@cap-collectif/ui';

type NavData = {
    number: {
        color: string,
        label: string,
    }
    label: string
}

type StoryProps = {
    saving?: boolean,
    withMultilingual?: boolean,
    data?: NavData[]
};

const meta: Meta<StoryProps> = {
    title: 'Admin-next/NavBar',
    component: NavBar,
    args: {
        data: [
            {
                label: 'projects',
                number: {
                    color: 'blue.600',
                    label: '2'
                }
            },
            {
                label: 'proposals',
                number: {
                    color: 'red.600',
                    label: '2'
                }
            }
        ],
        withMultilingual: false,
        saving: false,
    },
    parameters: {
        controls: { expanded: true },
    },
};

export default meta;

const Template: Story<StoryProps> = args => (
    <NavBar>
        <NavBar.Title>Home</NavBar.Title>

        {args.saving && (
            <NavBar.List ml="auto" mr={4} spacing={2} color="gray.500">
                <Spinner />
                <Text>Saving</Text>
            </NavBar.List>
        )}

        {args.data && args.data.length > 0 && (
            <NavBar.List ml={args.saving ? 0 : 'auto'} mr={4} spacing={4}>
                {args.data.map((data, idx) => (
                    <NavBar.Data key={`data-${idx}`}>
                        <Text as="span" color={data.number.color}>
                            {data.number.label}
                        </Text>{' '}
                        {data.label}
                    </NavBar.Data>
                ))}
            </NavBar.List>
        )}

        <NavBar.List>
            {args.withMultilingual && (
                <Menu
                    disclosure={<NavBar.Item />}
                    value={{
                        value: 'en-GB',
                        label: '🇬🇧 English',
                    }}
                >
                    <Menu.List>
                        <Menu.Item
                            value={{
                                value: 'fr-FR',
                                label: '🇫🇷 French',
                            }}
                        >
                            🇫🇷 French
                        </Menu.Item>
                        <Menu.Item
                            value={{
                                value: 'de-DE',
                                label: '🇩🇪 German',
                            }}
                        >
                            🇩🇪 German
                        </Menu.Item>
                    </Menu.List>
                </Menu>
            )}

            <NavBar.Item className="beamerTrigger">
                <Icon name={CapUIIcon.Bell} size={CapUIIconSize.Md} />
            </NavBar.Item>

            <Menu
                disclosure={
                    <NavBar.Item spacing={2}>
                        <Avatar name="Vince" src="https://picsum.photos/200/300" size="sm" />
                        <Text>Vince</Text>
                    </NavBar.Item>
                }
            >
                <Menu.List>
                    <Menu.Item>
                        <Icon name={CapUIIcon.User} color="gray.500" />
                        <Text ml={1}>Profile</Text>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name={CapUIIcon.Home} color="gray.500" />
                        <Text ml={1}>Platform</Text>
                    </Menu.Item>
                    <Menu.Item>
                        <Icon name={CapUIIcon.Logout} color="gray.500" />
                        <Text ml={1}>Disconnect</Text>
                    </Menu.Item>
                </Menu.List>
            </Menu>
        </NavBar.List>
    </NavBar>
);

export const Default = Template.bind({});

export const WithData = Template.bind({});
WithData.args = {
    data: [
        {
            label: 'projects',
            number: {
                color: 'blue.600',
                label: '2'
            }
        },
        {
            label: 'proposals',
            number: {
                color: 'red.600',
                label: '2'
            }
        }
    ]
};

export const Saving = Template.bind({});
Saving.args = {
    saving: true,
    data: []
};

export const WithMultilingual = Template.bind({});
WithMultilingual.args = {
    withMultilingual: true
};