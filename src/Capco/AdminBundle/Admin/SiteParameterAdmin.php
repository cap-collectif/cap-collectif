<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\SiteParameter;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

use Sonata\AdminBundle\Route\RouteCollection;

class SiteParameterAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'position'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.site_parameter.title',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_parameter.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_parameter.updated_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.site_parameter.title',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.site_parameter.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_parameter.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
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

        } else if ($subject->getType() == $types['rich_text']) {
            $formMapper->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'attr' => array('class' => 'ckeditor'),
            ));

        } else if ($subject->getType() == $types['integer']) {
            $formMapper->add('value', 'integer', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));

        } else if ($subject->getType() == $types['javascript']) {
            $formMapper->add('value', 'textarea', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'help' => 'admin.help.site_parameter.js',
                'attr' => array('rows' => 10, 'placeholder' => '<script type="text/javascript"> </script>'),
            ));

        } else if ($subject->getType() == $types['email']) {
            $formMapper->add('value', 'email', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
                'attr' => array('placeholder' => 'hello@exemple.com'),
            ));

        } else if ($subject->getType() == $types['intern_url']) {
            $formMapper->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));

        } else if ($subject->getType() == $types['url']) {
            $formMapper->add('value', 'url', array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));

        } else if ($subject->getType() == $types['tel']) {
            $formMapper->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
                'required' => false,
            ));
            
        } else if ($subject->getType() == $types['boolean']) {
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

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.site_parameter.title',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_parameter.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.site_parameter.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_parameter.updated_at',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('delete');
    }
}
