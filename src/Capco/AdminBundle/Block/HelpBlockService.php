<?php

namespace Capco\AdminBundle\Block;

use Sonata\BlockBundle\Block\BlockContextInterface;
use Sonata\BlockBundle\Block\Service\AbstractBlockService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolver;

class HelpBlockService extends AbstractBlockService
{
    public function getName()
    {
        return 'Besoin d\'aide ?';
    }

    public function execute(
        BlockContextInterface $blockContext,
        ?Response $response = null
    ): Response {
        return $this->renderResponse(
            $blockContext->getTemplate(),
            ['settings' => $blockContext->getSettings(), 'block' => $blockContext->getBlock()],
            $response
        );
    }

    public function configureSettings(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'title' => 'Besoin d\'aide ?',
            'template' => '@CapcoAdmin/Block/help.html.twig',
        ]);
    }
}
