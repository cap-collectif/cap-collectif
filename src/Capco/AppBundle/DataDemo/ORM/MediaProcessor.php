<?php

namespace Capco\AppBundle\DataDemo\ORM;

use Nelmio\Alice\ProcessorInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class MediaProcessor implements ProcessorInterface
{
    /**
     * @var ContainerInterface
     */
    protected $container;

    protected $categoryManager;
    protected $contextManager;
    protected $mediaManager;

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;

        $this->categoryManager = $this->container->get('sonata.classification.manager.category');
        $this->contextManager = $this->container->get('sonata.classification.manager.context');
        $this->mediaManager = $this->container->get('sonata.media.manager.media');
    }

    /**
     * {@inheritdoc}
     */
    public function preProcess($object)
    {
        if ($object instanceof \Capco\MediaBundle\Entity\Media) {
            $media = $this->mediaManager->create();
            $media->setBinaryContent(realpath(dirname(__FILE__)).'/'.$object->getBinaryContent());
            $media->setEnabled($object->getEnabled());
            $media->setName($object->getName());
            $media->setContext($object->getContext());
            $this->mediaManager->save($media, 'default', 'sonata.media.provider.image');

            return $media;
        } elseif ($object instanceof \Capco\ClassificationBundle\Entity\Context) {
            $context = $this->contextManager->create();
            $context->setId($object->getId());
            $context->setEnabled($object->getEnabled());
            $context->setName($object->getName());

            $this->contextManager->save($context);

            return $context;
        } elseif ($object instanceof \Capco\ClassificationBundle\Entity\Category) {
            $category = $this->categoryManager->create();
            $category->setName($object->getName());
            $category->setEnabled($object->getEnabled());
            $category->setName($object->getName());
            $category->setContext($object->getContext());

            $this->categoryManager->save($category);

            return $category;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess($object)
    {
    }
}
