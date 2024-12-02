<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;

class ProposalSelectionVoteAdmin extends AbstractAdmin
{
    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('proposal', null, ['label' => 'admin.fields.opinion_vote.opinion'])
            ->add('selectionStep', null, ['label' => 'admin.fields.selection.selection_step'])
            ->add('user', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => fn ($entity, $property) => $entity->getEmail() . ' - ' . $entity->getUsername(),
                ],
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('proposal', ModelType::class, ['label' => 'admin.fields.proposal'])
            ->add('user', ModelType::class, ['label' => 'global.author'])
            ->add('collectStep', ModelType::class, ['label' => 'admin.fields.step'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('private', null, ['label' => 'admin.global.private'])
            ->add('username', null, ['label' => 'admin.global.username'])
            ->add('email', null, ['label' => 'admin.global.email'])
            ->add('_action', 'actions', ['actions' => ['show' => []]])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('proposal', ModelType::class, [
                'label' => 'global.argument.label',
            ])
            ->add('user', ModelType::class, ['label' => 'global.author'])
            ->add('createdAt', null, ['label' => 'global.creation'])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->remove('create');
        $collection->remove('edit');
    }
}
