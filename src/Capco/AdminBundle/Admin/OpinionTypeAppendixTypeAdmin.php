<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class OpinionTypeAppendixTypeAdmin extends Admin
{

    protected $formOptions = array(
        'cascade_validation' => true,
    );

    protected $translationDomain = 'SonataAdminBundle';

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

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('create', 'edit', 'delete'));
    }

}
