<?php

namespace Capco\AppBundle\SiteImage;

use ColorThief\ColorThief;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Utils\Text;
use Capco\MediaBundle\Entity\Media;
use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Filesystem\Filesystem;
use Capco\AppBundle\Twig\SiteFaviconExtension;
use Symfony\Component\Serializer\SerializerInterface;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;

class SiteFaviconProcessor
{
    public const DEFAULT_COLOR = '#ffffff';
    public const DEFAULT_NAME = 'Cap Collectif';
    public const WEB_MANIFEST_FILENAME = 'manifest.json';
    public const BROWSERCONFIG_FILENAME = 'browserconfig.xml';

    private $webManifest = [
        'name' => self::DEFAULT_NAME,
        'short_name' => self::DEFAULT_NAME,
        'icons' => [
            [
                'src' => '/android-icon-36x36.png',
                'sizes' => '36x36',
                'type' => 'image/png',
                'density' => '0.75'
            ],
            [
                'src' => '/android-icon-48x48.png',
                'sizes' => '48x48',
                'type' => 'image/png',
                'density' => '1.0'
            ],
            [
                'src' => '/android-icon-72x72.png',
                'sizes' => '72x72',
                'type' => 'image/png',
                'density' => '1.5'
            ],
            [
                'src' => '/android-icon-96x96.png',
                'sizes' => '96x96',
                'type' => 'image/png',
                'density' => '2.0'
            ],
            [
                'src' => '/android-icon-144x144.png',
                'sizes' => '144x144',
                'type' => 'image/png',
                'density' => '3.0'
            ],
            [
                'src' => '/android-icon-192x192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
                'density' => '4.0'
            ]
        ],
        'theme_color' => self::DEFAULT_COLOR,
        'background_color' => self::DEFAULT_COLOR,
        'display' => 'standalone'
    ];

    private $browserConfig = [
        'msapplication' => [
            'tile' => [
                'square70x70logo' => [
                    '@src' => '/ms-icon-70x70.png'
                ],
                'square150x150logo' => [
                    '@src' => '/ms-icon-150x150.png'
                ],
                'square310x310logo' => [
                    '@src' => '/ms-icon-310x310.png'
                ],
                'TileColor' => self::DEFAULT_COLOR
            ]
        ]
    ];

    private $serializer;
    private $siteFaviconExtension;
    private $webDir;
    private $filesystem;
    private $siteResolver;
    private $urlResolver;
    /**
     * @var LoggerInterface
     */
    private $logger;

    public function __construct(
        SiteFaviconExtension $siteFaviconExtension,
        SerializerInterface $serializer,
        LoggerInterface $logger,
        MediaUrlResolver $urlResolver,
        Resolver $siteResolver,
        Filesystem $filesystem,
        string $webDir = ''
    ) {
        $this->serializer = $serializer;
        $this->siteFaviconExtension = $siteFaviconExtension;
        $this->webDir = $webDir;
        $this->filesystem = $filesystem;
        $this->siteResolver = $siteResolver;
        $this->urlResolver = $urlResolver;
        $this->logger = $logger;
    }

    public function process(SiteImage $siteFavicon): void
    {
        if ($siteFavicon->getMedia()) {
            $siteFavicons = $this->siteFaviconExtension->getSiteFavicons();

            try {
                $image = $this->getSourceImageFromMedia($siteFavicon->getMedia());
                if ($image) {
                    list($r, $g, $b) = ColorThief::getColor($image);
                    $color = Text::rgbToHex($r, $g, $b);
                } else {
                    $color = self::DEFAULT_COLOR;
                }
            } catch (\Exception $exception) {
                $color = self::DEFAULT_COLOR;
            }

            $this->generateWebManifestFile($siteFavicons, $siteFavicon, $color);
            $this->generateBrowserConfigFile($siteFavicons, $color);
        } else {
            $this->dumpWebManifestFile();
            $this->dumpBrowserConfigFile();
        }
    }

    private function getSizeFromFilter(string $filter): string
    {
        $exploded = explode('_', $filter);

        return end($exploded);
    }

    private function generateBrowserConfigFile(
        array $siteFavicons,
        ?string $color = self::DEFAULT_COLOR
    ): void {
        foreach (['favicon_70', 'favicon_150', 'favicon_310'] as $filter) {
            $path = $siteFavicons[$filter];
            $size = $this->getSizeFromFilter($filter);

            $tilename = sprintf('square%sx%slogo', $size, $size);
            $this->browserConfig['msapplication']['tile'][$tilename]['@src'] = $path;
        }
        $this->browserConfig['msapplication']['tile']['TileColor'] = $color;

        $this->dumpBrowserConfigFile();
    }

    private function generateWebManifestFile(
        array $siteFavicons,
        SiteImage $siteFavicon,
        ?string $color = self::DEFAULT_COLOR
    ): void {
        $siteName = $this->siteResolver->getValue('global.site.fullname');

        $this->webManifest['name'] = $siteName;
        $this->webManifest['short_name'] = $siteName;
        $this->webManifest['background_color'] = $color;
        $this->webManifest['theme_color'] = $color;
        $this->webManifest['icons'] = [];
        foreach (
            [
                'favicon_36' => '0.75',
                'favicon_48' => '1.0',
                'favicon_72' => '1.5',
                'favicon_96' => '2.0',
                'favicon_144' => '3.0',
                'favicon_192' => '4.0'
            ]
            as $filter => $density
        ) {
            $path = $siteFavicons[$filter];
            $size = $this->getSizeFromFilter($filter);

            $this->webManifest['icons'][] = [
                'src' => $path,
                'sizes' => $size . 'x' . $size,
                'type' => $siteFavicon->getMedia()->getContentType(),
                'density' => $density
            ];
        }

        $this->dumpWebManifestFile();
    }

    private function dumpBrowserConfigFile(): void
    {
        try {
            $this->filesystem->dumpFile(
                $this->webDir . self::BROWSERCONFIG_FILENAME,
                $this->serializer->serialize($this->browserConfig, 'xml', [
                    'xml_root_node_name' => 'browserconfig'
                ])
            );
        } catch (\Exception $exception) {
            $this->logger->error(
                'Could not write browserconfig file into web root. Please check your permissions'
            );
        }
    }

    private function dumpWebManifestFile(): void
    {
        try {
            $this->filesystem->dumpFile(
                $this->webDir . self::WEB_MANIFEST_FILENAME,
                $this->serializer->serialize($this->webManifest, 'json')
            );
        } catch (\Exception $exception) {
            $this->logger->error(
                'Could not write manifest file into web root. Please check your permissions'
            );
        }
    }

    private function getSourceImageFromMedia(Media $media): ?string
    {
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ]
        ]);

        $url = $this->urlResolver->__invoke($media);
        $result = file_get_contents($url, false, $context);
        if (false === $result) {
            $this->logger->error('Could not get content of ' . $url);

            return null;
        }

        return $result;
    }
}
