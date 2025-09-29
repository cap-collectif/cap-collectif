<?php

namespace Capco\AdminBundle\Block;

use Capco\AdminBundle\Resolver\RecentContributionsResolver;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\BlockBundle\Block\BlockContextInterface;
use Sonata\BlockBundle\Block\Service\AbstractBlockService;
use Sonata\BlockBundle\Model\BlockInterface;
use Sonata\Form\Validator\ErrorElement;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Twig\Environment;

class RecentContributionsBlockService extends AbstractBlockService
{
    public function __construct(
        Environment $templating,
        protected RecentContributionsResolver $resolver
    ) {
        parent::__construct($templating);
    }

    public function buildEditForm(FormMapper $formMapper, BlockInterface $block)
    {
        $formMapper->add('settings', 'sonata_type_immutable_array', [
            'keys' => [
                ['number', 'integer', ['required' => true]],
                ['title', 'text', ['required' => false]],
            ],
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function execute(
        BlockContextInterface $blockContext,
        ?Response $response = null
    ): Response {
        $contributions = $this->resolver->getRecentContributions(10);

        $parameters = [
            'context' => $blockContext,
            'settings' => $blockContext->getSettings(),
            'block' => $blockContext->getBlock(),
            'contributions' => $contributions,
        ];

        return $this->renderPrivateResponse($blockContext->getTemplate(), $parameters, $response);
    }

    public function getName()
    {
        return 'recent_contributions';
    }

    /**
     * {@inheritdoc}
     */
    public function configureSettings(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'number' => 10,
            'title' => 'Recents contributions',
            'template' => '@CapcoAdmin/Block/recent_contributions.html.twig',
        ]);
    }

    public function validateBlock(ErrorElement $errorElement, BlockInterface $block)
    {
    }
}
