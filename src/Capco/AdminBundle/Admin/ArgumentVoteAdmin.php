<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class ArgumentVoteAdmin extends Admin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'argument.title'];

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('createdAt', null, ['label' => 'admin.fields.opinion_vote.created_at'])
            ->add('argument', null, ['label' => 'admin.fields.argument_vote.argument'])
            ->add(
                'user',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.argument_vote.voter'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    },
                ]
            );
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('argument', 'sonata_type_model', [
                'label' => 'admin.fields.argument_vote.argument',
            ])
            ->add('user', 'sonata_type_model', ['label' => 'admin.fields.argument_vote.voter'])
            ->add('createdAt', null, ['label' => 'admin.fields.opinion_vote.created_at'])
            ->add('_action', 'actions', ['actions' => ['show' => []]]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('argument', 'sonata_type_model', [
                'label' => 'admin.fields.argument_vote.argument',
            ])
            ->add('user', 'sonata_type_model', ['label' => 'admin.fields.argument_vote.voter'])
            ->add('createdAt', null, ['label' => 'admin.fields.argument_vote.created_at']);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('delete');
        $collection->remove('create');
        $collection->remove('edit');
    }
}
