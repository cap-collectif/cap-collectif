<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\OpinionType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class OpinionTypeAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('position')
            ->add('voteWidgetType')
            ->add('createdAt')
            ->add('color')
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('title')
            ->add('shortName')
            ->add('position')
            ->add('color')
            ->add('voteWidgetType')
            ->add('createdAt')
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
            ->add('title')
            ->add('shortName')
            ->add('position')
            ->add('voteWidgetType')
            ->add('color', 'choice', array('choices' => OpinionType::$colorsType))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title')
            ->add('shortName')
            ->add('position')
            ->add('voteWidgetType')
            ->add('createdAt')
            ->add('updatedAt')
            ->add('color')
        ;
    }
}
