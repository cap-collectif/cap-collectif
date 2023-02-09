<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;

class CommentVoteAdmin extends AbstractAdmin
{
    protected array $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'createdAt'];

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('comment', null, ['label' => 'global.comment'])
            ->add('user', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'admin.fields.comment_vote.voter',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ]);
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('comment', ModelType::class, ['label' => 'global.comment'])
            ->add('user', ModelType::class, ['label' => 'admin.fields.comment_vote.voter'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('_action', 'actions', ['actions' => ['show' => []]]);
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('comment', ModelType::class, ['label' => 'global.comment'])
            ->add('user', ModelType::class, ['label' => 'admin.fields.comment_vote.voter'])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->remove('delete');
        $collection->remove('create');
        $collection->remove('edit');
    }
}
