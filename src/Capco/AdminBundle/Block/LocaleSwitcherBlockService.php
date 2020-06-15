<?php

declare(strict_types=1);

namespace Capco\AdminBundle\Block;

use Sonata\BlockBundle\Block\BlockContextInterface;
use Sonata\BlockBundle\Block\Service\AbstractBlockService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Templating\EngineInterface;

/**
 *  @deprecated
 *  Remove me when we don't need sonata translate anymore
 */
class LocaleSwitcherBlockService extends AbstractBlockService
{
    /**
     * @var bool
     */
    private $showCountryFlags;

    public function __construct(
        ?string $name = null,
        ?EngineInterface $templating = null,
        ?bool $showCountryFlags = true
    ) {
        parent::__construct($name, $templating);
        $this->showCountryFlags = $showCountryFlags;
    }

    /**
     * NEXT_MAJOR: remove this method.
     *
     * @deprecated since 3.x, will be removed in 4.0
     */
    public function setDefaultSettings(OptionsResolverInterface $resolver)
    {
        $this->configureSettings($resolver);
    }

    public function configureSettings(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'admin' => null,
            'object' => null,
            'template' => '@CapcoAdmin/partials/sonata_locale_switcher.html.twig',
            'locale_switcher_route' => null,
            'locale_switcher_route_parameters' => [],
            'locale_switcher_show_country_flags' => $this->showCountryFlags,
        ]);
    }

    public function execute(BlockContextInterface $blockContext, ?Response $response = null)
    {
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
