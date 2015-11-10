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

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    protected $translationDomain = 'SonataAdminBundle';

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('position', null, array(
                'label' => 'admin.fields.opiniontype_appendixtype.position',
            ))
            ->add('appendixType', 'sonata_type_model', array(
                'label' => 'admin.fields.opiniontype_appendixtype.appendix_type',
                'required' => true,
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('create', 'edit', 'delete'));
    }
}
