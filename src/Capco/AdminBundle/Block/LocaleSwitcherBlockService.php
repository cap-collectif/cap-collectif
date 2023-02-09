<?php

declare(strict_types=1);

namespace Capco\AdminBundle\Block;

use Sonata\BlockBundle\Block\BlockContextInterface;
use Sonata\BlockBundle\Block\Service\AbstractBlockService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 *  @deprecated
 *  Remove me when we don't need sonata translate anymore
 */
class LocaleSwitcherBlockService extends AbstractBlockService
{
    public function configureSettings(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'admin' => null,
            'object' => null,
            'template' => '@CapcoAdmin/partials/sonata_locale_switcher.html.twig',
            'locale_switcher_route' => null,
            'locale_switcher_route_parameters' => [],
            'locale_switcher_show_country_flags' => true,
        ]);
    }

    public function execute(
        BlockContextInterface $blockContext,
        ?Response $response = null
    ): Response {
        return $this->renderPrivateResponse(
            $blockContext->getTemplate(),
            [
                'block_context' => $blockContext,
                'block' => $blockContext->getBlock(),
            ],
            $response
        );
    }
}
