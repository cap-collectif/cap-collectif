<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SiteColorAdmin extends Admin
{
    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_parameter.is_enabled',
                'required' => false,
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
                'attr' => array('class' => 'minicolors-input'),
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit']);
    }
}
