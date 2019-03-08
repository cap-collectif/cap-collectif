<?php

namespace Capco\AdminBundle\Block;

use Capco\AdminBundle\Resolver\RecentContributionsResolver;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\BlockBundle\Block\AbstractAdminBlockService;
use Sonata\BlockBundle\Block\BlockContextInterface;
use Sonata\BlockBundle\Model\BlockInterface;
use Sonata\CoreBundle\Validator\ErrorElement;
use Symfony\Bundle\FrameworkBundle\Templating\EngineInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolver;

class RecentContributionsBlockService extends AbstractAdminBlockService
{
    protected $resolver;

    public function __construct(
        $name,
        EngineInterface $templating,
        RecentContributionsResolver $resolver
    ) {
        parent::__construct($name, $templating);
        $this->resolver = $resolver;
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
    public function execute(BlockContextInterface $blockContext, Response $response = null)
    {
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
    public function configureSettings(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'number' => 10,
            'title' => 'Recents contributions',
            'template' => 'CapcoAdminBundle:Block:recent_contributions.html.twig',
        ]);
    }

    /**
     * @param ErrorElement   $errorElement
     * @param BlockInterface $block
     */
    public function validateBlock(ErrorElement $errorElement, BlockInterface $block)
    {
    }
}
