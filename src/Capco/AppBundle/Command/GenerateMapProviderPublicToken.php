<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Client\MapboxClient;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Enum\MapProviderEnum;
use Capco\AppBundle\Repository\MapTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class GenerateMapProviderPublicToken extends Command
{
    public const MAPBOX_USERNAME = 'capcollectif';

    public const MAPBOX_PUBLIC_TOKEN_SCOPES = [
        'styles:tiles',
        'styles:read',
        'fonts:read',
        'datasets:read',
    ];

    protected static $defaultName = 'capco:generate:map-token';

    private SymfonyStyle $io;
    private MapboxClient $mapboxClient;
    private MapTokenRepository $mapTokenRepository;
    private EntityManagerInterface $em;
    /**
     * To enable map views, you need a mapbox access token
     * https://www.mapbox.com/
     * "tokens:read", "tokens:write" scopes.
     */
    private string $mapboxSecretKey;
    private string $instanceName;

    public function __construct(
        string $mapboxSecretKey,
        string $instanceName,
        EntityManagerInterface $em,
        MapTokenRepository $mapTokenRepository,
        MapboxClient $mapboxClient,
        ?string $name = null
    ) {
        parent::__construct($name);
        $this->mapboxClient = $mapboxClient;
        $this->mapTokenRepository = $mapTokenRepository;
        $this->em = $em;
        $this->mapboxSecretKey = $mapboxSecretKey;
        $this->instanceName = $instanceName;
    }

    protected function configure(): void
    {
        $this->setDescription('Generate a public token for a given map provider')->addArgument(
            'provider',
            InputArgument::REQUIRED,
            sprintf(
                'Available providers : %s',
                implode(' | ', MapProviderEnum::getAvailableProviders())
            )
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->io = new SymfonyStyle($input, $output);
        $provider = $input->getArgument('provider');

        if (!MapProviderEnum::isProviderValid($provider)) {
            throw new \RuntimeException(sprintf('Invalid provider : "%s"', $provider));
        }
        if (MapProviderEnum::MAPBOX === $provider) {
            return $this->handleMapbox();
        }

        return 1;
    }

    private function handleMapbox(): int
    {
        $sitename = $this->instanceName;
        $provider = $this->mapTokenRepository->getCurrentMapTokenForProvider(
            MapProviderEnum::MAPBOX
        );
        if (!$provider) {
            $this->io->text(
                'No map token provider found for "' . MapProviderEnum::MAPBOX . '", creating one...'
            );
            $provider = (new MapToken())->setProvider(MapProviderEnum::MAPBOX);
            $this->em->persist($provider);
            $this->io->text('Successfully created a token provider');
        }

        if ($provider->getPublicToken()) {
            $this->io->success(
                'The provider for ' . MapProviderEnum::MAPBOX . ' already have a public token.'
            );

            return 0;
        }

        $this->io->title('Generating public token for Mapbox for ' . $sitename);

        if (!$this->mapboxSecretKey || !str_starts_with($this->mapboxSecretKey, 'sk.')) {
            $this->io->error(
                'You need to set a mapbox secret key (sk.xyz…) in the env or .env.local file to generate a public token. You current secret value is : ' .
                    $this->mapboxSecretKey
            );

            return 1;
        }

        $this->io->text('Requesting <info>Mapbox API</info>...');

        $response = $this->mapboxClient
            ->setEndpoint('tokens')
            ->setPath(self::MAPBOX_USERNAME)
            ->addParameter('access_token', $this->mapboxSecretKey)
            ->post([
                'scopes' => self::MAPBOX_PUBLIC_TOKEN_SCOPES,
                'note' => 'Public token for ' . $sitename,
            ])
        ;

        if (isset($response['token'])) {
            $provider->setPublicToken($response['token'])->setSecretToken($this->mapboxSecretKey);
            $this->em->flush();
            $this->io->success(
                sprintf(
                    'Successfully generated public token for "%s" : "%s"',
                    $sitename,
                    $provider->getPublicToken()
                )
            );
        } else {
            $this->io->error('Could not create token.');
            $this->io->write($response);

            return 1;
        }

        return 0;
    }
}
