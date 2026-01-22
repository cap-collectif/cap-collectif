<?php

namespace Capco\AppBundle\Twig;

use Capco\UserBundle\Entity\User;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Yaml\Yaml;
use Twig\Extension\RuntimeExtensionInterface;

class DevUsersRuntime implements RuntimeExtensionInterface
{
    private const FIXTURE_PATH = '/fixtures/Dev/User.yaml';

    public function __construct(
        private readonly string $projectDir,
        private readonly string $environment,
        private readonly RequestStack $requestStack
    ) {
    }

    public function isQaEnvironment(): bool
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return false;
        }

        $host = $request->getHost();

        return str_ends_with($host, '.qa.cap-collectif.com');
    }

    /**
     * @return array<string, array{email: string, password: string, username: string, role: string}>
     */
    public function getDevUsers(): array
    {
        if ('dev' !== $this->environment && 'test' !== $this->environment && !$this->isQaEnvironment()) {
            return [];
        }

        $fixturesPath = $this->projectDir . self::FIXTURE_PATH;

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
