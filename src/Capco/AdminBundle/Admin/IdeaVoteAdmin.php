<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class IdeaVoteAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'idea.title',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('idea', null, array(
                'label' => 'admin.fields.idea_vote.idea',
            ))
            ->add('user', null, array(
                'label' => 'admin.fields.idea_vote.user',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.idea_vote.created_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('confirmed', null, [
                'label' => 'admin.fields.idea_vote.confirmed',
            ])
            ->add('idea', 'sonata_type_model', array(
                'label' => 'admin.fields.idea_vote.idea',
            ))
            ->add('private', null, [
                  'label' => 'admin.fields.idea_vote.private',
            ])
            ->add('user', 'sonata_type_model', array(
                'label' => 'admin.fields.idea_vote.user',
            ))
            ->add('username', null, [
                'label' => 'admin.fields.idea_vote.username',
            ])
            ->add('email', null, [
                'label' => 'admin.fields.idea_vote.email',
            ])
            ->add('ipAdress', null, [
                'label' => 'admin.fields.idea_vote.ip',
            ])
            ->add('createdAt', null, array(
                'label' => 'admin.fields.idea_vote.created_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                ),
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('idea', 'sonata_type_model', array(
                    'label' => 'admin.fields.idea_vote.idea',
            ))
            ->add('user', 'sonata_type_model', array(
                    'label' => 'admin.fields.idea_vote.user',
            ))
            ->add('createdAt', null, array(
                    'label' => 'admin.fields.idea_vote.created_at',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('delete');
        $collection->remove('edit');
    }

    public function getFeatures()
    {
        return array(
            'ideas',
        );
    }
}
