<?php

namespace Capco\AppBundle\Twig;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Yaml\Yaml;
use Twig\Extension\RuntimeExtensionInterface;

class DevUsersRuntime implements RuntimeExtensionInterface
{
    public function __construct(private readonly string $projectDir, private readonly string $environment)
    {
    }

    /**
     * @return array<string, array{email: string, password: string, username: string, role: string}>
     */
    public function getDevUsers(): array
    {
        if ('dev' !== $this->environment) {
            return [];
        }

        $fixturesPath = $this->projectDir . '/fixtures/Dev/User.yaml';

        if (!file_exists($fixturesPath)) {
            return [];
        }

        $content = file_get_contents($fixturesPath);
        if (false === $content) {
            return [];
        }

        $data = Yaml::parse($content);

        $users = [];
        $entityKey = User::class;

        if (!isset($data[$entityKey])) {
            return [];
        }

        foreach ($data[$entityKey] as $key => $userData) {
            // Skip range definitions like user{6..200}
            if (str_contains((string) $key, '{') && str_contains((string) $key, '}')) {
                continue;
            }

            // Only include users with plainPassword defined
            if (!isset($userData['plainPassword']) && !isset($userData['plainpassword'])) {
                continue;
            }

            $password = $userData['plainPassword'] ?? $userData['plainpassword'] ?? null;
            $email = $userData['email'] ?? null;
            $username = $userData['username'] ?? $key;
            $roles = $userData['roles'] ?? ['ROLE_USER'];

            if (!$email || !$password) {
                continue;
            }

            // Determine a display label based on roles
            $roleLabel = 'user';
            if (\in_array('ROLE_SUPER_ADMIN', $roles, true)) {
                $roleLabel = 'super_admin';
            } elseif (\in_array('ROLE_ADMIN', $roles, true)) {
                $roleLabel = 'admin';
            } elseif (\in_array('ROLE_PROJECT_ADMIN', $roles, true)) {
                $roleLabel = 'project_admin';
            } elseif (\in_array('ROLE_MEDIATOR', $roles, true)) {
                $roleLabel = 'mediator';
            }

            $users[(string) $key] = [
                'email' => (string) $email,
                'password' => (string) $password,
                'username' => (string) $username,
                'role' => $roleLabel,
            ];
        }

        // Sort by role priority: super_admin first, then admin, then others
        uasort($users, static function (array $a, array $b): int {
            $rolePriority = [
                'super_admin' => 0,
                'admin' => 1,
                'project_admin' => 2,
                'mediator' => 3,
                'user' => 4,
            ];

            return $rolePriority[$a['role']] <=> $rolePriority[$b['role']];
        });

        return $users;
    }
}
