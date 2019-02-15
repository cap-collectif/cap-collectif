<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class CommentVoteAdmin extends Admin
{
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'createdAt'];

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('createdAt', null, ['label' => 'admin.fields.comment_vote.created_at'])
            ->add('comment', null, ['label' => 'admin.fields.comment_vote.comment'])
            ->add(
                'user',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.comment_vote.voter'],
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
            ->add('comment', 'sonata_type_model', ['label' => 'admin.fields.comment_vote.comment'])
            ->add('user', 'sonata_type_model', ['label' => 'admin.fields.comment_vote.voter'])
            ->add('createdAt', null, ['label' => 'admin.fields.comment_vote.created_at'])
            ->add('_action', 'actions', ['actions' => ['show' => []]]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('comment', 'sonata_type_model', ['label' => 'admin.fields.comment_vote.comment'])
            ->add('user', 'sonata_type_model', ['label' => 'admin.fields.comment_vote.voter'])
            ->add('createdAt', null, ['label' => 'admin.fields.comment_vote.created_at']);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('delete');
        $collection->remove('create');
        $collection->remove('edit');
    }
}
