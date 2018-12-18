<?php


namespace Capco\AppBundle\GraphQL\Mutation;


use Capco\AppBundle\Client\MapboxClient;
use Capco\AppBundle\Enum\MapProviderEnum;
use Capco\AppBundle\Repository\MapTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;

class ChangeMapProviderTokenMutation implements MutationInterface
{

    public const ERROR_INVALID_PUBLIC_TOKEN = 'Invalid public token';
    public const ERROR_INVALID_SECRET_TOKEN = 'Invalid secret token';

    private const MAPBOX_INVALID_TOKEN_CODES = ['TokenMalformed', 'TokenInvalid', 'TokenExpired', 'TokenRevoked'];

    private $em;
    private $logger;
    private $repository;
    private $mapboxClient;

    public function __construct(
        EntityManagerInterface $em,
        MapboxClient $mapboxClient,
        MapTokenRepository $repository,
        LoggerInterface $logger
    )
    {
        $this->em = $em;
        $this->logger = $logger;
        $this->repository = $repository;
        $this->mapboxClient = $mapboxClient;
    }

    public function __invoke(Argument $input): array
    {
        [$provider, $publicToken, $secretToken] = [
            $input->offsetGet('provider'),
            $input->offsetGet('publicToken'),
            $input->offsetGet('secretToken'),
        ];

        if ($provider === MapProviderEnum::MAPBOX) {
            return $this->mutateAndGetMapboxTokenPayload($publicToken, $secretToken);
        }
    }

    private function mutateAndGetMapboxTokenPayload(string $publicToken, ?string $secretToken): array
    {
        $mapboxMapToken = $this->repository->getCurrentMapTokenForProvider(MapProviderEnum::MAPBOX);

        if (!$mapboxMapToken) {
            throw new \RuntimeException('Map Token not found!');
        }

        if (!$this->isValidToken($publicToken)) {
            $this->logger->error('Invalid public token given for provider ' . MapProviderEnum::MAPBOX);
            throw new UserError(self::ERROR_INVALID_PUBLIC_TOKEN);
        }

        if ($secretToken && $secretToken !== "" && !$this->isValidToken($secretToken)) {
            $this->logger->error('Invalid secret token given for provider ' . MapProviderEnum::MAPBOX);
            throw new UserError(self::ERROR_INVALID_SECRET_TOKEN);
        }

        $mapboxMapToken->setPublicToken($publicToken);
        $mapboxMapToken->setSecretToken($secretToken);

        $this->em->flush();

        return ['mapToken' => $mapboxMapToken];

    }

    private function isValidToken(string $token): bool
    {
        $code = $this->mapboxClient
            ->endpoint('tokens')
            ->addParameter('access_token', $token)
            ->get()['code'];

        return !\in_array($code, self::MAPBOX_INVALID_TOKEN_CODES, true);
    }

}
