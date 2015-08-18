<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\OpinionAppendix;

class OpinionAppendixAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'opinion.title',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('opinion', null, array(
                'label' => 'admin.fields.appendix.opinion',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.appendix.body',
            ))
            ->add('opinionTypeAppendixType', null, array(
                'label' => 'admin.fields.appendix.type',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('opinion', null, array(
                'label' => 'admin.fields.appendix.opinion',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.appendix.body',
            ))
            ->add('opinionTypeAppendixType', null, array(
                'label' => 'admin.fields.appendix.type',
            ))
        ;

    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('opinion', null, array(
                'label' => 'admin.fields.appendix.opinion',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.appendix.body',
            ))
            ->add('opinionTypeAppendixType', null, array(
                'label' => 'admin.fields.appendix.type',
            ))
        ;

    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('opinion', null, array(
                'label' => 'admin.fields.appendix.opinion',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.appendix.body',
            ))
            ->add('opinionTypeAppendixType', null, array(
                'label' => 'admin.fields.appendix.type',
            ))
        ;
    }
}
