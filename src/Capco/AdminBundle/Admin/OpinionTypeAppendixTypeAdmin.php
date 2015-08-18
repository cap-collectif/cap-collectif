<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Sonata\AdminBundle\Route\RouteCollection;

class OpinionTypeAppendixTypeAdmin extends Admin
{
    // protected $datagridValues = array(
    //     '_sort_order' => 'ASC',
    //     '_sort_by' => 'position',
    // );

    // protected $formOptions = array(
    //     'cascade_validation' => true,
    // );

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('position', null, array(
                'label' => 'admin.fields.consultation_abstractstep.position',
            ))
            ->add('title', null, array(
                'label' => 'admin.fields.step.title',
                'required' => true,
            ))
        ;
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('position', null, array(
                'label' => 'admin.fields.consultation_abstractstep.position',
            ))
            ->add('title', null, array(
                'label' => 'admin.fields.step.title',
                'required' => true,
            ))
        ;
    }

    // protected function configureRoutes(RouteCollection $collection)
    // {
    //     $collection->clearExcept(array('create', 'edit', 'delete'));
    // }

}
