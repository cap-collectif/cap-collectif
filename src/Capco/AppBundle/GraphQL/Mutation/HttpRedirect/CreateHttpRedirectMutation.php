<?php

namespace Capco\AppBundle\GraphQL\Mutation\HttpRedirect;

use Capco\AppBundle\Entity\HttpRedirect;
use Capco\AppBundle\Enum\HttpRedirectDuration;
use Capco\AppBundle\Enum\HttpRedirectErrorCode;
use Capco\AppBundle\Enum\HttpRedirectType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\HttpRedirect\HttpRedirectCacheInvalidator;
use Capco\AppBundle\HttpRedirect\HttpRedirectUrlNormalizer;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateHttpRedirectMutation implements MutationInterface
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

        $sourceUrl = $this->urlNormalizer->normalizeSourceUrl((string) $input->offsetGet('sourceUrl'));
        $destinationUrl = trim((string) $input->offsetGet('destinationUrl'));
        $redirectType = (string) ($input->offsetGet('redirectType') ?? HttpRedirectType::REDIRECTION);
        $duration = (string) ($input->offsetGet('duration') ?? (
            HttpRedirectType::URL_SHORTENING === $redirectType
                ? HttpRedirectDuration::TEMPORARY
                : HttpRedirectDuration::PERMANENT
        ));

        if ('' === $sourceUrl || '' === $destinationUrl) {
            return ['redirect' => null, 'errorCode' => HttpRedirectErrorCode::INVALID_URL];
        }

        if ($this->httpRedirectRepository->isSourceUrlUsed($sourceUrl)) {
            return ['redirect' => null, 'errorCode' => HttpRedirectErrorCode::DUPLICATE_URL];
        }

        $redirect = (new HttpRedirect())
            ->setSourceUrl($sourceUrl)
            ->setDestinationUrl($destinationUrl)
            ->setDuration($duration)
            ->setRedirectType($redirectType)
        ;

        $this->entityManager->persist($redirect);
        $this->entityManager->flush();
        $this->httpRedirectCacheInvalidator->invalidateAll();

        return ['redirect' => $redirect, 'errorCode' => null];
    }
}
