<?php

namespace Capco\AppBundle\Block;

use Sonata\BlockBundle\Block\BaseBlockService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Sonata\BlockBundle\Block\BlockContextInterface;

/**
 * Class ShareButtonBlockService.
 */
class ShareButtonBlockService extends BaseBlockService
{
    /**
     * {@inheritdoc}
     */
    public function setDefaultSettings(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'url'            => null,
            'title'          => null,
            'template'       => 'CapcoAppBundle:Block:block_share_button.html.twig',
            'classes'        => null,
            'btn_classes'    => null,
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function execute(BlockContextInterface $blockContext, Response $response = null)
    {
        $parameters = array(
            'context'   => $blockContext,
            'settings'  => $blockContext->getSettings(),
            'block'     => $blockContext->getBlock(),
            'url'     => $blockContext->getSetting('url'),
            'title' => $blockContext->getSetting('title'),
            'classes' => $blockContext->getSetting('classes'),
            'btn_classes' => $blockContext->getSetting('btn_classes'),
        );

        return $this->renderResponse($blockContext->getTemplate(), $parameters, $response);
    }
}
