<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class IdeaVoteAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'Idea.title'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('Idea', null, array(
                'label' => 'admin.fields.idea_vote.idea'
            ))
            ->add('Voter', null, array(
                'label' => 'admin.fields.idea_vote.voter'
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.idea_vote.created_at'
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('Idea', 'sonata_type_model', array(
                'label' => 'admin.fields.idea_vote.idea'
            ))
            ->add('Voter', 'sonata_type_model', array(
                'label' => 'admin.fields.idea_vote.voter'
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.idea_vote.created_at'
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                )
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('Idea', 'sonata_type_model', array(
                    'label' => 'admin.fields.idea_vote.idea'
            ))
            ->add('Voter', 'sonata_type_model', array(
                    'label' => 'admin.fields.idea_vote.voter'
            ))
            ->add('createdAt', null, array(
                    'label' => 'admin.fields.idea_vote.created_at'
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
