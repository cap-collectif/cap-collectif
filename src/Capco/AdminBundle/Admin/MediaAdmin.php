<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\BlockBundle\Meta\Metadata;
use Sonata\DoctrineORMAdminBundle\Filter\ChoiceFilter;
use Sonata\MediaBundle\Admin\BaseMediaAdmin;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class MediaAdmin extends BaseMediaAdmin
{
    public function getObjectMetadata($object)
    {
        $provider = $this->getConfigurationPool()
            ->getContainer()
            ->get($object->getProviderName());
        $url = $provider->generatePublicUrl($object, 'default_theme');

        return new Metadata($object->getName(), $object->getDescription(), $url);
    }

    /**
     * {@inheritdoc}
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $options = [
            'choices' => []
        ];

        foreach ($this->pool->getContexts() as $name => $context) {
            $options['choices'][$name] = $name;
        }

        $datagridMapper
            ->add('name')
            ->add('providerReference')
            ->add('enabled')
            ->add(
                'context',
                null,
                [
                    'show_filter' => true !== $this->getPersistentParameter('hide_context')
                ],
                ChoiceType::class,
                $options
            );

        if (null !== $this->categoryManager) {
            $datagridMapper->add('category', null, ['show_filter' => false]);
        }

        $datagridMapper
            ->add('width')
            ->add('height')
            ->add('contentType');

        $providers = [];

        $providerNames = (array) $this->pool->getProviderNamesByContext(
            $this->getPersistentParameter('context', $this->pool->getDefaultContext())
        );
        foreach ($providerNames as $name) {
            $providers[$name] = $name;
        }

        $datagridMapper->add('providerName', ChoiceFilter::class, [
            'field_options' => [
                'choices' => $providers,
                'required' => false,
                'multiple' => false,
                'expanded' => false
            ],
            'field_type' => ChoiceType::class
        ]);
    }
}
