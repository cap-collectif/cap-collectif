<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;

class ArgumentVoteAdmin extends AbstractAdmin
{
    protected array $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'argument.title'];

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('argument', null, ['label' => 'global.argument.label'])
            ->add('user', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity, $property) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ]);
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('argument', ModelType::class, [
                'label' => 'global.argument.label',
            ])
            ->add('user', ModelType::class, ['label' => 'global.author'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('_action', 'actions', ['actions' => ['show' => []]]);
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('argument', ModelType::class, [
                'label' => 'global.argument.label',
            ])
            ->add('user', ModelType::class, ['label' => 'global.author'])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->remove('delete');
        $collection->remove('create');
        $collection->remove('edit');
    }
}
