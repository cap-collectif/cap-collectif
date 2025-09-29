<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\MapboxClient;
use Capco\AppBundle\Enum\MapProviderEnum;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MapTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class ChangeMapProviderTokenMutation implements MutationInterface
{
    use MutationTrait;

    final public const ERROR_PROVIDE_BOTH_TOKENS = 'error-map-api-provide-tokens';
    final public const ERROR_INVALID_PUBLIC_TOKEN = 'error-map-api-public-token-invalid';
    final public const ERROR_INVALID_SECRET_TOKEN = 'error-map-api-secret-token-invalid';

    public function __construct(
        private EntityManagerInterface $em,
        private MapboxClient $mapboxClient,
        private MapTokenRepository $repository,
        private LoggerInterface $logger
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        [$provider, $publicToken, $secretToken] = [
            $input->offsetGet('provider'),
            $input->offsetGet('publicToken'),
            $input->offsetGet('secretToken'),
        ];

        if (MapProviderEnum::MAPBOX === $provider) {
            return $this->mutateAndGetMapboxTokenPayload($publicToken, $secretToken);
        }

        return [];
    }

    private function mutateAndGetMapboxTokenPayload(
        ?string $publicToken,
        ?string $secretToken
    ): array {
        $mapboxMapToken = $this->repository->getCurrentMapTokenForProvider(MapProviderEnum::MAPBOX);

        if (!$mapboxMapToken) {
            throw new \RuntimeException('Map Token not found!');
        }

        if ((!$publicToken || '' === $publicToken) && !(!$secretToken || '' === $secretToken)) {
            throw new UserError(self::ERROR_PROVIDE_BOTH_TOKENS);
        }

        if (!(!$publicToken || '' === $publicToken) && (!$secretToken || '' === $secretToken)) {
            throw new UserError(self::ERROR_PROVIDE_BOTH_TOKENS);
        }

        if (
            $publicToken
            && '' !== $publicToken
            && !$this->mapboxClient->isValidToken($publicToken)
        ) {
            $this->logger->error(
                'Invalid public token given for provider ' . MapProviderEnum::MAPBOX
            );

            throw new UserError(self::ERROR_INVALID_PUBLIC_TOKEN);
        }

        if (
            $secretToken
            && '' !== $secretToken
            && !$this->mapboxClient->isValidToken($secretToken, true)
        ) {
            $this->logger->error(
                'Invalid secret token given for provider ' . MapProviderEnum::MAPBOX
            );

            throw new UserError(self::ERROR_INVALID_SECRET_TOKEN);
        }

        $mapboxMapToken->setPublicToken($publicToken)->setSecretToken($secretToken);

        $secretTokenOwner = $secretToken ? $this->mapboxClient->getOwnerForToken($secretToken) : null;
        if ($secretTokenOwner !== $mapboxMapToken->getStyleOwner()) {
            $mapboxMapToken->setStyleId(null)->setStyleOwner(null);
        }

        $this->em->flush();

        return ['mapToken' => $mapboxMapToken];
    }
}
