<?php

namespace Capco\AdminBundle\Block;

use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Toggle\Manager;
use Sonata\BlockBundle\Block\BlockContextInterface;
use Sonata\BlockBundle\Block\Service\AbstractBlockService;
use Sonata\BlockBundle\Block\Service\EditableBlockService;
use Sonata\BlockBundle\Form\Mapper\FormMapper;
use Sonata\BlockBundle\Meta\Metadata;
use Sonata\BlockBundle\Meta\MetadataInterface;
use Sonata\BlockBundle\Model\BlockInterface;
use Sonata\Form\Validator\ErrorElement;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Twig\Environment;

class RecentPostBlockService extends AbstractBlockService implements EditableBlockService
{
    protected PostRepository $postRepository;
    protected Manager $toggleManager;

    public function __construct(
        Environment $templating,
        PostRepository $repository,
        Manager $manager
    ) {
        parent::__construct($templating);

        $this->postRepository = $repository;
        $this->toggleManager = $manager;
    }

    public function configureCreateForm(FormMapper $form, BlockInterface $block): void
    {
        $this->configureEditForm($form, $block);
    }

    public function configureEditForm(FormMapper $formMapper, BlockInterface $block): void
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
    public function execute(
        BlockContextInterface $blockContext,
        ?Response $response = null
    ): Response {
        if (
            $blockContext->getSetting('toggle')
            && !$this->toggleManager->isActive($blockContext->getSetting('toggle'))
        ) {
            return new Response();
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

    public function configureSettings(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'number' => 5,
            'toggle' => false,
            'title' => 'Recent Posts',
            'template' => '@CapcoAdmin/Block/recent_posts.html.twig',
        ]);
    }

    public function validateBlock(ErrorElement $errorElement, BlockInterface $block)
    {
    }

    public function validate(ErrorElement $errorElement, BlockInterface $block): void
    {
    }

    public function getMetadata(): MetadataInterface
    {
        return new Metadata($this->getName());
    }
}
