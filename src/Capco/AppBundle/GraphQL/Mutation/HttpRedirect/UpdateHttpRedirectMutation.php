<?php

namespace Capco\AppBundle\GraphQL\Mutation\HttpRedirect;

use Capco\AppBundle\Entity\HttpRedirect;
use Capco\AppBundle\Enum\HttpRedirectErrorCode;
use Capco\AppBundle\Enum\HttpRedirectType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\HttpRedirect\HttpRedirectCacheInvalidator;
use Capco\AppBundle\HttpRedirect\HttpRedirectUrlNormalizer;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class UpdateHttpRedirectMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HttpRedirectRepository $httpRedirectRepository,
        private readonly HttpRedirectUrlNormalizer $urlNormalizer,
        private readonly HttpRedirectCacheInvalidator $httpRedirectCacheInvalidator
    ) {
    }

    /**
     * @return array{redirect?: HttpRedirect|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $id = (string) $input->offsetGet('id');
        $decodedId = GlobalId::fromGlobalId($id)['id'] ?? $id;

        $redirect = $this->httpRedirectRepository->find($decodedId);
        if (!$redirect instanceof HttpRedirect) {
            return ['redirect' => null, 'errorCode' => HttpRedirectErrorCode::NOT_FOUND];
        }

        $sourceUrl = $this->urlNormalizer->normalizeSourceUrl((string) $input->offsetGet('sourceUrl'));
        $destinationUrl = trim((string) $input->offsetGet('destinationUrl'));
        $duration = (string) $input->offsetGet('duration');
        $redirectType = (string) ($input->offsetGet('redirectType') ?? $redirect->getRedirectType());

        if ('' === $sourceUrl || '' === $destinationUrl) {
            return ['redirect' => null, 'errorCode' => HttpRedirectErrorCode::INVALID_URL];
        }

        if ('' === $redirectType) {
            $redirectType = HttpRedirectType::REDIRECTION;
        }

        if ($this->httpRedirectRepository->isSourceUrlUsed($sourceUrl, $redirect->getId())) {
            return ['redirect' => null, 'errorCode' => HttpRedirectErrorCode::DUPLICATE_URL];
        }

        $redirect
            ->setSourceUrl($sourceUrl)
            ->setDestinationUrl($destinationUrl)
            ->setDuration($duration)
            ->setRedirectType($redirectType)
        ;

        $this->entityManager->flush();
        $this->httpRedirectCacheInvalidator->invalidateAll();

        return ['redirect' => $redirect, 'errorCode' => null];
    }
}
