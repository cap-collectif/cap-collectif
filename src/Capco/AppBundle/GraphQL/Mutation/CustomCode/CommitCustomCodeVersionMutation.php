<?php

namespace Capco\AppBundle\GraphQL\Mutation\CustomCode;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\CustomCodeVersioningService;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class CommitCustomCodeVersionMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly CustomCodeVersioningService $customCodeVersioning)
    {
    }

    /**
     * @return array{errorCode?: string|null, customCode?: array<string, mixed>|null, version?: array<string, mixed>|null}
     */
    public function __invoke(Argument $input, ?User $viewer = null): array
    {
        $this->formatInput($input);

        try {
            $version = $this->customCodeVersioning->commit(
                $input->offsetGet('keyname'),
                $input->offsetGet('content'),
                $input->offsetGet('title'),
                $input->offsetGet('authorName'),
                $input->offsetGet('description'),
                $input->offsetGet('referenceUrl'),
                $input->offsetGet('baseContentHash'),
                $viewer
            );
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return [
            'customCode' => $this->findCustomCode($version->getKeyname()),
            'version' => CustomCodeVersioningService::normalizeVersion($version, true),
        ];
    }

    /**
     * @return null|array<string, mixed>
     */
    private function findCustomCode(string $keyname): ?array
    {
        foreach ($this->customCodeVersioning->getConfiguration() as $customCode) {
            if ($customCode['keyname'] === $keyname) {
                return $customCode;
            }
        }

        return null;
    }
}
