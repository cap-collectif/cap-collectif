<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Client\MapboxClient;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Enum\MapProviderEnum;
use Capco\AppBundle\Repository\MapTokenRepository;
use Capco\AppBundle\SiteParameter\Resolver;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class GenerateMapProviderPublicToken extends Command
{
    public const MAPBOX_USERNAME = 'capcollectif';

    protected static $defaultName = 'capco:generate:map-token';
    private $siteParameterResolver;
    /**
     * @var SymfonyStyle
     */
    private $io;
    private $mapboxClient;
    private $mapTokenRepository;
    /**
     * @var EntityManagerInterface
     */
    private $em;
    private $mapboxSecretKey;

    public function __construct(
        Resolver $siteParameterResolver,
        string $mapboxSecretKey,
        EntityManagerInterface $em,
        MapTokenRepository $mapTokenRepository,
        MapboxClient $mapboxClient,
        ?string $name = null
    ) {
        parent::__construct($name);
        $this->siteParameterResolver = $siteParameterResolver;
        $this->mapboxClient = $mapboxClient;
        $this->mapTokenRepository = $mapTokenRepository;
        $this->em = $em;
        $this->mapboxSecretKey = $mapboxSecretKey;
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

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->io = new SymfonyStyle($input, $output);
        $provider = $input->getArgument('provider');

        if (!MapProviderEnum::isProviderValid($provider)) {
            throw new \RuntimeException(sprintf('Invalid provider : "%s"', $provider));
        }
        if (MapProviderEnum::MAPBOX === $provider) {
            $this->handleMapbox();
        }
    }

    private function handleMapbox(): ?int
    {
        $MAPBOX = MapProviderEnum::MAPBOX;
        $sitename = $this->siteParameterResolver->getValue('global.site.fullname');
        $provider = $this->mapTokenRepository->getCurrentMapTokenForProvider($MAPBOX);
        if (!$provider) {
            $this->io->text('No map token provider found for "' . $MAPBOX . '", creating one...');
            $provider = (new MapToken())->setProvider($MAPBOX);
            $this->em->persist($provider);
            $this->io->text('Successfully created a token provider');
        }

        if ($provider->getPublicToken()) {
            $this->io->success('The provider for ' . $MAPBOX . ' already have a public token.');

            return 0;
        }

        $this->io->title('Generating public token for Mapbox for ' . $sitename);
        $this->io->text('Requesting <info>Mapbox API</info>...');

        $response = $this->mapboxClient
            ->endpoint('tokens')
            ->path(self::MAPBOX_USERNAME)
            ->addParameter('access_token', $this->mapboxSecretKey)
            ->post([
                'scopes' => ['styles:tiles', 'styles:read', 'fonts:read', 'datasets:read'],
                'note' => 'Public token for ' . $sitename,
            ]);

        if (isset($response['token'])) {
            $provider
                ->setInitialPublicToken($response['token'])
                ->setPublicToken($response['token']);
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
