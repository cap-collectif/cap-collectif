<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class ArgumentVoteAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('createdAt', null, array(
                'label' => 'admin.fields.opinion_vote.created_at',
            ))
            ->add('argument', null, array(
                'label' => 'admin.fields.argument_vote.argument',
            ))
            ->add('Voter', null, array(
                'label' => 'admin.fields.argument_vote.voter',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('argument', 'sonata_type_model', array(
                'label' => 'admin.fields.argument_vote.argument',
            ))
            ->add('Voter', 'sonata_type_model', array(
                'label' => 'admin.fields.argument_vote.voter',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.opinion_vote.created_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                )
            ))
        ;
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('argument', 'sonata_type_model', array(
                'label' => 'admin.fields.argument_vote.argument'
            ))
            ->add('Voter', 'sonata_type_model', array(
                'label' => 'admin.fields.argument_vote.voter'
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.argument_vote.created_at'
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('delete');
        $collection->remove('create');
        $collection->remove('edit');
    }
}
