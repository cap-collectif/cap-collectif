<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\SiteParameter;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SiteParameterAdmin extends Admin
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
        ;

        $subject = $this->getSubject();
        $types = SiteParameter::$types;

        if ($subject->getType() == $types['simple_text']) {
            $formMapper->add('value', 'text', array(
                    'label' => 'admin.fields.site_parameter.value',
                    'required' => false,
                ));
        } elseif ($subject->getType() == $types['rich_text']) {
            $formMapper->add('value', 'ckeditor', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'config_name' => 'admin_editor',
            ));
        } elseif ($subject->getType() == $types['integer']) {
            $formMapper->add('value', 'integer', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));
        } elseif ($subject->getType() == $types['javascript']) {
            $formMapper->add('value', 'textarea', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => 'admin.help.site_parameter.js',
                'attr' => array('rows' => 10, 'placeholder' => '<script type="text/javascript"> </script>'),
            ));
        } elseif ($subject->getType() == $types['email']) {
            $formMapper->add('value', 'email', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'attr' => array('placeholder' => 'hello@exemple.com'),
            ));
        } elseif ($subject->getType() == $types['intern_url']) {
            $formMapper->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));
        } elseif ($subject->getType() == $types['url']) {
            $formMapper->add('value', 'url', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));
        } elseif ($subject->getType() == $types['tel']) {
            $formMapper->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));
        } elseif ($subject->getType() == $types['boolean']) {
            $formMapper->add('value', 'choice', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'choices' => array('1' => 'Activé', '0' => 'Désactivé'),
            ));
        } else {
            $formMapper->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit']);
    }
}
