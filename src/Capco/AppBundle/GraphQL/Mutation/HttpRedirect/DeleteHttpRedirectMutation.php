<?php

namespace Capco\AppBundle\GraphQL\Mutation\HttpRedirect;

use Capco\AppBundle\Enum\HttpRedirectErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\HttpRedirect\HttpRedirectCacheInvalidator;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteHttpRedirectMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HttpRedirectRepository $httpRedirectRepository,
        private readonly HttpRedirectCacheInvalidator $httpRedirectCacheInvalidator
    ) {
    }

    /**
     * @return array{deletedRedirectId?: string|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $globalId = (string) $input->offsetGet('id');
        $decodedId = GlobalId::fromGlobalId($globalId)['id'] ?? $globalId;

        $redirect = $this->httpRedirectRepository->find($decodedId);
        if (!$redirect) {
            return ['deletedRedirectId' => null, 'errorCode' => HttpRedirectErrorCode::NOT_FOUND];
        }

        $this->entityManager->remove($redirect);
        $this->entityManager->flush();
        $this->httpRedirectCacheInvalidator->invalidateAll();

        return ['deletedRedirectId' => $globalId, 'errorCode' => null];
    }
}
