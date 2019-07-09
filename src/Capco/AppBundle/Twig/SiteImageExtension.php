<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\Resolver;
use Symfony\Component\DependencyInjection\ContainerInterface;

class SiteImageExtension extends \Twig_Extension
{
    protected $resolver;
    private $repository;
    private $container;
    private $kernelEnvironment;

    public function __construct(
        Resolver $resolver,
        SiteImageRepository $repository,
        ContainerInterface $container,
        string $kernelEnvironment
    ) {
        $this->resolver = $resolver;
        $this->repository = $repository;
        $this->container = $container;
        $this->kernelEnvironment = $kernelEnvironment;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction(
                'capco_site_image_media',
                [$this, 'getSiteImageMedia'],
                ['is_safe' => ['html']]
            ),
            new \Twig_SimpleFunction(
                'app_logo_url',
                [$this, 'getAppLogourl'],
                ['is_safe' => ['html']]
            ),
        ];
    }

    public function getAppLogoUrl(): ?string
    {
        $logo = $this->repository->getAppLogo();

        /* TODO: Temp hack to allow snapshot email testing to not include link
        for a Media, because they are generated at each db regenerate, and we
        cannot set the providerReference to something predictable, so this
        allows our mail to, only in dev and test mode, render the website logo
        by using the static icon 'apple-icon-76x76.png' (see file `notifyQuestionnaireReply.html.twig:15`)
        */
        if (\in_array($this->kernelEnvironment, ['dev', 'test'], true)) {
            return null;
        }

        if (!$logo) {
            return null;
        }

        $logo = $logo->getMedia();

        if (!$logo) {
            return null;
        }

        $provider = $this->container->get($logo->getProviderName());

        return $provider->generatePublicUrl($logo, 'default_logo');
    }

    public function getSiteImageMedia($key)
    {
        return $this->resolver->getMedia($key);
    }
}
