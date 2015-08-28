<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class OpinionAppendixAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'appendixType.position',
    );

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();

        $formMapper
            ->add('type', 'text', array(
                'label' => 'admin.fields.appendix.type',
                'mapped' => false,
                'data' => $subject->getAppendixType(),
                'attr' => [
                    'read-only' => true,
                    'disabled' => true,
                ],
            ))
            ->add('appendixType', 'hidden', [
                'property_path' => 'appendixType.id',
            ])
            ->add('body', 'ckeditor', array(
                'label' => 'admin.fields.appendix.body',
                'config_name' => 'admin_editor',
                'required' => false,
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('create', 'delete', 'edit'));
    }


}
