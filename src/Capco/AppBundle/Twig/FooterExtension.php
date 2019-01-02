<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Capco\AppBundle\Repository\MenuItemRepository;

class FooterExtension extends \Twig_Extension
{
    private $menuItemRepository;
    private $footerSocialNetworkRepository;

    public function __construct(
        MenuItemRepository $menuItemRepository,
        FooterSocialNetworkRepository $footerSocialNetworkRepository
    ) {
        $this->menuItemRepository = $menuItemRepository;
        $this->footerSocialNetworkRepository = $footerSocialNetworkRepository;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('getFooterLinks', [$this, 'getFooterLinks']),
            new \Twig_SimpleFunction('getFooterSocialNetworks', [$this, 'getFooterSocialNetworks']),
        ];
    }

    public function getFooterLinks(): array
    {
        return $this->menuItemRepository->getParentItems(MenuItem::TYPE_FOOTER);
    }

    public function getFooterSocialNetworks(): array
    {
        return $this->footerSocialNetworkRepository->getEnabled();
    }
}
