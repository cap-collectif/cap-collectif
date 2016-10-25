<?php

namespace Capco\AdminBundle\Block;

use Sonata\AdminBundle\Form\FormMapper;
use Sonata\BlockBundle\Block\BaseBlockService;
use Sonata\BlockBundle\Block\BlockContextInterface;
use Symfony\Bundle\FrameworkBundle\Templating\EngineInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Toggle\Manager;
use Sonata\CoreBundle\Validator\ErrorElement;
use Sonata\BlockBundle\Model\BlockInterface;

class RecentPostBlockService extends BaseBlockService
{
    protected $postRepository;
    protected $toggleManager;

    public function __construct($name, EngineInterface $templating, PostRepository $repository, Manager $manager)
    {
        parent::__construct($name, $templating);

        $this->postRepository = $repository;
        $this->toggleManager = $manager;
    }

    public function buildEditForm(FormMapper $formMapper, BlockInterface $block)
    {
        $formMapper->add('settings', 'sonata_type_immutable_array', [
            'keys' => [
                ['number', 'integer', ['required' => true]],
                ['title', 'text', ['required' => false]],
                ['toggle', 'text', ['required' => false]],
            ],
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function execute(BlockContextInterface $blockContext, Response $response = null)
    {
        if ($flag = $blockContext->getSetting('toggle')) {
            if (!$this->toggleManager->isActive($flag)) {
                return new Response();
            }
        }

        $parameters = [
            'context' => $blockContext,
            'settings' => $blockContext->getSettings(),
            'block' => $blockContext->getBlock(),
            'posts' => $this->postRepository->getRecentPosts($blockContext->getSetting('number')),
        ];

        return $this->renderPrivateResponse($blockContext->getTemplate(), $parameters, $response);
    }

    public function getName()
    {
        return 'Recent Posts';
    }

    public function configureSettings(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'number' => 5,
            'toggle' => false,
            'title' => 'Recent Posts',
            'template' => 'CapcoAdminBundle:Block:recent_posts.html.twig',
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
