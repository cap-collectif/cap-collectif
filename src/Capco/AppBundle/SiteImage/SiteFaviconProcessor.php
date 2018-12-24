<?php

namespace Capco\AppBundle\SiteImage;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\AppBundle\Twig\SiteFaviconExtension;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\SerializerInterface;

class SiteFaviconProcessor
{
    public const WEB_MANIFEST_FILENAME = 'manifest.json';
    public const BROWSERCONFIG_FILENAME = 'browserconfig.xml';

    private $webManifest = [
        'name' => 'Cap Collectif',
        'short_name' => 'Cap Collectif',
        'icons' => [
            [
                'src' => '/android-icon-36x36.png',
                'sizes' => '36x36',
                'type' => 'image/png',
                'density' => '0.75',
            ],
            [
                'src' => '/android-icon-48x48.png',
                'sizes' => '48x48',
                'type' => 'image/png',
                'density' => '1.0',
            ],
            [
                'src' => '/android-icon-72x72.png',
                'sizes' => '72x72',
                'type' => 'image/png',
                'density' => '1.5',
            ],
            [
                'src' => '/android-icon-96x96.png',
                'sizes' => '96x96',
                'type' => 'image/png',
                'density' => '2.0',
            ],
            [
                'src' => '/android-icon-144x144.png',
                'sizes' => '144x144',
                'type' => 'image/png',
                'density' => '3.0',
            ],
            [
                'src' => '/android-icon-192x192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
                'density' => '4.0',
            ],
        ],
        'theme_color' => '#ffffff',
        'background_color' => '#ffffff',
        'display' => 'standalone',
    ];

    private $browserConfig = [
        'msapplication' => [
            'tile' => [
                'square70x70logo' => [
                    '@src' => '/ms-icon-70x70.png',
                ],
                'square150x150logo' => [
                    '@src' => '/ms-icon-150x150.png',
                ],
                'square310x310logo' => [
                    '@src' => '/ms-icon-310x310.png',
                ],
                'TileColor' => '#ffffff',
            ],
        ],
    ];

    private $serializer;
    private $siteFaviconExtension;
    private $webDir;
    private $filesystem;
    private $siteResolver;

    public function __construct(
        SiteFaviconExtension $siteFaviconExtension,
        SerializerInterface $serializer,
        Resolver $siteResolver,
        Filesystem $filesystem,
        string $webDir
    ) {
        $this->serializer = $serializer;
        $this->siteFaviconExtension = $siteFaviconExtension;
        $this->webDir = $webDir;
        $this->filesystem = $filesystem;
        $this->siteResolver = $siteResolver;
    }

    public function process(SiteImage $siteFavicon): void
    {
        if ($siteFavicon->getMedia()) {
            $siteName = $this->siteResolver->getValue('global.site.fullname');
            $siteFavicons = $this->siteFaviconExtension->getSiteFavicons();

            $this->generateWebManifestFile($siteName, $siteFavicons);
            $this->generateBrowserConfigFile($siteFavicons);
        } else {
            $this->dumpWebManifestFile();
            $this->dumpBrowserConfigFile();
        }
    }

    private function getSizeAndExtension(string $filter, string $path): array
    {
        $exploded = explode('_', $filter);
        $size = end($exploded);
        $exploded = explode('/', $path);
        $ext = end($exploded);

        return [$size, $ext];
    }

    private function generateBrowserConfigFile(array $siteFavicons): void
    {
        foreach (['favicon_70', 'favicon_150', 'favicon_310'] as $filter) {
            $path = $siteFavicons[$filter];
            list($size) = $this->getSizeAndExtension($filter, $path);

            $tilename = sprintf('square%sx%slogo', $size, $size);
            $this->browserConfig['msapplication']['tile'][$tilename]['@src'] = $path;
        }
        $this->browserConfig['msapplication']['tile']['square150x150logo']['@src'] =
            $siteFavicons['favicon_150'];

        $this->dumpBrowserConfigFile();
    }

    private function generateWebManifestFile(string $siteName, array $siteFavicons): void
    {
        $this->webManifest['name'] = $siteName;
        $this->webManifest['short_name'] = $siteName;
        $this->webManifest['icons'] = [];
        foreach (
            [
                'favicon_36' => '0.75',
                'favicon_48' => '1.0',
                'favicon_72' => '1.5',
                'favicon_96' => '2.0',
                'favicon_144' => '3.0',
                'favicon_192' => '4.0',
            ]
            as $filter => $density
        ) {
            $path = $siteFavicons[$filter];
            list($size, $ext) = $this->getSizeAndExtension($filter, $path);

            $this->webManifest['icons'][] = [
                'src' => $path,
                'sizes' => $size . 'x' . $size,
                'type' => "image/${ext}",
                'density' => $density,
            ];
        }

        $this->dumpWebManifestFile();
    }

    private function dumpBrowserConfigFile(): void
    {
        $this->filesystem->dumpFile(
            $this->webDir . self::BROWSERCONFIG_FILENAME,
            $this->serializer->serialize($this->browserConfig, 'xml', [
                'xml_root_node_name' => 'browserconfig',
            ])
        );
    }

    private function dumpWebManifestFile(): void
    {
        $this->filesystem->dumpFile(
            $this->webDir . self::WEB_MANIFEST_FILENAME,
            $this->serializer->serialize($this->webManifest, 'json')
        );
    }
}
