<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class ConsultationAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('id')
            ->add('title')
            ->add('slug')
            ->add('teaser')
            ->add('body')
            ->add('createdAt')
            ->add('updatedAt')
            ->add('openedAt')
            ->add('closedAt')
            ->add('opinionCount')
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('id')
            ->add('title')
            ->add('slug')
            ->add('teaser')
            ->add('body')
            ->add('createdAt')
            ->add('updatedAt')
            ->add('openedAt')
            ->add('closedAt')
            ->add('opinionCount')
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                )
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('id')
            ->add('title')
            ->add('slug')
            ->add('teaser')
            ->add('body')
            ->add('createdAt')
            ->add('updatedAt')
            ->add('openedAt')
            ->add('closedAt')
            ->add('opinionCount')
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('id')
            ->add('title')
            ->add('slug')
            ->add('teaser')
            ->add('body')
            ->add('createdAt')
            ->add('updatedAt')
            ->add('openedAt')
            ->add('closedAt')
            ->add('opinionCount')
        ;
    }
}
